# First 3 Screens And API Flows

## Screen 1: Dashboard

### Purpose

Show the user the work queue for their role.

### Main widgets

- My open logbooks
- Overdue records
- Pending reviews
- Recent signatures
- Quick create from approved template

### Primary API/data reads

- `GET /api/dashboard`
- `GET /api/templates?status=approved`
- `GET /api/logbooks?status=in_progress`

### Response shape

```json
{
  "counts": {
    "open": 6,
    "pendingReview": 2,
    "approvedToday": 1
  },
  "recentLogbooks": [],
  "availableTemplates": []
}
```

## Screen 2: Template Builder

### Purpose

Let admin users create a controlled logbook definition without code changes.

### Main actions

- Create template metadata
- Add sections and fields
- Define mandatory fields
- Add signature steps
- Save draft version
- Release approved version

### Primary API/data flows

- `POST /api/templates`
- `POST /api/templates/{templateId}/versions`
- `PATCH /api/templates/{templateId}/versions/{versionId}`
- `POST /api/templates/{templateId}/versions/{versionId}/approve`

### Important validations

- Template code must be unique
- Approved version cannot be edited
- Effective version must contain at least one signature step
- Required fields must be explicit

## Screen 3: Logbook Execution / Review

### Purpose

Let operators fill records and let QA review and approve them.

### Main actions

- Create logbook from approved template
- Enter values section by section
- Save draft
- Submit for review
- Correct with reason
- Review audit trail
- Sign record

### Primary API/data flows

#### Create a logbook

- `POST /api/logbooks`

Request:

```json
{
  "templateVersionId": "uuid",
  "siteId": "uuid",
  "departmentId": "uuid",
  "areaId": "uuid",
  "equipmentId": "uuid",
  "businessDate": "2026-03-14",
  "shiftCode": "A"
}
```

#### Add or save an entry

- `POST /api/logbooks/{logbookId}/entries`

Request:

```json
{
  "sectionKey": "pre_use_checks",
  "rowNo": 1,
  "fieldValues": {
    "cleaned_by": "user-uuid",
    "cleaning_date": "2026-03-14",
    "line_clearance_done": true,
    "remarks": "No residue observed"
  }
}
```

#### Correct an entry

- `POST /api/logbooks/{logbookId}/entries/{entryId}/correct`

Request:

```json
{
  "reason": "Wrong time entered during shift handover",
  "fieldValues": {
    "time_checked": "11:30"
  }
}
```

#### Submit for review

- `POST /api/logbooks/{logbookId}/submit`

#### Sign record

- `POST /api/logbooks/{logbookId}/sign`

Request:

```json
{
  "meaning": "reviewed",
  "password": "re-enter-password",
  "comment": "Entries verified against shift activity"
}
```

#### Audit trail view

- `GET /api/logbooks/{logbookId}/audit`

## Suggested implementation split

### Next.js route handlers

Use route handlers for dashboard reads and non-sensitive reads.

### Supabase Edge Functions

Use Edge Functions for:

- submit
- correction
- sign
- status transitions

Those are the places where you need controlled write rules and audit inserts.
