import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { normaliseKenyanPhone } from "@/shared/utils/phone";
import { CATEGORIES, ZONES, myShopQuery, saveMyShop, type Shop, type ShopInput } from "../shops";

const STEPS = ["Language", "About you", "Your shop", "Location", "Selling"] as const;

export function OnboardingWizard({ existing }: { existing: Shop | null }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<ShopInput>({
    language: existing?.language ?? "en",
    owner_name: existing?.owner_name ?? "",
    phone: existing?.phone ?? "",
    shop_name: existing?.shop_name ?? "",
    category: existing?.category ?? "",
    description: existing?.description ?? "",
    zone: existing?.zone ?? "",
    landmark: existing?.landmark ?? "",
    offers_delivery: existing?.offers_delivery ?? true,
    accepts_mpesa: existing?.accepts_mpesa ?? true,
  });
  const set = <K extends keyof ShopInput>(k: K, v: ShopInput[K]) => setF((p) => ({ ...p, [k]: v }));

  function validate(): string | null {
    if (step === 1) {
      if (f.owner_name.trim().length < 2) return "Please enter your name.";
      if (!normaliseKenyanPhone(f.phone)) return "Enter a Kenyan mobile number, e.g. 0712 345 678.";
    }
    if (step === 2) {
      if (f.shop_name.trim().length < 2) return "Please enter your shop name.";
      if (!f.category) return "Pick what you sell.";
    }
    if (step === 3 && !f.zone) return "Pick your area.";
    return null;
  }

  async function next() {
    const v = validate();
    setError(v);
    if (v) return;
    if (step < STEPS.length - 1) return setStep(step + 1);
    setBusy(true);
    try {
      await saveMyShop({
        ...f,
        owner_name: f.owner_name.trim(),
        shop_name: f.shop_name.trim(),
        phone: normaliseKenyanPhone(f.phone)!,
        description: f.description?.trim() || null,
        landmark: f.landmark?.trim() || null,
      });
      await qc.invalidateQueries({ queryKey: myShopQuery.queryKey });
      navigate({ to: "/sell" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your shop.");
    } finally {
      setBusy(false);
    }
  }

  const tile = (active: boolean) =>
    `rounded-xl border px-4 py-3 text-left text-sm transition ${active ? "border-primary bg-primary/15 font-semibold" : "border-border hover:border-primary/60"}`;

  return (
    <div className="mt-4">
      <div className="flex gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <div className="mt-4 space-y-4 rounded-2xl border border-border p-5">
        {step === 0 && (
          <>
            <h1 className="text-2xl font-bold">Choose your language</h1>
            <p className="text-sm text-muted-foreground">Chagua lugha yako</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className={tile(f.language === "en")} onClick={() => set("language", "en")}>English</button>
              <button type="button" className={tile(f.language === "sw")} onClick={() => set("language", "sw")}>Kiswahili</button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold">About you</h1>
            <div><Label htmlFor="name">Your name</Label><Input id="name" value={f.owner_name} onChange={(e) => set("owner_name", e.target.value)} /></div>
            <div>
              <Label htmlFor="phone">M-Pesa phone number</Label>
              <Input id="phone" inputMode="tel" placeholder="0712 345 678" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">Customers' payments and order alerts go to this number.</p>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold">Your shop</h1>
            <div><Label htmlFor="shop">Shop name</Label><Input id="shop" value={f.shop_name} onChange={(e) => set("shop_name", e.target.value)} /></div>
            <div>
              <Label>What do you sell?</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" className={tile(f.category === c)} onClick={() => set("category", c)}>{c}</button>
                ))}
              </div>
            </div>
            <div><Label htmlFor="desc">Short description (optional)</Label><Textarea id="desc" rows={3} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold">Where is your shop?</h1>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map((z) => (
                <button key={z} type="button" className={tile(f.zone === z)} onClick={() => set("zone", z)}>{z}</button>
              ))}
            </div>
            <div><Label htmlFor="landmark">Nearby landmark (optional)</Label><Input id="landmark" placeholder="e.g. opposite the main gate" value={f.landmark ?? ""} onChange={(e) => set("landmark", e.target.value)} /></div>
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="text-2xl font-bold">How you sell</h1>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <span><b className="block text-sm">Accept M-Pesa</b><span className="text-xs text-muted-foreground">Customers pay before you hand over the order.</span></span>
              <Switch checked={f.accepts_mpesa ?? true} onCheckedChange={(v) => set("accepts_mpesa", v)} />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <span><b className="block text-sm">Offer delivery</b><span className="text-xs text-muted-foreground">Approved Beez riders pick up from your shop.</span></span>
              <Switch checked={f.offers_delivery ?? true} onCheckedChange={(v) => set("offers_delivery", v)} />
            </label>
          </>
        )}

        {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
        <div className="flex gap-3 pt-2">
          {step > 0 && <Button type="button" variant="outline" onClick={() => { setError(null); setStep(step - 1); }}>Back</Button>}
          <Button type="button" className="flex-1" onClick={next} disabled={busy}>
            {step === STEPS.length - 1 ? (busy ? "Saving…" : existing ? "Save changes" : "Submit my shop") : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
