# Architecture & App Flow

This document explains how SlipFree's frontend is put together: routing, the two user
journeys (customer receipt vs. admin portal), auth, and data flow. For the visual/design
conventions, see [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md). For the exact API calls, see
[`API.md`](API.md).

## 1. Big picture

SlipFree is a **single-page app** with two unrelated audiences sharing one codebase:

```
                         ┌─────────────────────────────┐
                         │   react-router BrowserRouter │
                         │        (src/App.tsx)         │
                         └───────────────┬───────────────┘
                                          │
                ┌─────────────────────────┼─────────────────────────┐
                │                         │                         │
        /v/:hash                 /admin/login              /admin/dashboard
   (public, no auth)              (public)                 (behind ProtectedRoute)
                │                         │                         │
     CustomerReceipt.tsx          AdminLogin.tsx              AdminLayout.tsx
   (exported as `App`)                                    (Sidebar + Header + tabs)
                                                                     │
                                                    ┌────────────────┼────────────────┐
                                                    │                │                │
                                          AdminTransactions   CustomerSegmentsList  CustomerList
                                            (+ Dashboard placeholder tab)
```

Any unmatched URL redirects to `/admin/login` (see the catch-all `*` route in `App.tsx`).

## 2. Routing (`src/App.tsx`)

| Path | Component | Auth | Notes |
|---|---|---|---|
| `/v/:hash` | `CustomerReceipt` (default export of `src/CustomerReceipt.tsx`) | none | `hash` is the `receipt_hash` for one invoice; this is the URL a customer opens from a QR/SMS link on their printed slip. |
| `/admin/login` | `AdminLogin` | none | Username/password form. |
| `/admin/dashboard` | `AdminLayout` | `ProtectedRoute` | Single route; internal tab state (not sub-routes) switches between Dashboard/Customers/Segments/Transactions. |
| `*` (anything else) | redirects to `/admin/login` | — | |

`ProtectedRoutes.tsx` is a layout-route guard: it checks `localStorage.getItem('admin_token')`
and either renders `<Outlet />` (i.e. lets `AdminLayout` render) or `<Navigate to="/admin/login" />`.
This is a **client-side-only** guard — it does not verify the token is valid or unexpired,
it only checks presence. Actual authorization happens server-side when each admin fetch
sends `Authorization: Bearer <token>`; a 401 from the API is not currently intercepted to
force a re-login (each page handles fetch errors independently, generically, as "failed to load").

## 3. Customer receipt flow (`/v/:hash`)

This is the flow a **shop customer** experiences, typically on their phone after checkout.

