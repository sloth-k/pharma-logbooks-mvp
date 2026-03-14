import { AppShell } from "@/components/app-shell";
import { TemplateBuilderForm } from "@/components/template-builder-form";
import { requireUserWithRole } from "@/lib/auth";
import { getTemplateDefinition } from "@/lib/data";

export default async function NewTemplatePage() {
  await requireUserWithRole(["admin"]);
  const template = await getTemplateDefinition();

  return (
    <AppShell
      title="Template Builder"
      description="Controlled, no-code template drafting for GMP logbooks."
    >
      <div className="grid two">
        <section className="card">
          <h2>Template metadata</h2>
          <TemplateBuilderForm
            initialValues={{
              code: template.templateCode,
              name: template.templateName,
              category: template.category as "equipment_cleaning" | "area_cleaning" | "environment_monitoring"
            }}
          />
        </section>

        <section className="card">
          <h2>Section preview</h2>
          <div className="stack">
            {template.sections.map((section) => (
              <div className="card" key={section.key} style={{ boxShadow: "none" }}>
                <div className="row">
                  <strong>{section.title}</strong>
                  <span className="badge">{section.repeatable ? "Repeatable" : "Single section"}</span>
                </div>
                <div className="stack">
                  {section.fields.map((field) => (
                    <div className="row" key={field.key}>
                      <span>{field.label}</span>
                      <span className="muted">
                        {field.type}
                        {field.required ? " - required" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
