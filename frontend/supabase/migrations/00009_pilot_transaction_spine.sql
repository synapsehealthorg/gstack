-- Pilot transaction spine: one authorized RFQ -> bid -> order -> manual escrow lifecycle.

-- The previous workspace policy allowed either party to write arbitrary order states.
drop policy if exists "Order parties update workspace state" on public.orders;
alter table public.order_milestones enable row level security;

-- Admins need read access to operate manual escrow and disputes.
do $$ begin
  create policy "Admins read all orders" on public.orders for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins read all order products" on public.order_products for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins read all order messages" on public.messages for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Order parties read milestones" on public.order_milestones for select using (
    exists (select 1 from public.orders o where o.id = order_milestones.order_id and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid()))
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins read all milestone events" on public.milestone_events for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

create unique index if not exists escrow_ledger_reference_unique
  on public.escrow_ledger_entries (order_id, entry_type, reference)
  where reference is not null and reference <> '';

-- Onboarding is one idempotent database operation instead of three partial writes.
create or replace function public.complete_pilot_onboarding(selected_role text, selected_full_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_record auth.users%rowtype;
  generated_username text;
  existing_role text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if selected_role not in ('buyer', 'manufacturer') then raise exception 'Invalid role'; end if;
  if nullif(trim(selected_full_name), '') is null then raise exception 'Full name is required'; end if;

  select * into auth_user_record from auth.users where id = auth.uid();
  select user_type into existing_role from public.profiles where id = auth.uid();
  if existing_role is not null and existing_role <> selected_role then raise exception 'Role cannot be changed after onboarding'; end if;
  generated_username := regexp_replace(lower(trim(selected_full_name)), '[^a-z0-9]+', '-', 'g');
  generated_username := coalesce(nullif(trim(both '-' from generated_username), ''), 'user') || '-' || left(auth.uid()::text, 4);

  insert into public.profiles (id, email, full_name, user_type, username)
  values (auth.uid(), auth_user_record.email, trim(selected_full_name), selected_role, generated_username)
  on conflict (id) do update set
    full_name = excluded.full_name,
    user_type = excluded.user_type,
    username = coalesce(public.profiles.username, excluded.username),
    updated_at = now();

  if selected_role = 'manufacturer' then
    insert into public.manufacturer_profiles (id, company_name)
    values (auth.uid(), trim(selected_full_name) || ' Company')
    on conflict (id) do update set company_name = coalesce(public.manufacturer_profiles.company_name, excluded.company_name);
    delete from public.buyer_profiles where id = auth.uid();
  else
    insert into public.buyer_profiles (id) values (auth.uid()) on conflict (id) do nothing;
    delete from public.manufacturer_profiles where id = auth.uid();
  end if;
  return true;
end;
$$;

revoke all on function public.complete_pilot_onboarding(text, text) from public;
grant execute on function public.complete_pilot_onboarding(text, text) to authenticated;

-- Every accepted order receives the same auditable milestone contract.
create or replace function public.initialize_pilot_order_milestones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requires_sample boolean;
  total numeric;
begin
  select coalesce(sample_required, false) into requires_sample from public.inquiries where id = new.inquiry_id;
  total := coalesce(new.order_total, new.agreed_price, 0);

  if requires_sample then
    insert into public.order_milestones (order_id, milestone_number, title, description, percentage, amount, status)
    values (new.id, 0, 'Sample approval', 'Buyer approves the pre-production sample.', 0, 0, 'pending');
  end if;

  insert into public.order_milestones (order_id, milestone_number, title, description, percentage, amount, status)
  values
    (new.id, 1, 'Production start', 'Escrow is recorded and production begins.', 40, total * 0.40, 'pending'),
    (new.id, 2, 'Quality check', 'Manufacturer submits QC evidence and buyer approves it.', 30, total * 0.30, 'pending'),
    (new.id, 3, 'Delivery', 'Tracking and receipt confirmation close the order.', 30, total * 0.30, 'pending');
  return new;
end;
$$;

drop trigger if exists initialize_pilot_order_milestones on public.orders;
create trigger initialize_pilot_order_milestones
after insert on public.orders for each row execute function public.initialize_pilot_order_milestones();

insert into public.order_milestones (order_id, milestone_number, title, description, percentage, amount, status)
select o.id, values_row.milestone_number, values_row.title, values_row.description, values_row.percentage,
  coalesce(o.order_total, o.agreed_price, 0) * values_row.percentage / 100, 'pending'
from public.orders o
cross join (values
  (1, 'Production start', 'Escrow is recorded and production begins.', 40),
  (2, 'Quality check', 'Manufacturer submits QC evidence and buyer approves it.', 30),
  (3, 'Delivery', 'Tracking and receipt confirmation close the order.', 30)
) as values_row(milestone_number, title, description, percentage)
where not exists (select 1 from public.order_milestones m where m.order_id = o.id and m.milestone_number = values_row.milestone_number);

-- Role-checked lifecycle transitions. Direct order updates remain unavailable to parties.
create or replace function public.transition_order_lifecycle(
  target_order_id uuid,
  lifecycle_action text,
  event_notes text default null,
  event_proof_urls text[] default '{}',
  shipment_carrier text default null,
  shipment_tracking text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  actor_role text;
  other_party uuid;
  next_status public.order_status;
  event_label text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select user_type into actor_role from public.profiles where id = auth.uid();
  select * into target_order from public.orders where id = target_order_id for update;
  if target_order.id is null then raise exception 'Order not found'; end if;
  if auth.uid() not in (target_order.buyer_id, target_order.manufacturer_id) then raise exception 'Only order parties can perform lifecycle actions'; end if;
  if target_order.status in ('completed', 'disputed') then raise exception 'This order is locked'; end if;
  other_party := case when auth.uid() = target_order.buyer_id then target_order.manufacturer_id else target_order.buyer_id end;
  next_status := target_order.status;

  case lifecycle_action
    when 'start_production' then
      if auth.uid() <> target_order.manufacturer_id then raise exception 'Only the manufacturer can start production'; end if;
      if target_order.escrow_status = 'pending' or target_order.status not in ('confirmed', 'sampling') then raise exception 'Funded escrow and a confirmed or sampling order are required'; end if;
      next_status := 'in_production'; event_label := 'Production started';
      update public.order_milestones set status = 'completed', completed_at = now() where order_id = target_order_id and milestone_number = 1;
    when 'approve_sample' then
      if auth.uid() <> target_order.buyer_id or target_order.status <> 'sampling' then raise exception 'Only the buyer can approve the current sample'; end if;
      next_status := 'in_production'; event_label := 'Sample approved';
      update public.order_milestones set status = 'completed', completed_at = now() where order_id = target_order_id and milestone_number = 0;
      update public.order_milestones set status = 'in_progress' where order_id = target_order_id and milestone_number = 1;
    when 'submit_qc' then
      if auth.uid() <> target_order.manufacturer_id or target_order.status <> 'in_production' then raise exception 'Only the manufacturer can submit QC from production'; end if;
      if coalesce(array_length(event_proof_urls, 1), 0) = 0 then raise exception 'QC evidence is required'; end if;
      next_status := 'quality_check'; event_label := 'QC evidence submitted';
      update public.order_milestones set status = 'in_progress', proof_urls = event_proof_urls where order_id = target_order_id and milestone_number = 2;
    when 'approve_qc' then
      if auth.uid() <> target_order.buyer_id or target_order.status <> 'quality_check' then raise exception 'Only the buyer can approve QC'; end if;
      event_label := 'QC approved';
      update public.order_milestones set status = 'completed', completed_at = now() where order_id = target_order_id and milestone_number = 2;
    when 'request_qc_changes' then
      if auth.uid() <> target_order.buyer_id or target_order.status <> 'quality_check' then raise exception 'Only the buyer can request QC changes'; end if;
      next_status := 'in_production'; event_label := 'QC changes requested';
      update public.order_milestones set status = 'pending', completed_at = null where order_id = target_order_id and milestone_number = 2;
    when 'mark_shipped' then
      if auth.uid() <> target_order.manufacturer_id or target_order.status <> 'quality_check' then raise exception 'Only the manufacturer can ship an approved QC order'; end if;
      if not exists (select 1 from public.milestone_events where order_id = target_order_id and event_type = 'approve_qc') then raise exception 'Buyer QC approval is required'; end if;
      if nullif(trim(shipment_tracking), '') is null then raise exception 'Tracking number is required'; end if;
      next_status := 'shipped'; event_label := 'Order shipped';
      update public.orders set tracking_number = trim(shipment_tracking), carrier = nullif(trim(shipment_carrier), '') where id = target_order_id;
      update public.order_milestones set status = 'in_progress' where order_id = target_order_id and milestone_number = 3;
    when 'mark_delivered' then
      if auth.uid() <> target_order.manufacturer_id or target_order.status <> 'shipped' then raise exception 'Only the manufacturer can mark a shipped order delivered'; end if;
      next_status := 'delivered'; event_label := 'Order marked delivered';
    when 'confirm_delivery' then
      if auth.uid() <> target_order.buyer_id or target_order.status not in ('shipped', 'delivered') then raise exception 'Only the buyer can confirm a shipped delivery'; end if;
      next_status := 'completed'; event_label := 'Delivery confirmed';
      update public.order_milestones set status = 'completed', completed_at = now() where order_id = target_order_id and milestone_number = 3;
    when 'file_dispute' then
      if nullif(trim(event_notes), '') is null then raise exception 'Dispute details are required'; end if;
      next_status := 'disputed'; event_label := 'Dispute filed';
      insert into public.disputes (order_id, filed_by, reason, description, evidence_urls)
      values (target_order_id, auth.uid(), 'other', trim(event_notes), event_proof_urls);
    else
      raise exception 'Unsupported lifecycle action';
  end case;

  update public.orders set status = next_status where id = target_order_id;
  insert into public.milestone_events (order_id, actor_id, event_type, proof_urls, notes)
  values (target_order_id, auth.uid(), lifecycle_action, event_proof_urls, event_notes);
  insert into public.messages (order_id, sender_id, content, message_type, event_type, metadata)
  values (target_order_id, auth.uid(), event_label, 'system', lifecycle_action, jsonb_build_object('actor_role', actor_role));
  insert into public.notifications (user_id, actor_id, order_id, type, title, body)
  values (other_party, auth.uid(), target_order_id, 'order_' || lifecycle_action, event_label, event_notes);
  return target_order_id;
end;
$$;

revoke all on function public.transition_order_lifecycle(uuid, text, text, text[], text, text) from public;
grant execute on function public.transition_order_lifecycle(uuid, text, text, text[], text, text) to authenticated;

-- Admin-only manual escrow ledger. References make retries idempotent.
create or replace function public.record_manual_escrow(
  target_order_id uuid,
  ledger_entry_type text,
  ledger_amount numeric,
  ledger_currency text,
  ledger_reference text,
  ledger_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  ledger_id uuid;
  released_total numeric;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and user_type = 'admin') then raise exception 'Admin access required'; end if;
  if ledger_entry_type not in ('manual_funding', 'milestone_release', 'refund', 'adjustment') then raise exception 'Unsupported escrow entry'; end if;
  if ledger_amount <= 0 then raise exception 'Amount must be positive'; end if;
  if nullif(trim(ledger_reference), '') is null then raise exception 'Payment reference is required'; end if;

  select * into target_order from public.orders where id = target_order_id for update;
  if target_order.id is null then raise exception 'Order not found'; end if;

  insert into public.escrow_ledger_entries (order_id, actor_id, entry_type, amount, currency, status, payment_rail, reference, notes)
  values (target_order_id, auth.uid(), ledger_entry_type, ledger_amount, upper(coalesce(nullif(ledger_currency, ''), 'USD')),
    case when ledger_entry_type in ('milestone_release', 'refund') then 'released' else 'recorded' end,
    'manual', trim(ledger_reference), ledger_notes)
  on conflict (order_id, entry_type, reference) where reference is not null and reference <> ''
  do update set notes = excluded.notes
  returning id into ledger_id;

  if ledger_entry_type = 'manual_funding' then
    update public.orders set escrow_status = 'funded', status = case
      when status = 'confirmed' and exists (select 1 from public.order_milestones where order_id = target_order_id and milestone_number = 0) then 'sampling'::public.order_status
      else status end, techpack_locked = true where id = target_order_id;
    update public.order_milestones set status = 'in_progress' where order_id = target_order_id and milestone_number = case when exists (select 1 from public.order_milestones where order_id = target_order_id and milestone_number = 0) then 0 else 1 end;
  elsif ledger_entry_type = 'refund' then
    update public.orders set escrow_status = 'refunded', status = 'disputed' where id = target_order_id;
  elsif ledger_entry_type = 'milestone_release' then
    select coalesce(sum(amount), 0) into released_total from public.escrow_ledger_entries where order_id = target_order_id and entry_type = 'milestone_release' and status = 'released';
    update public.orders set escrow_status = case
      when released_total >= coalesce(order_total, agreed_price, 0) then 'completed'::public.escrow_status
      when released_total >= coalesce(order_total, agreed_price, 0) * 0.70 then 'milestone_2_released'::public.escrow_status
      else 'milestone_1_released'::public.escrow_status end
    where id = target_order_id;
  end if;

  insert into public.messages (order_id, sender_id, content, message_type, event_type, metadata)
  values (target_order_id, auth.uid(), format('Manual escrow entry recorded: %s %s (%s)', upper(coalesce(ledger_currency, 'USD')), ledger_amount, ledger_entry_type), 'system', 'manual_escrow', jsonb_build_object('ledger_id', ledger_id, 'reference', ledger_reference));
  insert into public.notifications (user_id, actor_id, order_id, type, title, body)
  values
    (target_order.buyer_id, auth.uid(), target_order_id, 'manual_escrow', 'Escrow ledger updated', ledger_entry_type || ': ' || ledger_reference),
    (target_order.manufacturer_id, auth.uid(), target_order_id, 'manual_escrow', 'Escrow ledger updated', ledger_entry_type || ': ' || ledger_reference);
  insert into public.admin_actions (admin_id, action_type, target_type, target_id, notes, metadata)
  values (auth.uid(), 'manual_escrow', 'order', target_order_id, ledger_notes, jsonb_build_object('ledger_id', ledger_id, 'entry_type', ledger_entry_type, 'amount', ledger_amount, 'reference', ledger_reference));
  return ledger_id;
end;
$$;

revoke all on function public.record_manual_escrow(uuid, text, numeric, text, text, text) from public;
grant execute on function public.record_manual_escrow(uuid, text, numeric, text, text, text) to authenticated;
