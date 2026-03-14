import type { LogbookStatus } from "@/lib/types";

export function StatusPill({ status }: { status: LogbookStatus }) {
  return <span className={`status ${status}`}>{status.replace("_", " ")}</span>;
}
