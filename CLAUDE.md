# CLAUDE.md

Guidance for Claude Code (and any other agent) working in this repository.

## What this project is

**SlipFree** is a digital receipt / e-slip product for retail shops. This repo is the
**frontend only** — a React + TypeScript SPA built with Vite. There is no backend code in
this repository; the frontend talks to a hosted REST API at
`https://slip.nexonsys.com/api/v1` (configurable via `VITE_API_BASE_URL`).

The app has two independent faces:

1. **Customer-facing digital receipt** (`/v/:hash`) — a public page a customer lands on
   (e.g. via QR code / SMS link on their paper slip) showing their itemized invoice, an
   FBR (Federal Board of Revenue, Pakistan) barcode, and a one-tap service-rating widget.
2. **Admin portal** (`/admin/login`, `/admin/dashboard`) — an internal dashboard for shop
   staff to browse transactions, view/print receipts, manage customers, and build customer
   segments for marketing outreach (e.g. WhatsApp campaigns).

For a deeper walkthrough, see the [`docs/`](docs/) folder:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — app flow, routing, auth, data flow
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — visual language, Tailwind conventions, UI patterns
- [`docs/API.md`](docs/API.md) — every backend endpoint the frontend calls, inferred from the fetch calls in code

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 8**
- **react-router-dom v7** for routing (`BrowserRouter`)
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin — no `tailwind.config.js`, config lives in CSS)
- **react-barcode** for the FBR CODE128 barcode on receipts
- **axios** is a dependency but the codebase actually uses the native `fetch` API everywhere — axios is currently unused
- **oxlint** for linting (`.oxlintrc.json`)
- No test framework is set up (no Jest/Vitest, no test files)

## Commands

```
npm run dev       # start Vite dev server
npm run build      # tsc -b && vite build (type-check then bundle)
npm run lint        # oxlint
npm run preview     # preview the production build locally
```

## Project structure

```
src/
  main.tsx                    # entry point, mounts <App />
  App.tsx                     # top-level router (routes below)
  CustomerReceipt.tsx         # the public /v/:hash receipt page (this is the "real" App — see note below)
  index.css                   # Tailwind import + global body style
  App.css                     # leftover Vite template CSS, NOT used by CustomerReceipt or admin pages
  components/
    Header.tsx                 # admin dashboard top bar (shows title for active tab)
    Sidebar.tsx                 # admin dashboard left nav (collapsible)
    ProtectedRoutes.tsx         # route guard, checks localStorage 'admin_token'
    FbrCodeSection.tsx          # FBR barcode block used on the receipt page
  pages/
    AdminLogin.tsx               # admin login form -> POST /admin/login
    AdminLayout.tsx               # admin shell: sidebar + header + tab switcher (NOT sub-routes)
    AdminTransactions.tsx          # invoice list, filters, segment builder, print modal
    CustomerList.tsx                # customer directory: fetches the full list once, then
                                       # searches/paginates entirely client-side (same pattern
                                       # as AdminTransactions), plus a row-selection UI with no
                                       # wired-up bulk action yet (see docs/ARCHITECTURE.md)
    CustomerSegmentsList.tsx        # saved marketing segments + customer-list modal
  types/
    segment.ts                       # shared Customer/CustomerSegment/FilterCriteria types
                                       # (NOTE: duplicated, slightly differently, inline in
                                       # CustomerList.tsx and CustomerSegmentsList.tsx instead
                                       # of importing from here — see docs/ARCHITECTURE.md)
public/                                # static assets served as-is: banner.webp, leaf.jpeg,
                                       # men.webp, favicon.svg, icons.svg, LOGO.jpg (sidebar
                                       # footer logo, see below). logo1/2/3.webp and
                                       # LOGO_blk.webp are NOT referenced anywhere in src/ —
                                       # unused/leftover, same category as App.css/icons.svg below.
```

## Important quirks & known issues (read before changing auth/admin code)

- **`CustomerReceipt.tsx` is exported as `App`** and is the original/legacy top-level
  component before the admin portal was added — it was never renamed. Don't confuse it
  with `src/App.tsx` (the router). Comments in the router literally call it
  "purana App.tsx" (old App.tsx).
- **Admin auth token key mismatch (bug):** login stores the token in `localStorage` as
  `admin_token` (`AdminLogin.tsx`, and `ProtectedRoutes.tsx` reads `admin_token`), but
  `AdminLayout.tsx`'s `handleLogout` removes `adminToken` (different key, no underscore).
  So clicking "Logout" does **not** actually clear the session token. Worth fixing if you
  touch this area, but flagging here so it isn't mistaken for intentional behavior.
