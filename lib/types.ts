export type LogbookStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved";

export type SignatureMeaning = "performed" | "reviewed" | "verified" | "approved";

export type DashboardSummary = {
  counts: {
    open: number;
    pendingReview: number;
    approvedToday: number;
  };
  recentLogbooks: LogbookSummary[];
  availableTemplates: TemplateSummary[];
};

export type LogbookSummary = {
  id: string;
  logbookNo: string;
  templateName: string;
  areaName: string;
  status: LogbookStatus;
  businessDate: string;
  shiftCode: string;
};

export type TemplateSummary = {
  id: string;
  code: string;
  name: string;
  category: string;
  versionNo: number;
  versionId?: string;
  siteId?: string;
  departmentId?: string;
  defaultAreaId?: string;
  defaultEquipmentId?: string;
  status: "draft" | "approved";
};

export type AuditEvent = {
  id: string;
  action: "insert" | "update" | "status_change" | "sign" | "attach" | "export";
  actorName: string;
  occurredAt: string;
  reason?: string;
};

export type LogbookDetail = {
  id: string;
  logbookNo: string;
  templateName: string;
  areaName: string;
  equipmentName: string;
  status: LogbookStatus;
  businessDate: string;
  shiftCode: string;
  sections: Array<{
    key: string;
    title: string;
    rows: Array<Record<string, string | number | boolean>>;
  }>;
  signatures: Array<{
    meaning: SignatureMeaning;
    signerName: string;
    signedAt: string;
  }>;
  auditTrail: AuditEvent[];
};

export type TemplateDefinition = {
  templateCode: string;
  templateName: string;
  category: string;
  version: number;
  headerFields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  sections: Array<{
    key: string;
    title: string;
    repeatable: boolean;
    fields: Array<{
      key: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  }>;
  workflow: {
    statuses: string[];
    signatureSteps: Array<{
      step: number;
      role: string;
      meaning: SignatureMeaning;
      required: boolean;
    }>;
  };
  rules: {
    allowCorrectionsAfterSubmit: boolean;
    correctionReasonRequired: boolean;
    requireAttachmentOnException: boolean;
  };
};

export type CreateTemplateInput = {
  code: string;
  name: string;
  category: "equipment_cleaning" | "area_cleaning" | "environment_monitoring";
  description?: string;
};

export type CreateLogbookInput = {
  templateVersionId: string;
  siteId: string;
  departmentId: string;
  areaId: string;
  equipmentId?: string;
  businessDate: string;
  shiftCode: string;
};

export type CreateLogEntryInput = {
  sectionKey: string;
  rowNo: number;
  fieldValues: Record<string, string | number | boolean | null>;
};

export type SignRecordInput = {
  meaning: SignatureMeaning;
  password: string;
  comment?: string;
};
