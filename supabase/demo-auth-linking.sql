begin;

create temporary table if not exists demo_user_seed (
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
  ('admin.demo@example.com', 'System Admin Demo', 'EMP-ADM-001', 'admin', 'QA', 'QACOR')
on conflict do nothing;

insert into public.profiles (id, full_name, employee_code, default_site_id, is_active)
select
  au.id,
  dus.full_name,
  dus.employee_code,
  s.id,
  true
from demo_user_seed dus
join auth.users au on lower(au.email) = lower(dus.email)
join public.sites s on s.code = 'OSD-BLR'
on conflict (id) do update set
  full_name = excluded.full_name,
  employee_code = excluded.employee_code,
  default_site_id = excluded.default_site_id,
  is_active = excluded.is_active;

insert into public.user_role_assignments (user_id, role_id, site_id, department_id, area_id, assigned_by)
select
  au.id,
  r.id,
  s.id,
  d.id,
  a.id,
  null
from demo_user_seed dus
join auth.users au on lower(au.email) = lower(dus.email)
join public.roles r on r.code = dus.role_code
join public.sites s on s.code = 'OSD-BLR'
join public.departments d on d.site_id = s.id and d.code = dus.department_code
left join public.areas a on a.department_id = d.id and a.code = dus.area_code
where not exists (
  select 1
  from public.user_role_assignments ura
  where ura.user_id = au.id
    and ura.role_id = r.id
    and coalesce(ura.department_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(d.id, '00000000-0000-0000-0000-000000000000'::uuid)
    and coalesce(ura.area_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(a.id, '00000000-0000-0000-0000-000000000000'::uuid)
);

insert into public.user_training_status (user_id, training_requirement_id, status, valid_until)
select
  au.id,
  tr.id,
  'qualified',
  current_date + interval '365 days'
from demo_user_seed dus
join auth.users au on lower(au.email) = lower(dus.email)
join public.training_requirements tr on tr.code in ('TRN-GMP-BASIC', 'TRN-LOGBOOK-001')
where not exists (
  select 1
  from public.user_training_status uts
  where uts.user_id = au.id
    and uts.training_requirement_id = tr.id
);

commit;
