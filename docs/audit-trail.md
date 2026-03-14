# Audit Trail Design

## Goal

Preserve a complete history of who did what, when, where, and why for all GMP-relevant actions.

## Events that must be audited

- Logbook creation
- Entry creation
- Entry correction
- Status transition
- Attachment upload
- Electronic signature
- PDF export
- Template release

## Audit event structure

Each event in `audit_events` should capture:

- `table_name`
- `record_id`
- `action`
- `actor_user_id`
- `actor_name`
- `site_id`
- `department_id`
- `old_data`
- `new_data`
- `reason`
- `signature_event_id`
- `request_meta`
- `occurred_at`

## Append-only rule

The application should:

- Insert into `audit_events`
- Never update `audit_events`
- Never delete from `audit_events`

Use a `service_role` Edge Function for audit writes so normal client users cannot tamper with records directly.

## Recommended write pattern

1. Client submits change request
2. Edge Function validates permission and current status
3. Edge Function writes business record change
4. Edge Function writes matching audit event in the same transaction boundary when possible
5. UI refreshes from source of truth

## Correction pattern

Do not overwrite the original entry.

Instead:

1. Mark original row as `corrected`
2. Add `corrected_by`, `corrected_at`, and `correction_reason`
3. Insert a new active entry row with corrected values
4. Write an audit event containing old and new values

## Signature pattern

At sign time:

1. Freeze the record snapshot
2. Generate a `record_hash`
3. Require password re-entry
4. Create `signature_events` row
5. Create linked `audit_events` row with action `sign`

## Request metadata

Store useful metadata in `request_meta`:

- IP
- user agent
- device label
- network type
- request ID

For the MVP, not all of this has to be perfect on day 1, but the column should exist now.
