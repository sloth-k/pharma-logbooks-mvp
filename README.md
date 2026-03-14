# Pharma Logbooks MVP Starter

This folder is a build-ready architecture starter for a free-tier MVP using:

- `Next.js` on Vercel
- `Supabase Auth`
- `Supabase Postgres`
- `Supabase Storage`
- `Supabase Edge Functions`

It is intentionally designed as a serious MVP for regulated manufacturing workflows without claiming full validated production compliance yet.

## App scaffold

The starter now also includes:

- `app/` App Router pages for dashboard, template builder, and logbook detail
- `app/api/` route handlers for dashboard, templates, logbooks, sign, submit, and audit
- `lib/supabase/` browser, server, admin, and proxy helpers
- `supabase/functions/` Edge Function stubs for controlled write paths
- `.env.example` for local setup

## Local setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Add Supabase project credentials
4. Run `npm run dev`

If env vars are missing, the starter uses mock data so the UI structure still loads.

## Included

- Database schema: `supabase/schema.sql`
- Demo seed data: `supabase/demo-seed.sql`
- Demo auth linking: `supabase/demo-auth-linking.sql`
- Roles and permission model: `docs/roles-and-permissions.md`
- Audit trail design: `docs/audit-trail.md`
- Dynamic template structure: `examples/logbook-template.json`
- First 3 screens and API flows: `docs/screens-and-api-flows.md`
- Demo setup runbook: `docs/demo-setup.md`

## Recommended MVP scope

Start with 3 workflows:

1. Equipment cleaning logbook
2. Area / washroom cleaning logbook
3. Temperature and humidity monitoring logbook

## Suggested app modules

- `auth`
- `master-data`
- `template-builder`
- `logbook-runtime`
- `review-approval`
- `audit`
- `reporting`

## Suggested Next.js routes

- `/login`
- `/dashboard`
- `/templates`
- `/templates/new`
- `/logbooks`
- `/logbooks/[id]`
- `/review`
- `/admin/users`

## Suggested Supabase Edge Functions

- `create-logbook`
- `submit-log-entry`
- `correct-log-entry`
- `sign-record`
- `transition-record-status`
- `export-logbook-pdf`

## Build order

1. Create Supabase project and run `supabase/schema.sql`
2. Build login + role bootstrap
3. Build dashboard
4. Build template builder with JSON schema storage
5. Build logbook execution screen
6. Build review/signature flow
7. Add PDF export and attachment upload

## MVP positioning

Use this language for demos:

- Designed with GMP and Part 11 aligned controls in mind
- Includes append-only audit trail, role-based access, and controlled electronic sign-off
- Validation package and procedural qualification are part of production rollout
