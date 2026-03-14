import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CreateLogbookButton } from "@/components/create-logbook-button";
import { LogbookTable } from "@/components/logbook-table";
import { isSupabaseConfigured } from "@/lib/env";
import { requireUserWithRole } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/data";

export default async function DashboardPage() {
  await requireUserWithRole(["operator", "supervisor", "qa_reviewer", "qa_approver", "admin"]);
  const data = await getDashboardSummary();
  const liveMode = isSupabaseConfigured();

  return (
    <AppShell
      title="Dashboard"
      description="Work queue for operators, supervisors, and QA reviewers."
    >
      <div className="grid three">
        <Link className="card metric" href="/logbooks?status=draft,in_progress">
          <span className="eyebrow">Open logbooks</span>
          <strong>{data.counts.open}</strong>
          <span className="muted">Draft or in-progress execution records</span>
        </Link>
        <Link className="card metric" href="/logbooks?status=submitted,under_review">
          <span className="eyebrow">Pending review</span>
          <strong>{data.counts.pendingReview}</strong>
          <span className="muted">Submitted records awaiting QA review</span>
        </Link>
        <Link
          className="card metric"
          href={`/logbooks?status=approved&businessDate=${new Date().toISOString().slice(0, 10)}`}
        >
          <span className="eyebrow">Approved today</span>
          <strong>{data.counts.approvedToday}</strong>
          <span className="muted">Final sign-offs completed in the last shift cycle</span>
        </Link>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <section className="card">
          <div className="row">
            <div>
              <h2>Recent logbooks</h2>
              <p className="muted">This list should eventually come from the `GET /api/dashboard` route.</p>
            </div>
            {!liveMode ? (
              <Link className="button secondary" href="/logbooks/log-001">
                Open sample
              </Link>
            ) : null}
          </div>
          <LogbookTable items={data.recentLogbooks} />
        </section>

        <section className="card">
          <div className="row">
            <div>
              <h2>Approved templates</h2>
              <p className="muted">Quick create shortcuts for the first 3 workflows.</p>
            </div>
            <Link className="button" href="/templates/new">
              Create template
            </Link>
          </div>
          <div className="stack">
            {data.availableTemplates.map((template) => (
              <div className="row" key={template.id}>
                <div>
                  <strong>{template.name}</strong>
                  <div className="muted">
                    {template.code} - v{template.versionNo}
                  </div>
                </div>
                {liveMode ? (
                  <CreateLogbookButton template={template} />
                ) : (
                  <Link className="button secondary" href={`/logbooks/${template.id}`}>
                    Preview
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
