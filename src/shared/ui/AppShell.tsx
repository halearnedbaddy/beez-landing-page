import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function AppShell({ children, signedIn = true }: { children: ReactNode; signedIn?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
        <a href="/" className="flex items-center gap-2 font-bold" aria-label="Beez home">
          <img src="/beez-logo.png" alt="" className="h-9 w-auto" />
          <span className="text-lg">Beez</span>
        </a>
        {signedIn && (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/sell" className="text-muted-foreground hover:text-foreground">My shop</Link>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-xl px-5 pb-16">{children}</main>
    </div>
  );
}
