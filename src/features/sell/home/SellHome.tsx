import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { myShopQuery } from "../shops";

const STATUS: Record<string, { label: string; note: string }> = {
  pending: { label: "Under review", note: "We're checking your details. You'll be able to add products once your shop is approved." },
  approved: { label: "Approved", note: "Your shop is live. Products, orders and earnings are coming next." },
  rejected: { label: "Needs changes", note: "Please review your details and resubmit." },
};

export function SellHome() {
  const { data: shop } = useSuspenseQuery(myShopQuery);

  if (!shop) {
    return (
      <div className="mt-6 rounded-2xl border border-border p-6">
        <h1 className="text-2xl font-bold">Set up your shop</h1>
        <p className="mt-2 text-sm text-muted-foreground">Five quick steps: language, your details, your shop, location and how you sell.</p>
        <Button asChild className="mt-5 w-full"><Link to="/sell/onboarding">Start onboarding</Link></Button>
      </div>
    );
  }

  const s = STATUS[shop.status] ?? STATUS.pending;
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-border p-6">
        <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-bold">{s.label}</span>
        <h1 className="mt-3 text-2xl font-bold">{shop.shop_name}</h1>
        <p className="text-sm text-muted-foreground">{shop.category} · {shop.zone}{shop.landmark ? ` · ${shop.landmark}` : ""}</p>
        <p className="mt-3 text-sm">{s.note}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Owner", shop.owner_name],
          ["Phone", shop.phone],
          ["Language", shop.language === "sw" ? "Kiswahili" : "English"],
          ["M-Pesa", shop.accepts_mpesa ? "Yes" : "No"],
          ["Delivery", shop.offers_delivery ? "Yes" : "No"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border p-3">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <Button asChild variant="outline" className="w-full"><Link to="/sell/onboarding">Edit shop details</Link></Button>
    </div>
  );
}
