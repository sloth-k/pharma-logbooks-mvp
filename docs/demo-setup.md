# Demo Setup

This runbook gets the current MVP into a demo-ready state against a real Supabase project.

## 1. Create the Supabase project

1. Create a new Supabase project.
2. Copy project credentials into `.env.local` from [.env.example](/c:/Users/vasua/OneDrive/Documents/Playground/pharma-logbooks-mvp/.env.example).

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2. Apply the database schema

Run [schema.sql](/c:/Users/vasua/OneDrive/Documents/Playground/pharma-logbooks-mvp/supabase/schema.sql) in the Supabase SQL editor.

## 3. Seed demo master data and templates

Run [demo-seed.sql](/c:/Users/vasua/OneDrive/Documents/Playground/pharma-logbooks-mvp/supabase/demo-seed.sql) in the Supabase SQL editor.

This creates:

- demo site, departments, areas, and equipment
- training requirements
- three approved template masters
- three approved template versions
- a temporary seed table containing the demo user mapping

## 4. Create demo auth users

In Supabase Auth, create these users manually with passwords:

- `operator.demo@example.com`
- `supervisor.demo@example.com`
- `qa.reviewer.demo@example.com`
- `qa.approver.demo@example.com`
- `admin.demo@example.com`

Use simple demo passwords only for the demo environment. Do not reuse them elsewhere.

## 5. Link auth users into profiles and roles

Run [demo-auth-linking.sql](/c:/Users/vasua/OneDrive/Documents/Playground/pharma-logbooks-mvp/supabase/demo-auth-linking.sql) after the auth users exist.

This creates:

- `profiles` rows
- `user_role_assignments`
- `user_training_status`

## 6. Start the app locally

From [package.json](/c:/Users/vasua/OneDrive/Documents/Playground/pharma-logbooks-mvp/package.json):

```bash
npm install
npm run dev
```

## 7. Minimum demo verification

Verify these flows before deploying:

1. Sign in as `admin.demo@example.com` and open `/templates/new`.
2. Sign in as `operator.demo@example.com` and open `/dashboard`.
3. Create or preview a logbook record.
4. Save an entry.
5. Submit the record.
6. Sign as reviewer and approver with the corresponding demo users.

## 8. When this is ready to push as a demo

Push to a demo deployment only after:

- schema applied successfully
- seed data applied successfully
- auth users created and linked
- local login works for at least `admin`, `operator`, and `qa_reviewer`
- one full end-to-end logbook flow works against the real Supabase project
- Vercel preview environment has the same three env vars configured

## 9. Current limitations before a public-facing demo

These are acceptable for a controlled demo, but not for a broader release:

- no signup/bootstrap UI for new users
- no password reset flow surfaced in the app
- route-handler writes do not yet write full audit rows for every action
- template version approval is still a stub
- no storage upload path for attachments yet
- no completed record PDF export yet

## 10. Recommended deployment position

After the checks above pass, this is suitable for:

- a controlled stakeholder demo
- an internal product review
- a design partner walkthrough

It is not yet suitable for:

- customer pilot in a regulated environment
- validation exercise
- production or GMP use
