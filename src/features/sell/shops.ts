import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Shop = Database["public"]["Tables"]["shops"]["Row"];
export type ShopInput = Omit<Database["public"]["Tables"]["shops"]["Insert"], "owner_id" | "status">;

export const myShopQuery = queryOptions({
  queryKey: ["sell", "my-shop"],
  queryFn: async (): Promise<Shop | null> => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase.from("shops").select("*").eq("owner_id", u.user.id).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export async function saveMyShop(input: ShopInput) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in again.");
  const { error } = await supabase
    .from("shops")
    .upsert({ ...input, owner_id: u.user.id }, { onConflict: "owner_id" });
  if (error) throw error;
}

export const CATEGORIES = [
  "Fruit & vegetables",
  "Groceries & cereals",
  "Fish & meat",
  "Clothes & shoes",
  "Phones & electronics",
  "Hardware",
  "Beauty & salon",
  "Cooked food",
  "Other",
];

export const ZONES = ["Mombasa CBD", "Kongowea", "Nyali", "Likoni", "Bamburi", "Changamwe", "Mtwapa", "Other"];
