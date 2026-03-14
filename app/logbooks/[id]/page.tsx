import { AppShell } from "@/components/app-shell";
import { LogbookActions } from "@/components/logbook-actions";
import { StatusPill } from "@/components/status-pill";
import { requireUserWithRole } from "@/lib/auth";
import { getLogbookDetail } from "@/lib/data";

export default async function LogbookDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUserWithRole(["operator", "supervisor", "qa_reviewer", "qa_approver", "admin"]);
  const { id } = await params;
  const logbook = await getLogbookDetail(id);

  return (
    <AppShell
      title={`Logbook ${logbook.logbookNo}`}
      description="Execution, review, signatures, and audit visibility in one record page."
    >
      <div className="grid two">
        <section className="card">
          <div className="row">
            <div>
              <span className="eyebrow">Record status</span>
              <h2>{logbook.templateName}</h2>
            </div>
            <StatusPill status={logbook.status} />
          </div>
          <div className="stack">
            <div className="row">
              <span>Area</span>
              <strong>{logbook.areaName}</strong>
            </div>
            <div className="row">
              <span>Equipment</span>
              <strong>{logbook.equipmentName}</strong>
            </div>
            <div className="row">
              <span>Business date</span>
              <strong>{logbook.businessDate}</strong>
            </div>
            <div className="row">
              <span>Shift</span>
              <strong>{logbook.shiftCode}</strong>
            </div>
          </div>
          <LogbookActions logbookId={logbook.id} roles={user?.roles} />
        </section>

        <section className="card">
          <h2>Signatures</h2>
          <div className="stack">
            {logbook.signatures.map((signature) => (
              <div className="row" key={`${signature.meaning}-${signature.signedAt}`}>
                <div>
                  <strong>{signature.meaning}</strong>
                  <div className="muted">{signature.signerName}</div>
                </div>
                <span>{new Date(signature.signedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 18 }}>
        <h2>Execution sections</h2>
        <div className="stack">
          {logbook.sections.map((section) => (
            <div className="card" key={section.key} style={{ boxShadow: "none" }}>
              <h3>{section.title}</h3>
              {section.rows.map((row, index) => (
                <div className="stack" key={`${section.key}-${index}`}>
                  {Object.entries(row).map(([key, value]) => (
                    <div className="row" key={key}>
                      <span>{key.replaceAll("_", " ")}</span>
                      <strong>{String(value)}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <h2>Audit trail</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Actor</th>
              <th>When</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {logbook.auditTrail.map((item) => (
              <tr key={item.id}>
                <td>{item.action}</td>
                <td>{item.actorName}</td>
                <td>{new Date(item.occurredAt).toLocaleString()}</td>
                <td>{item.reason ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
