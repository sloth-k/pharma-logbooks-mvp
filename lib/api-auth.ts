import type { AppRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId() {
  if (!isSupabaseConfigured()) {
    return undefined;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required.");
  }

  return user.id;
}

export async function requireApiRole(allowedRoles: AppRole[]) {
  if (!isSupabaseConfigured()) {
    return undefined;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required.");
  }

  const { data: roleRows, error: roleError } = await supabase
    .from("user_role_assignments")
    .select("roles(code)")
    .eq("user_id", user.id);

  if (roleError) {
    throw new Error(roleError.message);
  }

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

  if (!allowedRoles.some((role) => roles.includes(role))) {
    throw new Error("Insufficient role for this action.");
  }

  return user.id;
}
