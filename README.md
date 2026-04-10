# DealNexus 🛍️

DealNexus is a high-performance, product-category-driven affiliate engine. This platform uses a Next.js frontend (App Router) tightly integrated with a local Supabase (PostgreSQL) backend to track user favorites, price alerts, and calculate dynamic price discounts automatically.

---

## 🚀 Getting Started Locally

To run this application locally, you must run both the **Supabase Database** and the **Next.js Web App**. 

### 1. Start Supabase (Backend)
Ensure you have Docker Desktop installed and running on your machine.
Open a terminal in the root `DealDash` folder and run:

```bash
npx supabase start
```

*If this is your first time starting it or you need to re-seed the data, you can reset the containers via `npx supabase db reset`.*

**Supabase URLs:**
- **Studio UI (Database GUI):** [http://127.0.0.1:54323](http://127.0.0.1:54323)
- **API URL:** `http://127.0.0.1:54321`

### 2. Start Next.js (Frontend)
Open a new terminal in the `DealDash/apps/web` directory and start the dev server:

```bash
cd apps/web
npm run dev
```

**App URLs:**
- **Homepage:** [http://localhost:3000](http://localhost:3000)
- **Login / Signup:** Click "Sign In" on the Navbar or go to [http://localhost:3000/login](http://localhost:3000/login)
- **User Dashboard (Saved/Alerts):** [http://localhost:3000/profile](http://localhost:3000/profile)
- **Deal API Endpoint:** [http://localhost:3000/api/deals](http://localhost:3000/api/deals)

---

## 📂 Project Architecture & Component Map

The repository is a monorepo setup containing the backend, frontend, and our future scraping architecture.

### Directory Structure
- `/apps/web/` - The Next.js 15 Frontend
- `/supabase/` - Database schemas, migrations, seed data, and Edge functions
- `/services/` - Future Node.js Scraping workers (Phase 3)

### Key Frontend Components (`apps/web/src/components`)
- **`DealCard.tsx`**: The core brick of the app. It handles rendering a product's image, title, calculated discount percentage, and handles `toggleFavorite` logic.
- **`UserMenu.tsx`**: The profile dropdown inside the Navbar. Handles Signing Out and Profile navigation.
- **`LoginModal.tsx`**: A unified auth-modal triggered anywhere in the app to authenticate users tracking deals without forcing them strictly to an auth page.
- **`AuthProvider.tsx`**: The Context Provider wrapping the entire app to smoothly maintain Supabase session state on the client.
- **`ThemeProvider.tsx`**: Used for injecting the "Season" or visual context (Glassmorphism, colors) dynamically.

### Key Next.js Routes (`apps/web/src/app`)
- **`/page.tsx`**: The dynamic Homepage. It queries the `/api/deals` route, maps the responses out by `<Carousel />` category blocks, and renders the Flash Deals.
- **`/profile/...`**: Encapsulates the user dashboard (Saved items, alerts, settings). Rendered behind auth guards.
- **`/api/deals/route.ts`**: The workhorse API route. It reads from Postgres, filters based on `status = 'active'` and `in_stock = true`, and serves the product data back to the browser safely.

---

## 🛠️ Manually Testing The App

1. Make sure `npx supabase start` is running.
2. Make sure `npm run dev` is active in `apps/web`.
3. Open `http://localhost:3000` in your web browser. 
4. **Test the Data:** You should instantly see carousels packed with Electronics, Home & Kitchen, Toys, and Sports deals. If the page is blank, confirm that the database seeded properly using Supabase Studio at `http://127.0.0.1:54323`.
5. **Test Auth:** Click "Sign In" at the top right. Enter a dummy email (e.g. `test@deal.com` and a password). The Local Supabase Auth server handles mock confirmations automatically, meaning you can instantly test the bookmark component without needing a real SMTP server.
