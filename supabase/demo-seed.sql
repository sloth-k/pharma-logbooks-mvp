begin;

with seeded_site as (
  insert into public.sites (code, name)
  values ('OSD-BLR', 'Bengaluru OSD Demo Site')
  on conflict (code) do update set name = excluded.name
  returning id
),
seeded_department as (
  insert into public.departments (site_id, code, name)
  select id, 'PROD', 'Production'
  from seeded_site
  on conflict (site_id, code) do update set name = excluded.name
  returning id, site_id
),
seeded_area as (
  insert into public.areas (department_id, code, name, area_type)
  select id, 'COMP-01', 'Compression Suite 1', 'manufacturing'
  from seeded_department
  on conflict (department_id, code) do update set name = excluded.name, area_type = excluded.area_type
  returning id, department_id
)
insert into public.equipment (area_id, code, name, equipment_type)
select id, 'CM-04', 'Compression Machine CM-04', 'compression_machine'
from seeded_area
on conflict (area_id, code) do update set
  name = excluded.name,
  equipment_type = excluded.equipment_type;

with seeded_site as (
  select id from public.sites where code = 'OSD-BLR'
),
seeded_department as (
  select d.id, d.site_id
  from public.departments d
  join seeded_site s on s.id = d.site_id
  where d.code = 'PROD'
)
insert into public.areas (department_id, code, name, area_type)
select id, 'WASH-01', 'Primary Washroom 1', 'housekeeping'
from seeded_department
on conflict (department_id, code) do update set
  name = excluded.name,
  area_type = excluded.area_type;

with seeded_site as (
  select id from public.sites where code = 'OSD-BLR'
),
seeded_department as (
  insert into public.departments (site_id, code, name)
  select id, 'QA', 'Quality Assurance'
  from seeded_site
  on conflict (site_id, code) do update set name = excluded.name
  returning id, site_id
)
insert into public.areas (department_id, code, name, area_type)
select id, 'QACOR', 'QA Corridor', 'qa'
from seeded_department
on conflict (department_id, code) do update set
  name = excluded.name,
  area_type = excluded.area_type;

insert into public.training_requirements (code, title, description)
values
  ('TRN-GMP-BASIC', 'Basic GMP Training', 'Mandatory GMP induction for demo execution users'),
  ('TRN-LOGBOOK-001', 'Electronic Logbook Usage', 'Training for logbook entry, review, and sign-off')
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description;

insert into public.logbook_templates (
  site_id,
  department_id,
  code,
  name,
  category,
  description,
  current_version_no,
  created_by
)
select
  s.id,
  d.id,
  'EQ-CLEANING-001',
  'Equipment Cleaning Logbook',
  'equipment_cleaning',
  'Demo equipment cleaning logbook for Compression Suite 1',
  1,
  null
from public.sites s
join public.departments d on d.site_id = s.id
where s.code = 'OSD-BLR' and d.code = 'PROD'
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  current_version_no = excluded.current_version_no;

insert into public.logbook_templates (
  site_id,
  department_id,
  code,
  name,
  category,
  description,
  current_version_no,
  created_by
)
select
  s.id,
  d.id,
  'AREA-CLEAN-001',
  'Area Cleaning Logbook',
  'area_cleaning',
  'Demo area cleaning logbook for washroom sanitization',
  1,
  null
from public.sites s
join public.departments d on d.site_id = s.id
where s.code = 'OSD-BLR' and d.code = 'PROD'
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  current_version_no = excluded.current_version_no;

insert into public.logbook_templates (
  site_id,
  department_id,
  code,
  name,
  category,
  description,
  current_version_no,
  created_by
)
select
  s.id,
  d.id,
  'ENV-MON-001',
  'Temperature and Humidity Logbook',
  'environment_monitoring',
  'Demo environmental monitoring logbook',
  1,
  null
