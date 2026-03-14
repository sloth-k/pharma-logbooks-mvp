import { AppShell } from "@/components/app-shell";

export default async function UnauthorizedPage() {
  return (
    <AppShell
      title="Unauthorized"
      description="The current user is authenticated but does not have the required role for this page."
    >
      <section className="card">
        <h2>Access blocked</h2>
        <p className="muted">
          Assign the correct role in <span className="code">user_role_assignments</span> and try again.
        </p>
      </section>
    </AppShell>
  );
}
