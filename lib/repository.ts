import { mockDashboard, mockLogbookDetail, mockTemplateDefinition, mockTemplates } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CreateLogEntryInput,
  CreateLogbookInput,
  CreateTemplateInput,
  DashboardSummary,
  LogbookDetail,
  LogbookListFilter,
  SignRecordInput,
  TemplateDefinition,
  TemplateSummary
} from "@/lib/types";

function mapTemplateRow(row: {
  id: string;
  code: string;
  name: string;
  category: string;
  current_version_no: number | null;
  site_id?: string | null;
  department_id?: string | null;
  version_id?: string | null;
  default_area_id?: string | null;
  default_equipment_id?: string | null;
}): TemplateSummary {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    versionNo: row.current_version_no ?? 1,
    versionId: row.version_id ?? undefined,
    siteId: row.site_id ?? undefined,
    departmentId: row.department_id ?? undefined,
    defaultAreaId: row.default_area_id ?? undefined,
    defaultEquipmentId: row.default_equipment_id ?? undefined,
    status: "approved"
  };
}

function relatedName(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "name" in value && typeof value.name === "string") {
    return value.name;
  }

  return fallback;
}

function relatedFullName(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "full_name" in value && typeof value.full_name === "string") {
    return value.full_name;
  }

  return fallback;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!isSupabaseConfigured()) {
    return mockDashboard;
  }

  const supabase = createAdminClient();

  const [logbooksResult, templates] = await Promise.all([
    supabase
      .from("logbooks")
      .select("id, logbook_no, business_date, shift_code, status, areas(name), logbook_templates(name)")
      .order("created_at", { ascending: false })
      .limit(10),
    getTemplates()
  ]);

  const logbooks = logbooksResult.data;

  if (!logbooks || !templates) {
    return mockDashboard;
  }

  const recentLogbooks = logbooks.map((row: Record<string, unknown>) => ({
    id: row.id,
    logbookNo: row.logbook_no,
    templateName: relatedName(row.logbook_templates, "Template"),
    areaName: relatedName(row.areas, "Area"),
    status: row.status,
    businessDate: row.business_date,
    shiftCode: row.shift_code ?? "-"
  })) as DashboardSummary["recentLogbooks"];

  return {
    counts: {
      open: recentLogbooks.filter((item) => item.status === "draft" || item.status === "in_progress").length,
      pendingReview: recentLogbooks.filter(
        (item) => item.status === "submitted" || item.status === "under_review"
      ).length,
      approvedToday: recentLogbooks.filter((item) => item.status === "approved").length
    },
    recentLogbooks,
    availableTemplates: templates
  };
}

export async function getLogbooks(filter: LogbookListFilter = {}) {
  if (!isSupabaseConfigured()) {
    let items = mockDashboard.recentLogbooks;

    if (filter.statuses && filter.statuses.length > 0) {
      items = items.filter((item) => filter.statuses?.includes(item.status));
    }

    if (filter.businessDate) {
      items = items.filter((item) => item.businessDate === filter.businessDate);
    }

    return items;
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("logbooks")
    .select("id, logbook_no, business_date, shift_code, status, areas(name), logbook_templates(name)")
    .order("created_at", { ascending: false });

  if (filter.statuses && filter.statuses.length > 0) {
    query = query.in("status", filter.statuses);
  }

  if (filter.businessDate) {
    query = query.eq("business_date", filter.businessDate);
  }

  const { data } = await query.limit(50);

  if (!data) {
    return [];
  }

  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    logbookNo: String(row.logbook_no),
    templateName: relatedName(row.logbook_templates, "Template"),
    areaName: relatedName(row.areas, "Area"),
    status: row.status,
    businessDate: String(row.business_date),
    shiftCode: String(row.shift_code ?? "-")
  })) as DashboardSummary["recentLogbooks"];
}

