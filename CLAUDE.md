# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check then bundle (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Serve dist/ locally
```

No test suite is configured.

## Architecture

React 19 + TypeScript SPA. Vite build, Tailwind CSS v4 (injected via `@tailwindcss/vite` plugin — no config file), react-router-dom v7, Supabase for auth/database, react-hook-form + zod for forms, recharts for charts.

Path alias `@` → `/src`.

### Layers

| Path | Role |
|------|------|
| `src/App.tsx` | Route tree + `ProtectedRoute` guard |
| `src/contexts/AuthContext.tsx` | Auth state, Supabase session, role |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/lib/orders.ts` | Order CRUD (all DB operations for orders) |
| `src/lib/helpers.ts` | Utility functions |
| `src/types/index.ts` | All shared TypeScript types |
| `src/data/mockData.ts` | Static mock data used in demo mode |
| `src/components/layout/` | `PublicLayout`, `AdminLayout`, `Header`, `Footer` |
| `src/components/ui/` | Reusable UI primitives |
| `src/components/charts/` | Recharts wrappers |
| `src/pages/public/` | Customer-facing pages |
| `src/pages/admin/` | Admin dashboard pages |
| `supabase/migrations/` | Numbered SQL migrations (001–008) |

### Demo / offline mode

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are absent from `.env`, the app enters demo mode:
- Auth uses hardcoded profiles (`DEMO_PROFILE`, `DEMO_ADMIN_PROFILE` in `AuthContext.tsx`)
- Orders persist to `localStorage` (`nutrigo_orders` key) via `getDemoOrders` / `persistDemoOrder` in `src/lib/orders.ts`
- Admin demo login: email `admin@nutrigo.com`, any password

Every function in `src/lib/orders.ts` checks `supabaseConfigured()` first and branches to demo behaviour — follow this pattern when adding new data operations.

### Auth & roles

`AuthContext` exposes `{ user, profile, role, loading, signIn, signUp, signOut }`. Role values: `'user' | 'admin' | 'nutritionist'` (stored in `profiles.role` on Supabase).

`ProtectedRoute` in `App.tsx` accepts `requireAdmin` prop — redirects unauthenticated users to `/login` and non-admins to `/dashboard`.

### Order flow

Guest checkout allowed. Order number format: `NUT-<last4 of timestamp><2-digit random>`. Status state machines in `src/types/index.ts`: `NutriOrderStatus`, `NutriPaymentStatus`, `DeliveryStatus` are tracked separately.