from public.sites s
join public.departments d on d.site_id = s.id
where s.code = 'OSD-BLR' and d.code = 'QA'
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  current_version_no = excluded.current_version_no;

insert into public.logbook_template_versions (
  template_id,
  version_no,
  status,
  definition,
  effective_from,
  approved_by,
  approved_at,
  created_by
)
select
  t.id,
  1,
  'approved',
  '{
    "templateCode": "EQ-CLEANING-001",
    "templateName": "Equipment Cleaning Logbook",
    "category": "equipment_cleaning",
    "version": 1,
    "appliesTo": {
      "siteScope": "OSD-BLR",
      "departmentScope": "PROD"
    },
    "headerFields": [
      {"key": "equipment_id", "label": "Equipment", "type": "equipment_picker", "required": true},
      {"key": "cleaning_date", "label": "Cleaning Date", "type": "date", "required": true},
      {"key": "shift_code", "label": "Shift", "type": "select", "required": true, "options": ["A", "B", "C"]}
    ],
    "sections": [
      {
        "key": "pre_use_checks",
        "title": "Pre-Use Cleaning Checks",
        "repeatable": false,
        "fields": [
          {"key": "equipment_status_label", "label": "Status Label Checked", "type": "checkbox", "required": true},
          {"key": "line_clearance_done", "label": "Line Clearance Done", "type": "checkbox", "required": true},
          {"key": "cleaned_by", "label": "Cleaned By", "type": "user_picker", "required": true},
          {"key": "checked_time", "label": "Checked Time", "type": "time", "required": true},
          {"key": "remarks", "label": "Remarks", "type": "text", "required": false}
        ]
      }
    ],
    "workflow": {
      "statuses": ["draft", "in_progress", "submitted", "under_review", "approved"],
      "signatureSteps": [
        {"step": 1, "role": "operator", "meaning": "performed", "required": true},
        {"step": 2, "role": "qa_reviewer", "meaning": "reviewed", "required": true},
        {"step": 3, "role": "qa_approver", "meaning": "approved", "required": true}
      ]
    },
    "rules": {
      "allowCorrectionsAfterSubmit": true,
      "correctionReasonRequired": true,
      "requireAttachmentOnException": false
    }
  }'::jsonb,
  current_date,
  null,
  timezone('utc', now()),
  null
from public.logbook_templates t
where t.code = 'EQ-CLEANING-001'
on conflict (template_id, version_no) do update set
  status = excluded.status,
  definition = excluded.definition,
  effective_from = excluded.effective_from;

insert into public.logbook_template_versions (
  template_id,
  version_no,
  status,
  definition,
  effective_from,
  approved_by,
  approved_at,
  created_by
)
select
  t.id,
  1,
  'approved',
  '{
    "templateCode": "AREA-CLEAN-001",
    "templateName": "Area Cleaning Logbook",
    "category": "area_cleaning",
    "version": 1,
    "appliesTo": {
      "siteScope": "OSD-BLR",
      "departmentScope": "PROD"
    },
    "headerFields": [
      {"key": "area_id", "label": "Area", "type": "area_picker", "required": true},
      {"key": "cleaning_date", "label": "Cleaning Date", "type": "date", "required": true},
      {"key": "shift_code", "label": "Shift", "type": "select", "required": true, "options": ["A", "B", "C"]}
    ],
    "sections": [
      {
        "key": "cleaning_checklist",
        "title": "Cleaning Checklist",
        "repeatable": false,
        "fields": [
          {"key": "floor_cleaned", "label": "Floor Cleaned", "type": "checkbox", "required": true},
          {"key": "bin_removed", "label": "Waste Bin Emptied", "type": "checkbox", "required": true},
          {"key": "sanitizer_used", "label": "Sanitizer Used", "type": "text", "required": true},
          {"key": "remarks", "label": "Remarks", "type": "text", "required": false}
        ]
      }
    ],
    "workflow": {
      "statuses": ["draft", "in_progress", "submitted", "under_review", "approved"],
      "signatureSteps": [
        {"step": 1, "role": "operator", "meaning": "performed", "required": true},
        {"step": 2, "role": "supervisor", "meaning": "reviewed", "required": true},
        {"step": 3, "role": "qa_approver", "meaning": "approved", "required": true}
      ]
    },
    "rules": {
      "allowCorrectionsAfterSubmit": true,
      "correctionReasonRequired": true,
      "requireAttachmentOnException": false
    }
  }'::jsonb,
  current_date,
  null,
  timezone('utc', now()),
  null
