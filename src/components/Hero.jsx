import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import shopConfig from "../config/shop";

const serviceImages = {
  cctv: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80",
  solar: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80",
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45249ff78?w=600&q=80",
};

function Hero() {
  const [heroBanner, setHeroBanner] = useState(null);
  const { hero, whatsapp } = shopConfig;
  const whatsappUrl = `https://wa.me/${whatsapp}?text=Hi%20PowerSec%2C%20I%20would%20like%20a%20free%20quote.`;

  useEffect(() => {
    getShopId().then(shopId => {
      if (!shopId) return;
      supabase
        .from("banners")
        .select("*")
        .eq("shop_id", shopId)
        .eq("type", "hero")
        .eq("active", true)
        .order("sort_order")
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) setHeroBanner(data[0]);
        });
    });
  }, []);

  const headline = heroBanner?.title || hero.headline;
  const headlineAccent = heroBanner?.subtitle || hero.headlineAccent;
  const subheadline = heroBanner?.message || hero.subheadline;

  return (
    <section id="home" className="relative min-h-screen bg-primary overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 pt-36 pb-16 min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className="text-5xl sm:text-6xl font-extrabold leading-none tracking-tight mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-white">{headline}</span>
              <br />
              <span className="text-accent">{headlineAccent}</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md font-light">
              {subheadline}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-accent hover:bg-accent2 text-primary font-bold px-6 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Get a Free Quote
              </a>
              <a
                href="#products"
                className="flex items-center gap-2 border border-white/20 hover:border-accent/50 text-white hover:text-accent px-6 py-3.5 rounded-xl transition-all font-semibold text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Our Services
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              {["ERC Certified", "Hikvision Partner", "1 Year Warranty"].map(
                (badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-xs text-slate-400">{badge}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden mb-3 group cursor-pointer">
              <img
                src={serviceImages.cctv}
                alt="CCTV Installation"
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <span
                  className="bg-accent text-primary text-xs font-bold px-2.5 py-1 rounded-full mb-2 inline-block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  CCTV
                </span>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  Security Camera Installation
                </p>
                <p className="text-slate-300 text-xs mt-0.5">HD, 4K & Night Vision</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "solar", label: "Solar Power", sub: "Home & Commercial" },
                { key: "electrical", label: "Electricals", sub: "Wiring & Repairs" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img
                    src={serviceImages[key]}
                    alt={label}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3">
                    <p className="text-white font-semibold text-xs" style={{ fontFamily: "var(--font-display)" }}>
                      {label}
                    </p>
                    <p className="text-slate-300 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