- **Admin sections are not routed.** `/admin/dashboard` is a single route; switching
  between Dashboard/Customers/Segments/Transactions is local `useState` tab-switching in
  `AdminLayout.tsx`, not React Router routes. There's no deep-linking to a specific admin
  tab, and no `/admin/dashboard/customers` URL.
- **Inconsistent API base URL fallback.** `CustomerList.tsx` falls back to
  `https://slip.nexonsys.com/api/v1` when `VITE_API_BASE_URL` is unset, but
  `CustomerSegmentsList.tsx` falls back to `https://slip.nexonsys.com/v/api/v1` (extra
  `/v/`, likely a typo). In practice `.env` always sets `VITE_API_BASE_URL`, so this
  fallback mismatch hasn't bitten yet — but don't copy the segments one elsewhere.
  See [`docs/API.md`](docs/API.md).
  - Similarly, `CustomerSegmentsList.customer_list` items don't include a `feedback` prop
    from the segment types define — assume backend response shapes are loosely typed
    (lots of `any`, defensive fallback field-name checks like
    `data?.customers || data?.data || []`). Verify actual API shape before trusting `interface`s.
- **`src/types/segment.ts` is only partially used.** `AdminLayout.tsx` even has the import
  commented out. `CustomerSegmentsList.tsx` redeclares its own local `Customer`/
  `CustomerSegment` that don't quite match `types/segment.ts` (e.g. `feedback` is required
  in `types/segment.ts`, optional in `CustomerSegmentsList.tsx`). `CustomerList.tsx` has
  its own, unrelated `Customer` interface (`id?`, `name`, `phone`, `email?`, `city?`,
  `created_at?`) for the customer-directory table — it has no `feedback`/`last_feedback`
  field at all, so don't assume it's the same shape as the other two `Customer` types just
  because they share a name. If you're doing a cleanup pass, this divergence is a good
  candidate to unify — but confirm the real API shape first, don't unify silently.
- **`CustomerList.tsx` fetches the entire customer list once, unfiltered/unpaginated,
  and does search + pagination client-side** — same pattern as `AdminTransactions.tsx`.
  It no longer sends `page`/`limit`/`search` query params to `/customers/customers-list`
  despite the endpoint name suggesting server-side listing; see
  [`docs/API.md`](docs/API.md). This is fine at current data volumes but, like the
  `/admin/invoices` note in `API.md`, will need real server-side pagination if the
  customer count grows. The table also has a row-selection UI (checkboxes, "select all on
  page", a "N selected / Deselect all" toolbar) with **no bulk action wired to it yet** —
  selection is currently local-only state.
- **Sidebar footer shows a static company logo, not a user profile.** `Sidebar.tsx`'s
  footer renders `public/LOGO.jpg` (visible only when the sidebar is expanded) next to the
  logout button — there is no "Admin Account / System Operator" block anymore (that was
  removed; don't reintroduce it as if it were still current). `public/LOGO_blk.webp` was
  added alongside `LOGO.jpg` but isn't referenced anywhere — likely an alternate/dark-mode
  logo staged for later use.
- **`src/App.css` and `public/icons.svg`** are unused leftovers from the default
  Vite+React template (`.hero`, `#next-steps`, social icons for Bluesky/Discord/etc.).
  Not imported/rendered anywhere. Safe to ignore or remove.
- **Mixed English/Roman-Urdu ("Hinglish") comments and `alert()`/`confirm()`-style UX
  copy** appear in places (e.g. `AdminTransactions.tsx`'s segment-save flow uses
  `alert("Pehle segment ka naam likhein...")`). This is existing style, not something to
  "fix" unless asked — match the surrounding file's tone if you edit nearby code.
- **No test suite.** Verify changes by running `npm run dev` and exercising the UI, plus
  `npm run build` for type errors.
- Tailwind v4 is configured via `@tailwindcss/vite` in `vite.config.ts` — there is
  intentionally no `tailwind.config.js`. Don't add one out of habit; theme customization
  (if ever needed) belongs in CSS via `@theme`.

## Environment

`.env` sets `VITE_API_BASE_URL` (currently pointed at the live production API,
`https://slip.nexonsys.com/api/v1`). Note this file is **not** in `.gitignore` — it
currently only contains a public base URL (no secrets), but be careful before adding
anything sensitive to it.
