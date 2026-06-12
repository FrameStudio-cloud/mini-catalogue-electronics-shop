import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";

export function trackPageView(page, productName) {
  getShopId().then((shopId) => {
    if (!shopId) return;
    supabase.from("page_views").insert({
      shop_id: shopId,
      page,
      product_name: productName || null,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
    }).then(() => {});
  });
}

export function usePageTracking() {
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);
}
