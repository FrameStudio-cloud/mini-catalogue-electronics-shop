# Mini Catalogue Electricals

A **public-facing store website** for electricals and small businesses, powered by a shared Supabase backend. Built with React 19, Vite, Tailwind CSS v4, Framer Motion, and Supabase. Displays product catalogue, banners, business info, and gallery — all managed from the companion **mitho-dash** dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Library** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 + Emotion |
| **Animations** | motion/react (Framer Motion) |
| **Icons** | React Icons 5 |
| **Backend / DB** | Supabase (shared with mitho-dash) |

---

## Architecture

Two separate apps (dashboard + website) share one Supabase project. The website is read-only for most tables (catalogue, banners, store_settings), with a basic admin dashboard for on-site CRUD.

```
mitho-dash (manage)  →  Supabase  ←  mini-catalogue-electricals (display)
```

---

## Project Structure

```
mini-catalogue-electricals/
├── .env                        # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SHOP_SLUG
├── AGENTS.md                   # AI development session context
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css               # Tailwind v4 + dark theme CSS variables
│   ├── lib/
│   │   ├── supabase.js         # Supabase client
│   │   └── shop.js             # getShopId(), withShop()
│   ├── hooks/
│   │   └── usePageTracking.js  # Tracks visits → page_views table
│   ├── config/
│   │   ├── shop.js             # Static fallback shop config
│   │   └── catalogue.js        # Static fallback catalogue data
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation + AnnouncementBar (Supabase banners)
│   │   ├── Hero.jsx            # Hero section (Supabase hero banner)
│   │   ├── Catalogue.jsx       # Product grid (config placeholder)
│   │   ├── CatalogueCard.jsx   # Product card with variant badges
│   │   ├── CatalogueModal.jsx  # Product detail modal with page tracking
│   │   ├── Gallery.jsx         # Image gallery (config placeholder)
│   │   ├── Footer.jsx          # Contact, WhatsApp, business hours (Supabase)
│   │   └── ...
│   └── admin/
│       └── AdminDashboard.jsx  # Basic admin CRUD for catalogue items
└── dist/
```

---

## Features

- **Supabase-powered content** — hero banners, announcement bar, business hours, WhatsApp number all read from DB
- **Announcement bar** — rotates through sale/info/alert/hero banners from Supabase
- **Business hours** — footer shows today's hours dynamically from stored settings
- **Variant badges** — color, size, storage badges from catalogue item variants
- **Page tracking** — usePageTracking hook logs visits to page_views table
- **Admin dashboard** — basic CRUD for catalogue items
- **Static fallback** — config files serve as fallback when Supabase data is unavailable
- **Dark theme** — dark navy background with amber accents

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |

---

## Setup

```bash
git clone <repo-url> mini-catalogue-electricals
cd mini-catalogue-electricals
npm install

# Create .env:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key
#   VITE_SHOP_SLUG=my-shop

npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (shared with mitho-dash) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key (shared with mitho-dash) |
| `VITE_SHOP_SLUG` | Shop slug to resolve shop ID from `shops` table |
