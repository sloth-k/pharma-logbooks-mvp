import Link from "next/link";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { AuthNav } from "@/components/auth-nav";

export async function AppShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const isConfigured = isSupabaseConfigured();

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          <span className="eyebrow">Pharma Logbooks MVP</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/dashboard">
            Dashboard
          </Link>
          {!isConfigured || user?.roles.includes("admin") ? (
            <Link className="button secondary" href="/templates/new">
              New Template
            </Link>
          ) : null}
          <AuthNav isConfigured={isConfigured} user={user} />
        </div>
      </div>
      {children}
    </div>
  );
}
