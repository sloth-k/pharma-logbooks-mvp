# Roles And Permissions

## Core MVP roles

### Operator

- Create a new logbook from an approved template
- Enter readings and checklist values
- Add attachments
- Submit a logbook for review
- Correct own entries before review with mandatory reason

### Supervisor

- Everything an operator can do
- Review shopfloor completeness
- Return a record for correction
- Sign as `reviewed` for operational verification

### QA Reviewer

- View all records in assigned site / department
- Review completed records and audit trail
- Sign as `reviewed`
- Move record to `under_review` or back to `in_progress`

### QA Approver

- Final review of record and signatures
- Sign as `approved`
- Lock record from further changes
- Trigger final PDF export

### Admin

- Manage master data
- Manage templates and template releases
- Assign users to roles
- View configuration and operational reports

## Permission rules

Permissions should always be filtered by:

- Site
- Department
- Area, where applicable

## Important policy rules

- Only approved template versions can be used to create new logbooks
- Effective templates cannot be edited in place
- Submitted records cannot be edited directly
- Corrections after submission must create a correction event, not overwrite history
- Approved records become read-only
- Only QA Approver can mark a record as `approved`

## Training gate

Before a user can create or sign a record:

- User must be active
- Required training must be `qualified`
- Training must not be expired

This can start as an application-level check in the MVP and later move deeper into policy enforcement.
