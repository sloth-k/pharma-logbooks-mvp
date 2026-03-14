"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialValues: {
    code: string;
    name: string;
    category: "equipment_cleaning" | "area_cleaning" | "environment_monitoring";
  };
};

export function TemplateBuilderForm({ initialValues }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setStatus(null);

    const payload = {
      code: String(formData.get("code") ?? ""),
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? "equipment_cleaning"),
      description: String(formData.get("description") ?? "")
    };

    const response = await fetch("/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setStatus(result.error ?? "Template save failed.");
      return;
    }

    setStatus(`Template saved: ${result.templateId}`);
    router.refresh();
  }

  return (
    <form
      className="form"
      action={async (formData) => {
        await handleSubmit(formData);
      }}
    >
      <div className="field">
        <label htmlFor="code">Template code</label>
        <input id="code" name="code" defaultValue={initialValues.code} />
      </div>
      <div className="field">
        <label htmlFor="name">Template name</label>
        <input id="name" name="name" defaultValue={initialValues.name} />
      </div>
      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" name="category" defaultValue={initialValues.category}>
          <option value="equipment_cleaning">Equipment cleaning</option>
          <option value="area_cleaning">Area cleaning</option>
          <option value="environment_monitoring">Environment monitoring</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" placeholder="Describe intended use, scope, and review step." />
      </div>
      <div className="actions">
        <button className="button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save draft version"}
        </button>
        <button className="button secondary" type="button" disabled>
          Release for approval
        </button>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </form>
  );
}
