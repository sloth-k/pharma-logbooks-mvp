"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Props = {
  isConfigured: boolean;
  user: {
    email: string;
    fullName?: string;
    roles: string[];
  } | null;
};

export function AuthNav({ isConfigured, user }: Props) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  if (!isConfigured) {
    return <span className="badge">Mock mode</span>;
  }

  if (!user) {
    return (
      <div className="actions">
        <Link className="button secondary" href="/login">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="actions">
      <span className="badge">
        {user.fullName ?? user.email}
        {user.roles.length > 0 ? ` (${user.roles.join(", ")})` : ""}
      </span>
      <button className="button secondary" type="button" onClick={handleSignOut} disabled={isSigningOut}>
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
