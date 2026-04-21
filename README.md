# HuntMyDeal 🛍️

HuntMyDeal is a high-performance, product-category-driven affiliate engine. This platform uses a Next.js frontend (App Router) tightly integrated with a local Supabase (PostgreSQL) backend to track user favorites, price alerts, and calculate dynamic price discounts automatically.

---

## 🚀 Getting Started Locally

To run this application locally, you must run both the **Supabase Database** and the **Next.js Web App**. 

### 1. Start Supabase (Backend)
Ensure you have Docker Desktop installed and running on your machine.
Open a terminal in the root `HuntMyDeal` folder and run:

```bash
npx supabase start
```

*If this is your first time starting it or you need to re-seed the data, you can reset the containers via `npx supabase db reset`.*

**Supabase URLs:**
- **Studio UI (Database GUI):** [http://127.0.0.1:54323](http://127.0.0.1:54323)
- **API URL:** `http://127.0.0.1:54321`

### 2. Start Next.js (Frontend)
Open a new terminal in the `HuntMyDeal/apps/web` directory and start the dev server:

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

## ☁️ Deploying to Production (VPC)

To deploy the HuntMyDeal frontend to your Hostinger VPS after the database schema has been migrated securely to your self-hosted Supabase instance:

1. **SSH into your VPS:**
   Navigate to the project directory containing your `docker-compose.yml`.

2. **Configure Environment Variables:**
   Create or edit the `.env` file on your server to point to your live Supabase instance:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://srv1603188.hstgr.cloud
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```
   *Note: Never commit `.env` to git. You must create this file manually on the server.*

3. **Rebuild the Container:**
   Next.js bakes `NEXT_PUBLIC_` environment variables into the static frontend files during the build process. To apply the new `.env` variables, you must completely rebuild the container on the VPS:
   ```bash
   git pull origin master
   docker compose up -d --build
   ```

4. **Verify Deployment:**
   Open your live domain (e.g., `http://huntmydeal.com`) and verify that the application successfully fetches data from the production database.

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
5. **Test Auth:** Click "Sign In" at the top right. Enter a dummy email (e.g. `test@deal.com` and a password). The Local Supabase Auth server handles mock confirmations automatically.

### 🔐 Admin Access (Local Testing)
To test admin-only features (like the Homepage Layout Manager), use:
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Dashboard:** `http://localhost:3000/admin/homepage`

### 🗄️ Database Migrations (2026-04-18)
Recently added migrations to optimize Row Level Security (RLS) performance and database security:
- `20260418000008_fix_auth_uid_policies.sql` – Rewrites `auth.uid()` calls in RLS policies to use `(SELECT auth.uid())` for better performance.
- `20260418000009_consolidate_permissive.sql` – Consolidates duplicate permissive policies across tables.
- `20260418000010_fix_remaining_rls.sql` – Replaces `FOR ALL` RLS statements with discrete `INSERT`/`UPDATE`/`DELETE` policies to prevent overlapping policy warnings.
- `20260418000011_fix_function_search_paths.sql` – Hardens database security by applying a strict `search_path` to all `SECURITY DEFINER` and trigger functions.

These migrations are applied automatically when the local environment is launched via `npx supabase start`.
---

## 📅 Content Management & Seasonal Logic

The homepage is dynamic and controlled primarily through the Supabase database. This allows for updating sections, running seasonal sales, and featuring categories without code redeploys.

### 1. Managing Seasonal Sales
Seasonal events (like "Spring Sale") are managed through two tables:
- **`seasons`**: Defines the event name, duration (`start_date` to `end_date`), and visual theme (`css_variables` like primary colors).
- **`deal_seasons`**: A bridge table that maps specific deals to specific seasons.
    - *To add a deal to a season*: Insert a record with the `deal_id` and `season_id`.
    - *To remove a deal*: Delete the corresponding record from this table.

### 2. Customizing HomePage Sections
The order and content of carousels on the homepage are driven by the **`landing_sections`** table:
- **`title`**: The display name of the section (defaults to category/season name if null).
- **`type`**: Automatically handled—if `category_id` is set, it pulls by category; if `season_id` is set, it pulls by season.
- **`sort_order`**: Determines the vertical position on the homepage (lower numbers appear first).
- **`max_items`**: Limits how many deals show up in the carousel (default 12-16).

### 3. "Top Deals Today" Logic
The "Top Deals Today" section is special and is filtered dynamically in `apps/web/src/app/api/deals/route.ts`. It specifically looks for deals where:
- `status = 'active'`
- `in_stock = true`
- (`is_popular = true` OR `discount_percentage >= 30`)

### 4. Updating Limits
If you notice sections are empty, ensure the global fetch limit in `apps/web/src/app/page.tsx` is sufficient (currently set to 200) to cover the varied categories in your `landing_sections`.