export async function getTemplates(): Promise<TemplateSummary[]> {
  if (!isSupabaseConfigured()) {
    return mockTemplates;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("logbook_templates")
    .select("id, code, name, category, current_version_no, site_id, department_id")
    .order("created_at", { ascending: false });

  if (!data) {
    return mockTemplates;
  }

  const templates = await Promise.all(
    data.map(async (row) => {
      const { data: version } = await supabase
        .from("logbook_template_versions")
        .select("id")
        .eq("template_id", row.id)
        .eq("status", "approved")
        .order("version_no", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: area } = await supabase
        .from("areas")
        .select("id")
        .eq("department_id", row.department_id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const { data: equipment } = area
        ? await supabase
            .from("equipment")
            .select("id")
            .eq("area_id", area.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle()
        : { data: null };

      return mapTemplateRow({
        ...row,
        version_id: version?.id ?? null,
        default_area_id: area?.id ?? null,
        default_equipment_id: equipment?.id ?? null
      });
    })
  );

  return templates;
}

export async function getTemplateDefinition(): Promise<TemplateDefinition> {
  if (!isSupabaseConfigured()) {
    return mockTemplateDefinition;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("logbook_template_versions")
    .select("definition")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.definition as TemplateDefinition | undefined) ?? mockTemplateDefinition;
}

export async function getLogbookDetail(logbookId: string): Promise<LogbookDetail> {
  if (!isSupabaseConfigured()) {
    return {
      ...mockLogbookDetail,
      id: logbookId,
      logbookNo: logbookId === "new" ? "Draft Preview" : mockLogbookDetail.logbookNo
    };
  }

  const supabase = createAdminClient();

  const [{ data: logbook }, { data: entries }, { data: signatures }, { data: auditTrail }] = await Promise.all([
    supabase
      .from("logbooks")
      .select(
        "id, logbook_no, business_date, shift_code, status, areas(name), equipment(name), logbook_templates(name)"
      )
      .eq("id", logbookId)
      .maybeSingle(),
    supabase
      .from("logbook_entries")
      .select("section_key, row_no, field_values")
      .eq("logbook_id", logbookId)
      .eq("status", "active")
      .order("row_no", { ascending: true }),
    supabase
      .from("signature_events")
      .select("meaning, signed_at, profiles!signature_events_signer_id_fkey(full_name)")
      .eq("logbook_id", logbookId)
      .order("signed_at", { ascending: true }),
    supabase
      .from("audit_events")
      .select("id, action, actor_name, occurred_at, reason")
      .eq("record_id", logbookId)
      .order("occurred_at", { ascending: false })
  ]);

  if (!logbook) {
    return mockLogbookDetail;
  }

  const sectionsMap = new Map<string, LogbookDetail["sections"][number]>();
  for (const entry of entries ?? []) {
    const existing = sectionsMap.get(entry.section_key);
    const row = (entry.field_values ?? {}) as Record<string, string | number | boolean>;
    if (existing) {
      existing.rows.push(row);
    } else {
      sectionsMap.set(entry.section_key, {
        key: entry.section_key,
        title: entry.section_key.replaceAll("_", " "),
        rows: [row]
      });
    }
  }

  const logbookRow = logbook as Record<string, unknown>;

  return {
    id: String(logbookRow.id),
    logbookNo: String(logbookRow.logbook_no),
    templateName: relatedName(logbookRow.logbook_templates, "Template"),
    areaName: relatedName(logbookRow.areas, "Area"),
    equipmentName: relatedName(logbookRow.equipment, "Equipment"),
    status: logbookRow.status as LogbookDetail["status"],
    businessDate: String(logbookRow.business_date),
    shiftCode: String(logbookRow.shift_code ?? "-"),
    sections: sectionsMap.size > 0 ? Array.from(sectionsMap.values()) : mockLogbookDetail.sections,
    signatures:
      signatures?.map((item: Record<string, unknown>) => ({
        meaning: item.meaning as LogbookDetail["signatures"][number]["meaning"],
        signerName: relatedFullName(item.profiles, "User"),
        signedAt: String(item.signed_at)
      })) ?? [],
    auditTrail:
      auditTrail?.map((item) => ({
        id: item.id,
        action: item.action,
        actorName: item.actor_name ?? "System",
        occurredAt: item.occurred_at,
        reason: item.reason ?? undefined
      })) ?? []
  };
}

function requireActor(actorUserId: string | undefined) {
  if (!actorUserId) {
    throw new Error("Authenticated user is required for this action.");
  }

  return actorUserId;
}

async function buildUniqueLogbookNo(
  supabase: ReturnType<typeof createAdminClient>,
  departmentId: string,
  businessDate: string,
  shiftCode: string
) {
  const dayToken = businessDate.replaceAll("-", "");
  const departmentToken = departmentId.slice(0, 4).toUpperCase();
  const prefix = `LB-${departmentToken}-${dayToken}-${shiftCode}`;

  const { data: existingRows, error } = await supabase
    .from("logbooks")
    .select("logbook_no")
    .ilike("logbook_no", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  const nextSequence = (existingRows?.length ?? 0) + 1;
  return `${prefix}-${String(nextSequence).padStart(3, "0")}`;
}

export async function createTemplate(input: CreateTemplateInput, actorUserId?: string) {
  if (!isSupabaseConfigured()) {
    return {
      id: crypto.randomUUID(),
      ...input
    };
  }

  const userId = requireActor(actorUserId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("logbook_templates")
    .insert({
      code: input.code,
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      created_by: userId
    })
    .select("id, code, name, category")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createLogbook(input: CreateLogbookInput, actorUserId?: string) {
  if (!isSupabaseConfigured()) {
    return {
      logbookId: crypto.randomUUID(),
      status: "draft",
      ...input
    };
  }

  const userId = requireActor(actorUserId);
  const supabase = createAdminClient();
  const { data: versionRow, error: versionError } = await supabase
    .from("logbook_template_versions")
    .select("template_id")
    .eq("id", input.templateVersionId)
    .maybeSingle();

  if (versionError || !versionRow) {
    throw new Error(versionError?.message ?? "Template version not found.");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const logbookNo =
      attempt === 0
        ? await buildUniqueLogbookNo(supabase, input.departmentId, input.businessDate, input.shiftCode)
        : `${await buildUniqueLogbookNo(supabase, input.departmentId, input.businessDate, input.shiftCode)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

    const { data, error } = await supabase
      .from("logbooks")
      .insert({
        template_version_id: input.templateVersionId,
        template_id: versionRow.template_id,
        site_id: input.siteId,
        department_id: input.departmentId,
        area_id: input.areaId,
        equipment_id: input.equipmentId ?? null,
        business_date: input.businessDate,
        shift_code: input.shiftCode,
        logbook_no: logbookNo,
        created_by: userId
      })
      .select("id, status, logbook_no")
      .single();

    if (!error) {
      return {
        logbookId: data.id,
        status: data.status,
        logbookNo: data.logbook_no
      };
    }

    if (!error.message.includes("logbooks_logbook_no_key")) {
      throw new Error(error.message);
    }
  }

  throw new Error("Could not generate a unique logbook number.");
}

export async function createLogEntry(logbookId: string, input: CreateLogEntryInput, actorUserId?: string) {
  if (!isSupabaseConfigured()) {
    return {
      entryId: crypto.randomUUID(),
      logbookId,
      ...input
    };
  }

  const userId = requireActor(actorUserId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("logbook_entries")
    .insert({
      logbook_id: logbookId,
      section_key: input.sectionKey,
      row_no: input.rowNo,
      field_values: input.fieldValues,
      created_by: userId
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    entryId: data.id,
    logbookId,
    ...input
  };
}

export async function submitLogbook(logbookId: string) {
  if (!isSupabaseConfigured()) {
    return {
      logbookId,
      status: "submitted"
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("logbooks")
    .update({ status: "submitted" })
    .eq("id", logbookId)
    .select("id, status")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    logbookId: data.id,
    status: data.status
  };
}

export async function signLogbook(logbookId: string, input: SignRecordInput, actorUserId?: string) {
  if (!isSupabaseConfigured()) {
    return {
      signatureId: crypto.randomUUID(),
      logbookId,
      meaning: input.meaning
    };
  }

  const userId = requireActor(actorUserId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("signature_events")
    .insert({
      logbook_id: logbookId,
      signer_id: userId,
      meaning: input.meaning,
      comment: input.comment ?? null,
      record_hash: crypto.randomUUID(),
      auth_context: { password_reentry: true }
    })
    .select("id, meaning")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    signatureId: data.id,
    logbookId,
    meaning: data.meaning
  };
}
