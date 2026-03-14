import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "operator" | "supervisor" | "qa_reviewer" | "qa_approver" | "admin";

export type AuthUserSummary = {
  id: string;
  email: string;
  fullName?: string;
  employeeCode?: string;
  roles: AppRole[];
};

export async function getCurrentUser(): Promise<AuthUserSummary | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("full_name, employee_code").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_role_assignments")
      .select("roles(code)")
      .eq("user_id", user.id)
  ]);

  const roles =
    roleRows?.flatMap((row) => {
      const roleValue = (row as { roles?: { code?: string } | Array<{ code?: string }> }).roles;

      if (Array.isArray(roleValue)) {
        return roleValue
          .map((role) => role.code)
          .filter((code): code is AppRole => Boolean(code));
      }

      if (roleValue?.code) {
        return [roleValue.code as AppRole];
      }

      return [];
    }) ?? [];

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name ?? undefined,
    employeeCode: profile?.employee_code ?? undefined,
    roles
  };
}

export async function requireAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireUserWithRole(allowedRoles: AppRole[]) {
  const user = await requireAuthenticatedUser();

  if (!isSupabaseConfigured()) {
    return user;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.some((role) => user.roles.includes(role))) {
    redirect("/unauthorized");
  }

  return user;
}
