# proov.to

This is the open-source client-side application for **proov** (proov.to / proov.io)—a B2B reverse-auction marketplace and direct-billing escrow platform designed to resolve payment trust, quality disputes, and cross-border payout red tape between global buyers and custom manufacturers.

The production application is a Next.js 16 frontend backed by Supabase Auth, Postgres, Row Level Security, Storage, and Realtime. The pilot transaction spine supports authenticated RFQs, manufacturer bids, atomic bid acceptance, order milestones, manual escrow, notifications, and disputes.

---

## Prerequisites

To run the application or execute the automated test suites, you will need:
*   A modern web browser (Chrome, Safari, Firefox, Edge).
*   [Node.js](https://nodejs.org/) (v20.9.0 or higher). The pinned version is in `.nvmrc`.

---

## Getting Started

### 1. Configure and run the application

```bash
cp frontend/.env.example frontend/.env.local
# Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
npm install
npm install --prefix frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Apply the database schema

Apply `frontend/supabase/migrations` in filename order to an isolated Supabase project before starting the app. Migration versions are unique and the final migration installs the role-checked pilot lifecycle and admin-only manual escrow commands.

```bash
npm run test --prefix frontend
npm run typecheck --prefix frontend
npm run lint --prefix frontend -- --no-fix
npm run build
```

Missing Supabase variables fail fast. Authenticated writes never fall back to browser-local demo data.

---

## Running Tests

The default suite checks product handoff, marketplace behavior, migration ordering, authorization contracts, milestone initialization, and manual escrow idempotency.

Execute all contract suites with:

```bash
npm test --prefix frontend
```

### What is tested:
1. Product templates and Product → Order handoff contracts.
2. Marketplace filtering, ownership boundaries, split bids, and atomic acceptance schema.
3. Unique, ordered Supabase migrations.
4. Role-checked order transitions and removal of broad order writes.
5. Admin-only, idempotent manual escrow with notifications and audit records.
6. A Playwright pilot flow across buyer, manufacturer, and admin accounts via `npm run test:e2e --prefix frontend`.

---

## Contributing

We welcome contributions to proov. To keep quality high and PR reviews fast, we follow antiwork/gumroad guidelines:

### 1. Keep PRs small and focused
Try to limit your changes to under 200 lines of code. Large, sprawling pull requests will be closed immediately.

### 2. Run tests locally
Never submit a PR that fails `npm test`, `npm run typecheck`, `npm run lint -- --no-fix`, or `npm run build` in `frontend`.

### 3. Add video walkthroughs
If you are changing UI layouts, forms, or role-toggle menus, record a short video walkthrough demonstrating your changes and include it in your pull request.

### 4. Declare AI usage
If you used LLMs or coding assistants (such as Antigravity, Copilot, or Cursor) to draft, refactor, or test the code, disclose it clearly at the top of your PR description.

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
