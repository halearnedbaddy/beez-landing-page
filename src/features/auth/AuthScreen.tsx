import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/sell` },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg("Check your email and tap the link to confirm, then come back to set up your shop.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/sell" });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (r.error) setMsg(r.error.message ?? "Google sign-in failed.");
    else if (!r.redirected) navigate({ to: "/sell" });
  }

  return (
    <div className="mt-6 rounded-2xl border border-border p-6">
      <h1 className="text-2xl font-bold">{mode === "signup" ? "Start selling on Beez" : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "signup" ? "Create your account, then set up your shop in a few minutes." : "Sign in to manage your shop."}
      </p>
      <Button type="button" variant="outline" className="mt-5 w-full" onClick={google}>
        Continue with Google
      </Button>
      <div className="my-4 text-center text-xs text-muted-foreground">or use email</div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {msg && <p className="text-sm text-muted-foreground" role="status">{msg}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 w-full text-center text-sm text-muted-foreground underline"
        onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(null); }}
      >
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </div>
  );
}
