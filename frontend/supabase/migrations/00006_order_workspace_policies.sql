-- Legacy workspace policy. The pilot transaction spine replaces this broad policy.
-- Detailed financial movement still belongs in escrow ledger / milestone events.
do $$ begin
  create policy "Order parties update workspace state"
  on public.orders for update
  using (buyer_id = auth.uid() or manufacturer_id = auth.uid())
  with check (buyer_id = auth.uid() or manufacturer_id = auth.uid());
exception when duplicate_object then null;
end $$;
