# Project Skill: HuntMyDeal

This document contains the core principles, architectural patterns, and design standards for the HuntMyDeal platform. Follow these rules to ensure consistency and maintain project integrity while building new features.

## 1. Core Architecture Pattern: "Server Hydrated, Client Managed"

Standardize all Admin pages using the following breakdown:
- **Server Page (`page.tsx`)**: Fetches initial data (including enriched related fields). Minimizes client-side "pop-in" by passing props to the client manager.
- **Client Manager (`ManagerClient.tsx`)**: Handles local state, search/filtering, and modal toggles.
- **Components (`DealForm.tsx`, `CategoryForm.tsx`)**: Specialized form components used within modals for creation and editing.

### API Routing Convention
All Admin APIs must use a single `POST` route with an `action` parameter to route logic:
```typescript
const { action, id, data } = await req.json();
if (action === "create") { ... }
if (action === "update") { ... }
if (action === "delete") { ... }
```

## 2. UI & Aesthetic Standards

HuntMyDeal is a **premium, high-fidelity** platform. Every UI element must feel intentional and polished.

- **Color Palette**: 
  - Primary Brand Green: `#53A318` (Emerald)
  - Layout: Clean white surfaces with light gray backgrounds (`bg-gray-50`) or deep high-contrast dark modes.
- **Interactions**: 
  - Use `hover:scale-105 active:scale-95 transition-all` for buttons.
  - Border Radius: Favor `rounded-2xl` and `rounded-3xl` for a modern, approachable feel.
- **Icons**: Exclusively use `lucide-react`.

## 3. Database & Sync Stewardship

- **Migrations First**: Never assume schema state. Always create a new migration for structural changes.
- **Uniqueness & Integrity**: 
  - Use bridge tables for many-to-many relationships (e.g., `deal_seasons`).
  - Add `UNIQUE` constraints to UI configuration tables (e.g., `navigation_items`) to support safe `UPSERT` operations.
- **Sync Logic**: When updating a primary entity (Category), the API is responsible for syncing visibility entries in secondary tables (`landing_sections`, `navigation_items`) to prevent UI drift.

## 4. Safety Guard Rails

### Security
1. **Double Auth Check**: Every Admin API must verify the session via `supabase.auth.getUser()` AND verify the `role === 'admin'` in the `profiles` table.
2. **Admin Client usage**: Use `createSupabaseAdmin()` (service role) only within protected API routes to bypass RLS when performing complex cross-table syncs.

### Validation
- **Pricing**: Current price must never exceed original price.
- **URLs**: Validate merchant URLs before persistence.
- **Defaults**: Categorize unresolved deals as `other` to maintain FK integrity.

## 5. Development Workflow
- **Task-Driven**: Maintain and update `task.md` for any feature rollout.
- **Verification**: Always verify database sync after implementing UI toggles.
- **Implementation Plans**: For complex features, outline data model impact before writing UI code.

## 6. Adaptive Multi-Device Workflow (Mobile-First)

HuntMyDeal follows an **Adaptive Shell** architecture. The application must provide a distinct, app-like experience for mobile while maintaining a high-density professional experience for desktop.

### Mobile Immersive Standards
- **Core Navigation**: Exclusively use a fixed **Bottom Navigation Bar** for primary actions (Home, Search, Favorites, Notifications, Profile).
- **In-App Feel**: On mobile, the app must ignore standard browser "web" patterns and feel like an installed application. No horizontal scroll on the body, full-height modals, and touch-optimized padding.
- **Search**: Mobile search must be triggered via a dedicated icon in the header or bottom nav, opening a full-screen search state/modal.

### Device Detection & Strategy
- **Responsive Shells**: Use the `MobileShell` vs `DesktopShell` pattern. Avoid `hidden` classes for large layout differences; instead, conditionally render the appropriate component tree (e.g., using `isMobile` hooks or high-performance media queries).
- **Consistency**: Data models and backend APIs must be shared. Logic changes in the `ManagerClient` must reflect across both shells.
- **No Regressions**: Structural changes to support mobile **MUST NOT** affect the current desktop layout or styling. Always use strict breakpoint scoping.
