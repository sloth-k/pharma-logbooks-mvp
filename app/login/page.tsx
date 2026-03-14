import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export default async function LoginPage() {
  const configured = isSupabaseConfigured();
  const user = await getCurrentUser();

  if (configured && user) {
    redirect("/dashboard");
  }

  return (
    <AppShell
      title="Sign In"
      description="Use Supabase Auth for user access. Until env keys are added, this starter stays in mock-data mode."
    >
      <div className="grid two">
        <section className="card hero">
          <span className="badge">{configured ? "Supabase connected" : "Mock mode active"}</span>
          <h2>Recommended MVP login approach</h2>
          <p>
            Start with email and password in Supabase Auth, then add role assignment in the
            <span className="code"> profiles </span>
            and
            <span className="code"> user_role_assignments </span>
            tables.
          </p>
          <div className="actions">
            <a className="button" href="/dashboard">
              {configured ? "Open dashboard" : "Continue to dashboard"}
            </a>
          </div>
        </section>

        <section className="card">
          <h2>{configured ? "User sign-in" : "Environment setup"}</h2>
          <div className="stack">
            <p className="muted">
              {configured
                ? "Use a Supabase Auth user to access the protected pages and authenticated write paths."
                : "Copy .env.example to .env.local and add your Supabase project URL, publishable key, and service role key."}
            </p>
            {configured ? (
              <LoginForm />
            ) : (
              <>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" placeholder="qa.reviewer@example.com" disabled />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" placeholder="Password" disabled />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
