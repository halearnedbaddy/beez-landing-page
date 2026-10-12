import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/shared/ui/AppShell";
import { OnboardingWizard } from "@/features/sell/onboarding/OnboardingWizard";
import { myShopQuery } from "@/features/sell/shops";

export const Route = createFileRoute("/_authenticated/sell/onboarding")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myShopQuery),
  head: () => ({
    meta: [
      { title: "Set up your shop · Beez" },
      { name: "description", content: "Merchant onboarding: tell us about you and your shop in five quick steps." },
      { property: "og:title", content: "Set up your shop · Beez" },
      { property: "og:description", content: "Merchant onboarding in five quick steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { data } = useSuspenseQuery(myShopQuery);
  return (
    <AppShell>
      <OnboardingWizard existing={data} />
    </AppShell>
  );
}