1. Page loads with `hash` from the URL (the invoice's `receipt_hash`).
2. `useEffect` calls `GET {VITE_API_BASE_URL}/receipts/:hash` (no auth header — public endpoint).
3. Response `data.invoice` is stored in state, then transformed by the local
   `mapReceiptData()` helper into a flat view-model (`brandName`, `date` formatted for
   display, `items` normalized to numbers, `summary` totals, etc.) — this keeps all the
   "what does the backend actually send" munging in one function near the top of the file.
4. If the invoice already has `invoice.feedback` set, the star/emoji rating UI is
   pre-filled and locked (`feedbackSubmitted = true`) via `normalizeRating()`, which is
   defensive against the backend sending the rating as `not_good`, `NOT_GOOD`, `Not Good`,
   etc. — it lowercases/strips/matches keywords rather than doing an exact map lookup.
5. Page renders, section by section, as a **thermal-receipt-styled card stack**:
   1. Brand header (shop name, invoice #, date, cashier)
   2. "How was our service?" 5-emoji rating widget (`Worst`→`Best`)
   3. Customer info (bill-to name/phone)
   4. Line items (name, qty, unit price, total)
   5. Ledger summary (excl. tax, GST, POS fee, discount, total, **Paid**)
   6. Payment mode
   7. Marketing image carousel (`bottomBanners`, hardcoded to `men.webp` + `banner.webp`
      from `public/`, cycled with prev/next + dot indicators)
   8. FBR barcode module (`FbrBarcodeModule`, see below)
   9. Legal/terms footer + "Let's Go Green" paperless messaging + leaf image
6. Tapping an emoji calls `handleFeedback(label)`:
   - Optimistically sets local `feedback` state.
   - `POST {VITE_API_BASE_URL}/receipts/:hash/feedback` with `{ rating: RATING_MAP[label] }`
     (label → snake_case, e.g. `"Not Good"` → `"not_good"`).
   - On success, locks the widget (`feedbackSubmitted = true`) and shows a 1-second toast.
   - Feedback can only be submitted **once** per receipt — re-tapping after submission
     just shows a "Feedback already submitted!" toast without hitting the network.

### FBR barcode module (`components/FbrCodeSection.tsx`)

Renders a CODE128 barcode (via `react-barcode`) of the invoice's FBR invoice number
(Pakistan's Federal Board of Revenue fiscal invoice number, required for tax compliance
on retail receipts). If the backend doesn't provide `fbrInvoiceNo`, it falls back to a
**hardcoded dummy number** (`1002003004005006`) so the barcode section still renders —
this is explicitly flagged in-code as a fallback, not a real fiscal number.

## 4. Admin portal flow

### 4.1 Login (`/admin/login`)

`AdminLogin.tsx` posts `{ username, password }` to `POST /admin/login`. On
`{ success: true, token }`, the token is saved to `localStorage.admin_token` and the user
is navigated to `/admin/dashboard`. On failure, the API's `error` message (or a generic
fallback) is shown inline.

### 4.2 Dashboard shell (`AdminLayout.tsx`)

Not a router — a plain component with local state:
- `isSidebarCollapsed: boolean` — toggles `Sidebar` between icon-only (`w-16`) and full (`w-64`).
- `activeTab: 'dashboard' | 'transactions' | 'segments' | 'customers'` — controls which
  child component renders in the main content area. Defaults to `'transactions'`.
- `handleLogout` clears the token and navigates to `/admin/login` — **see the known key-mismatch
  bug in the root `CLAUDE.md`** (it clears `adminToken`, not the `admin_token` key actually used).

`Sidebar` and `Header` are presentational — they receive `activeTab` + callbacks as props
and don't fetch anything themselves. `Sidebar` also renders a static "Admin Account / System
Operator" profile block (not populated from any real user API).

### 4.3 Transactions tab (`AdminTransactions.tsx`)

The busiest screen in the app. On mount, fetches `GET /admin/invoices` (Bearer auth) once
and does **all filtering, searching, and sorting client-side** with `useMemo`:

- Free-text `search` matches invoice #, customer name/phone, or any item name.
- Filters: rating (`all` / specific rating / `unrated`), shop, color, size, date range.
- `sortBy`: latest / oldest / amount high / amount low.
- Filter option lists (`uniqueShops`, `uniqueColors`, `uniqueSizes`) are derived from the
  loaded invoice set itself (not a separate API), so an option only appears in a dropdown
  if at least one loaded invoice has that value.

Each invoice row is expandable (`toggleExpand`) to show its line-item table. Clicking
"View Receipt" opens a modal (`activeInvoice`) styled like a thermal receipt, with a
**"Print Thermal Slip" button** that calls `window.print()` — the modal has
`print:*` Tailwind variants so only the receipt content prints (screen-only controls are
hidden via `print:hidden`), sized to `print:w-[80mm]` to match thermal printer paper.

**Segment builder**, embedded in the same filter toolbar: typing a name and clicking
"Save Segment" collects the **currently filtered** invoices, dedupes them by
`customer_phone` (first invoice per phone wins), and `POST`s to `/segments` with the
segment name, the active filter criteria (color/size/shop/rating), and the resulting
customer list. This is how "Segments" (tab 4.4) get created — segments are just named,
saved snapshots of a transaction filter's resulting customer list.

### 4.4 Segments tab (`CustomerSegmentsList.tsx`)

Fetches `GET /segments` (Bearer auth) and lists saved segments (name, id, customer count).
Each segment has:
- An **"Action" button** — currently just `alert("send to whats app: <name>")`, i.e. the
  WhatsApp-campaign send is not implemented yet, only stubbed.
- A **"View" button** — opens a modal listing that segment's `customer_list`
  (name + phone), with client-side search and full keyboard-trap/focus-return
  accessibility handling (Escape closes, Tab wraps within the modal, focus returns to the
  triggering button on close).

### 4.5 Customers tab (`CustomerList.tsx`)

A paginated, server-side-searched customer directory:
- `GET /customers/customers-list?page&limit=10&search=` (Bearer auth).
- Search input is **debounced 300ms** before triggering a refetch, and resets `currentPage`
  to 1 on every new search term.
- Uses an `AbortController` to cancel the previous in-flight request if the user types
  again or changes page before the last request resolved (so slow/duplicate responses
  can't race and overwrite newer results — except the intentional "ignore AbortError" in
  the catch block).
- Table shows name, phone, and a "Last Feedback" badge (color-coded by
  `getFeedbackBadgeClass`, matching values like `rated`/`positive`/`unrated`/`negative`).

### 4.6 Dashboard tab

Currently a static placeholder (`"Dashboard Analytics View Placeholder"`) — no chart/metric
implementation yet.

## 5. Auth model summary

- Single admin-wide token (`localStorage.admin_token`), no per-user roles/permissions in
  the frontend — the Sidebar's "Admin Account / System Operator" label is static, not
  derived from the token.
- No token refresh; if the token expires server-side, individual admin screens will just
  show their generic fetch-error UI rather than redirecting to login.
- `CustomerReceipt` (the public receipt page) never sends an `Authorization` header — it's
  fully public by design (anyone with the hash/link can view + rate a receipt once).

## 6. Data model quick reference

The frontend consumes (not owns) these shapes from the API. See individual files for the
full TS interfaces — the most complete one is `Invoice`/`Item`/`Feedback` in
`AdminTransactions.tsx`:

- **Invoice**: id, receipt_hash, invoice_no, fbr_invoice_no, store/shop info, cashier_name,
  customer_name/phone, price_excl_tax, gst_amount, discount, pos_fee, payable_amount,
  payment_mode, created_at, `items: Item[]`, `feedback: Feedback | null`.
- **Item**: product_name, item_name, color, size, quantity, unit_price, gst_percent, total_price.
- **Feedback**: id, rating, comment, submitted_at.
- **Customer** (directory): phone, name, last_feedback (three different, slightly
  inconsistent shapes exist across files — see the "known issues" note in the root
  `CLAUDE.md`).
- **CustomerSegment**: id, segment_name, filter_criteria, total_customers, customer_list.
