import templateExample from "@/examples/logbook-template.json";
import type { DashboardSummary, LogbookDetail, TemplateDefinition, TemplateSummary } from "@/lib/types";

export const mockTemplates: TemplateSummary[] = [
  {
    id: "tpl-eq-cleaning",
    code: "EQ-CLEANING-001",
    name: "Equipment Cleaning Logbook",
    category: "equipment_cleaning",
    versionNo: 1,
    status: "approved"
  },
  {
    id: "tpl-area-cleaning",
    code: "AREA-CLEAN-001",
    name: "Area / Washroom Cleaning Logbook",
    category: "area_cleaning",
    versionNo: 1,
    status: "approved"
  },
  {
    id: "tpl-env-monitor",
    code: "ENV-MON-001",
    name: "Temperature and Humidity Logbook",
    category: "environment_monitoring",
    versionNo: 1,
    status: "approved"
  }
];

export const mockDashboard: DashboardSummary = {
  counts: {
    open: 6,
    pendingReview: 2,
    approvedToday: 1
  },
  recentLogbooks: [
    {
      id: "log-001",
      logbookNo: "LB-PRD-20260315-001",
      templateName: "Equipment Cleaning Logbook",
      areaName: "Compression Suite 1",
      status: "in_progress",
      businessDate: "2026-03-15",
      shiftCode: "A"
    },
    {
      id: "log-002",
      logbookNo: "LB-HK-20260315-002",
      templateName: "Area / Washroom Cleaning Logbook",
      areaName: "Primary Change Room",
      status: "submitted",
      businessDate: "2026-03-15",
      shiftCode: "A"
    },
    {
      id: "log-003",
      logbookNo: "LB-QA-20260314-014",
      templateName: "Temperature and Humidity Logbook",
      areaName: "Dispensing Corridor",
      status: "approved",
      businessDate: "2026-03-14",
      shiftCode: "C"
    }
  ],
  availableTemplates: mockTemplates
};

export const mockLogbookDetail: LogbookDetail = {
  id: "log-001",
  logbookNo: "LB-PRD-20260315-001",
  templateName: "Equipment Cleaning Logbook",
  areaName: "Compression Suite 1",
  equipmentName: "Compression Machine CM-04",
  status: "under_review",
  businessDate: "2026-03-15",
  shiftCode: "A",
  sections: [
    {
      key: "pre_use_checks",
      title: "Pre-Use Cleaning Checks",
      rows: [
        {
          equipment_status_label: true,
          line_clearance_done: true,
          cleaned_by: "Operator A. Patel",
          checked_time: "10:30",
          remarks: "No residue observed"
        }
      ]
    },
    {
      key: "cleaning_agents",
      title: "Cleaning Agent Consumption",
      rows: [
        {
          agent_name: "Purified Water",
          quantity: 5,
          uom: "L"
        },
        {
          agent_name: "70% IPA",
          quantity: 0.5,
          uom: "L"
        }
      ]
    }
  ],
  signatures: [
    {
      meaning: "performed",
      signerName: "A. Patel",
      signedAt: "2026-03-15T10:42:00Z"
    },
    {
      meaning: "reviewed",
      signerName: "P. Rao",
      signedAt: "2026-03-15T11:15:00Z"
    }
  ],
  auditTrail: [
    {
      id: "audit-1",
      action: "insert",
      actorName: "A. Patel",
      occurredAt: "2026-03-15T10:12:00Z"
    },
    {
      id: "audit-2",
      action: "status_change",
      actorName: "A. Patel",
      occurredAt: "2026-03-15T10:44:00Z",
      reason: "Submitted for QA review"
    },
    {
      id: "audit-3",
      action: "sign",
      actorName: "P. Rao",
      occurredAt: "2026-03-15T11:15:00Z",
      reason: "Reviewed against shift execution"
    }
  ]
};

export const mockTemplateDefinition = templateExample as TemplateDefinition;
