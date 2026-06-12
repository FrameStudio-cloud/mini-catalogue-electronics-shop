# AGENTS.md — Mini Catalogue Electricals

## Session Context

Public-facing store website that reads from mitho-dash Supabase project.
Uses `VITE_SHOP_SLUG` to resolve the shop ID via `getShopId()` helper.
All content (catalogue items, banners, business info) comes from Supabase tables in the mitho-dash project.
Two separate apps (dashboard + website) share one Supabase project — multi-tenant via `shop_id`.

## Build

```bash
npm run dev      # Vite dev server
npm run build    # Production build
```

Known: chunk size warning (>500 kB) on build — not blocking.

## Supabase Tables (shared with mitho-dash)

- `shops` — shop lookup by slug
- `catalogue` — product/service listings (name, type, category, price, image, available, featured, variants, specs, includes, shop_id)
- `banners` — hero/sale/info/alert banners (title, subtitle, message, image_url, link_url, active, sort_order, shop_id)
- `store_settings` — store name, phone, address, whatsapp, business_hours, website_url, shop_id
- `page_views` — tracking visits and product views

## Key Files

- `src/lib/shop.js` — async `getShopId()` singleton, `withShop()` helper
- `src/lib/supabase.js` — Supabase client
- `src/hooks/usePageTracking.js` — tracks page visits + product views → `page_views` table
- `src/components/Navbar.jsx` — includes announcement bar (fetches active sale/info/alert/hero banners)
- `src/components/Hero.jsx` — fetches hero banner from Supabase, falls back to static config
- `src/components/Footer.jsx` — fetches whatsapp + business_hours from store_settings
- `src/components/CatalogueCard.jsx` — shows variant badges (colors/sizes/storage) from catalogue.variants
- `src/components/CatalogueModal.jsx` — product detail modal, tracks product view
- `src/components/Catalogue.jsx` — product grid (currently static config, pending Supabase migration)
- `src/config/shop.js` — static fallback config (name, hero, services, social, etc.)
- `src/config/catalogue.js` — static catalogue data (placeholder until Supabase query is wired)
- `src/admin/AdminDashboard.jsx` — admin CRUD for catalogue items

## Website Sections

1. **AnnouncementBar** — colored bar at top of fixed navbar, rotates through banners
2. **Hero** — headline + service cards, reads hero banner from DB
3. **Catalogue** — product/service grid with search + filter
4. **Gallery** — product images (currently static config)
5. **Footer** — contact, WhatsApp, business hours, links

## Conventions

- Tailwind CSS v4 with CSS variables
- `react-icons` for icons
- `motion/react` for animations
- Emotion-based theme with CSS custom properties
- Dark theme by default (dark navy bg, amber accents)
