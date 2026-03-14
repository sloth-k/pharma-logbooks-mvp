import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LogbookTable } from "@/components/logbook-table";
import { requireUserWithRole } from "@/lib/auth";
import { getLogbooks } from "@/lib/data";
import type { LogbookStatus } from "@/lib/types";

const allowedStatuses: LogbookStatus[] = ["draft", "in_progress", "submitted", "under_review", "approved"];

function parseStatuses(value: string | undefined): LogbookStatus[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is LogbookStatus => allowedStatuses.includes(item as LogbookStatus));
}

function buildTitle(statuses: LogbookStatus[], businessDate?: string) {
  if (businessDate && statuses.length === 1 && statuses[0] === "approved") {
    return "Approved Today";
  }

  if (statuses.length === 0) {
    return "All Logbooks";
  }

  return statuses.map((status) => status.replace("_", " ")).join(" + ");
}

export default async function LogbooksPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; businessDate?: string }>;
}) {
  await requireUserWithRole(["operator", "supervisor", "qa_reviewer", "qa_approver", "admin"]);
  const { status, businessDate } = await searchParams;
  const statuses = parseStatuses(status);
  const items = await getLogbooks({
    statuses,
    businessDate
  });
  const title = buildTitle(statuses, businessDate);

  return (
    <AppShell title="Logbooks" description="Filtered list view for dashboard drill-down and review queues.">
      <section className="card">
        <div className="row">
          <div>
            <span className="eyebrow">Current filter</span>
            <h2>{title}</h2>
            <p className="muted">
              {businessDate ? `Business date: ${businessDate}` : "Showing the most recent matching records."}
            </p>
          </div>
          <Link className="button secondary" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        {items.length > 0 ? (
          <LogbookTable items={items} />
        ) : (
          <p className="muted">No logbooks match the current filter.</p>
        )}
      </section>
    </AppShell>
  );
}
