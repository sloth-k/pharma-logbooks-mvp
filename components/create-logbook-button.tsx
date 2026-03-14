"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { TemplateSummary } from "@/lib/types";

export function CreateLogbookButton({ template }: { template: TemplateSummary }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (!template.versionId || !template.siteId || !template.departmentId || !template.defaultAreaId) {
      setStatus("Template is missing required live IDs.");
      return;
    }

    setIsCreating(true);
    setStatus(null);

    const response = await fetch("/api/logbooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        templateVersionId: template.versionId,
        siteId: template.siteId,
        departmentId: template.departmentId,
        areaId: template.defaultAreaId,
        equipmentId: template.defaultEquipmentId,
        businessDate: new Date().toISOString().slice(0, 10),
        shiftCode: "A"
      })
    });

    const result = await response.json();
    setIsCreating(false);

    if (!response.ok) {
      setStatus(result.error ?? "Logbook creation failed.");
      return;
    }

    router.push(`/logbooks/${result.logbookId}`);
    router.refresh();
  }

  return (
    <div className="stack">
      <button className="button secondary" type="button" onClick={handleCreate} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create logbook"}
      </button>
      {status ? <span className="muted">{status}</span> : null}
    </div>
  );
}
