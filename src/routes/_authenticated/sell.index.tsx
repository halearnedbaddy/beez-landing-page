import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/shared/ui/AppShell";
import { SellHome } from "@/features/sell/home/SellHome";
import { myShopQuery } from "@/features/sell/shops";

export const Route = createFileRoute("/_authenticated/sell/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myShopQuery),
  head: () => ({
    meta: [
      { title: "My shop · Beez" },
      { name: "description", content: "Your Beez merchant home: shop status and details." },
      { property: "og:title", content: "My shop · Beez" },
      { property: "og:description", content: "Your Beez merchant home: shop status and details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <SellHome />
    </AppShell>
  ),
});
