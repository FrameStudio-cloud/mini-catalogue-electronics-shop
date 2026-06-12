import { supabase } from "./supabase";

let cachedShopId = null;

export async function getShopId() {
  if (cachedShopId) return cachedShopId;

  const slug = import.meta.env.VITE_SHOP_SLUG || "my-shop";
  const { data } = await supabase
    .from("shops")
    .select("id")
    .eq("slug", slug)
    .single();

  if (data) {
    cachedShopId = data.id;
    return data.id;
  }

  return null;
}

export function withShop(payload) {
  if (!cachedShopId) throw new Error("Shop not loaded yet");
  return { ...payload, shop_id: cachedShopId };
}