from public.logbook_templates t
where t.code = 'AREA-CLEAN-001'
on conflict (template_id, version_no) do update set
  status = excluded.status,
  definition = excluded.definition,
  effective_from = excluded.effective_from;

insert into public.logbook_template_versions (
  template_id,
  version_no,
  status,
  definition,
  effective_from,
  approved_by,
  approved_at,
  created_by
)
select
  t.id,
  1,
  'approved',
  '{
    "templateCode": "ENV-MON-001",
    "templateName": "Temperature and Humidity Logbook",
    "category": "environment_monitoring",
    "version": 1,
    "appliesTo": {
      "siteScope": "OSD-BLR",
      "departmentScope": "QA"
    },
    "headerFields": [
      {"key": "area_id", "label": "Area", "type": "area_picker", "required": true},
      {"key": "observation_date", "label": "Observation Date", "type": "date", "required": true},
      {"key": "shift_code", "label": "Shift", "type": "select", "required": true, "options": ["A", "B", "C"]}
    ],
    "sections": [
      {
        "key": "env_readings",
        "title": "Environmental Readings",
        "repeatable": true,
        "fields": [
          {"key": "reading_time", "label": "Reading Time", "type": "time", "required": true},
          {"key": "temperature_c", "label": "Temperature (C)", "type": "number", "required": true},
          {"key": "relative_humidity", "label": "Relative Humidity (%)", "type": "number", "required": true}
        ]
      }
    ],
    "workflow": {
      "statuses": ["draft", "in_progress", "submitted", "under_review", "approved"],
      "signatureSteps": [
        {"step": 1, "role": "operator", "meaning": "performed", "required": true},
        {"step": 2, "role": "qa_reviewer", "meaning": "reviewed", "required": true},
        {"step": 3, "role": "qa_approver", "meaning": "approved", "required": true}
      ]
    },
    "rules": {
      "allowCorrectionsAfterSubmit": true,
      "correctionReasonRequired": true,
      "requireAttachmentOnException": false
    }
  }'::jsonb,
  current_date,
  null,
  timezone('utc', now()),
  null
from public.logbook_templates t
where t.code = 'ENV-MON-001'
on conflict (template_id, version_no) do update set
  status = excluded.status,
  definition = excluded.definition,
  effective_from = excluded.effective_from;

create temporary table demo_user_seed (
  email text not null,
  full_name text not null,
  employee_code text not null,
  role_code text not null,
  department_code text not null,
  area_code text,
  training_status text not null default 'qualified'
);

insert into demo_user_seed (email, full_name, employee_code, role_code, department_code, area_code)
values
  ('operator.demo@example.com', 'Operator Demo', 'EMP-OP-001', 'operator', 'PROD', 'COMP-01'),
  ('supervisor.demo@example.com', 'Supervisor Demo', 'EMP-SUP-001', 'supervisor', 'PROD', 'COMP-01'),
  ('qa.reviewer.demo@example.com', 'QA Reviewer Demo', 'EMP-QAR-001', 'qa_reviewer', 'QA', 'QACOR'),
  ('qa.approver.demo@example.com', 'QA Approver Demo', 'EMP-QAA-001', 'qa_approver', 'QA', 'QACOR'),
  ('admin.demo@example.com', 'System Admin Demo', 'EMP-ADM-001', 'admin', 'QA', 'QACOR');

commit;
