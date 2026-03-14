"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  logbookId: string;
  roles?: string[];
};

export function LogbookActions({ logbookId, roles = [] }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const canSave = roles.length === 0 || roles.some((role) => ["operator", "supervisor", "admin"].includes(role));
  const canSubmit = roles.length === 0 || roles.some((role) => ["operator", "supervisor", "admin"].includes(role));
  const canSign = roles.length === 0 || roles.some((role) => ["operator", "supervisor", "qa_reviewer", "qa_approver", "admin"].includes(role));

  async function callApi(path: string, payload?: Record<string, unknown>) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: payload ? JSON.stringify(payload) : undefined
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Request failed.");
    }

    router.refresh();
    return result;
  }

  async function saveEntry() {
    setBusyAction("save");
    setStatus(null);

    try {
      const result = await callApi(`/api/logbooks/${logbookId}/entries`, {
        sectionKey: "pre_use_checks",
        rowNo: 1,
        fieldValues: {
          cleaned_by: "Current user",
          checked_time: new Date().toISOString().slice(11, 16),
          line_clearance_done: true,
          remarks: "Saved from starter action"
        }
      });
      setStatus(`Entry saved: ${result.entryId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Entry save failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function submitLogbook() {
    setBusyAction("submit");
    setStatus(null);

    try {
      const result = await callApi(`/api/logbooks/${logbookId}/submit`);
      setStatus(`Status updated: ${result.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Submit failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function signRecord() {
    setBusyAction("sign");
    setStatus(null);

    try {
      const result = await callApi(`/api/logbooks/${logbookId}/sign`, {
        meaning: "reviewed",
        password: "demo-pass",
        comment: "Starter sign action"
      });
      setStatus(`Signature recorded: ${result.signatureId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Signature failed.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="stack">
      <div className="actions" style={{ marginTop: 18 }}>
        <button className="button" type="button" onClick={saveEntry} disabled={busyAction !== null || !canSave}>
          {busyAction === "save" ? "Saving..." : "Save entry"}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={submitLogbook}
          disabled={busyAction !== null || !canSubmit}
        >
          {busyAction === "submit" ? "Submitting..." : "Submit for review"}
        </button>
        <button className="button secondary" type="button" onClick={signRecord} disabled={busyAction !== null || !canSign}>
          {busyAction === "sign" ? "Signing..." : "Sign record"}
        </button>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
