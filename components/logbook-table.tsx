import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import type { LogbookSummary } from "@/lib/types";

export function LogbookTable({ items }: { items: LogbookSummary[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Logbook</th>
          <th>Template</th>
          <th>Area</th>
          <th>Status</th>
          <th>Shift</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              <Link href={`/logbooks/${item.id}`}>{item.logbookNo}</Link>
            </td>
            <td>{item.templateName}</td>
            <td>{item.areaName}</td>
            <td>
              <StatusPill status={item.status} />
            </td>
            <td>{item.shiftCode}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
