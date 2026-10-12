import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/shared/ui/AppShell";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { useSession } from "@/shared/auth/useSession";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in · Beez for merchants" },
      { name: "description", content: "Create your Beez merchant account and set up your shop." },
      { property: "og:title", content: "Sign in · Beez for merchants" },
      { property: "og:description", content: "Create your Beez merchant account and set up your shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && user) navigate({ to: "/sell" });
  }, [ready, user, navigate]);
  return (
    <AppShell signedIn={false}>
      <AuthScreen />
    </AppShell>
  );
}
