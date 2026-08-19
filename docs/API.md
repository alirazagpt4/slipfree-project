# API Reference (as consumed by the frontend)

This is **not** backend documentation — the backend lives in a separate system
(`https://slip.nexonsys.com`, not in this repo). This file simply catalogs every HTTP call
the frontend makes today, inferred directly from `fetch()` call sites, so you know what
contract the UI currently depends on. If you change these calls, update this file.

Base URL: `import.meta.env.VITE_API_BASE_URL` (set in `.env`, currently
`https://slip.nexonsys.com/api/v1`).

## Public endpoints (no auth header)

### `GET /receipts/:hash`
Called by: `src/CustomerReceipt.tsx`
Returns: `{ invoice: {...} }` — see the `Invoice` fields in
[`ARCHITECTURE.md`](ARCHITECTURE.md#6-data-model-quick-reference). `invoice.feedback` may
be a raw rating string in varying formats (`not_good`, `NOT_GOOD`, `Not Good`, ...) —
the frontend normalizes it defensively, don't assume one canonical format server-side has
been guaranteed.

### `POST /receipts/:hash/feedback`
Called by: `src/CustomerReceipt.tsx` (`handleFeedback`)
Body: `{ rating: string }` — one of `worst | not_good | fine | good | best`
(see `RATING_MAP` in that file).
Expected response: `{ ...,  }` with `response.ok` true on success; `{ error: string }` on
failure (surfaced verbatim in the toast).

## Admin endpoints

### `POST /admin/login`
Called by: `src/pages/AdminLogin.tsx`
Body: `{ username: string, password: string }`
Expected response: `{ success: boolean, token?: string, error?: string }`. On success the
`token` is stored as `localStorage.admin_token` and used as `Authorization: Bearer <token>`
on every subsequent admin call below.

### `GET /admin/invoices`
Called by: `src/pages/AdminTransactions.tsx`
Auth: `Authorization: Bearer <admin_token>`
Expected response: `{ success: boolean, invoices: Invoice[] }`. **All filtering/sorting is
client-side** — this endpoint is expected to return the full invoice set the admin can
see; there is no `page`/`limit`/filter query param sent here today. If the invoice volume
grows, this — along with `/customers/customers-list` below, which follows the same
fetch-everything-then-filter-client-side pattern — is where server-side pagination will
be needed first.

### `POST /segments`
Called by: `src/pages/AdminTransactions.tsx` (`handleSaveSegment`)
Auth: `Authorization: Bearer <admin_token>`
Body:
```json
{
  "segment_name": "string",
  "filter_criteria": { "color": "string|null", "size": "string|null", "shop": "string|null", "rating": "string|null" },
  "customer_list": [{ "customer_name": "string", "customer_phone": "string", "feedback": "string" }]
}
```
`customer_list` is built client-side from the *currently filtered* invoices, deduped by
`customer_phone` (first match wins).
Expected response: `{ success: boolean, message?: string }`.

### `GET /segments`
Called by: `src/pages/CustomerSegmentsList.tsx`
Auth: `Authorization: Bearer <admin_token>`
Expected response: an array, or `{ segments: [...] }`, or `{ data: [...] }` — the frontend
defensively checks all three shapes (`Array.isArray(data) ? data : (data?.segments ||
data?.data || [])`). Each segment: `{ id, segment_name, total_customers, customer_list?: [{customer_name, customer_phone, feedback?}] }`.

> Note: this file's fallback base URL constant (used only if `VITE_API_BASE_URL` is unset)
> is `https://slip.nexonsys.com/v/api/v1` — has an extra `/v/` segment compared to every
> other file's fallback/actual base. Since `.env` always sets the real var, this hasn't
> caused a live bug, but don't copy this fallback elsewhere. See root `CLAUDE.md`.

### `GET /customers/customers-list`
Called by: `src/pages/CustomerList.tsx`
Auth: `Authorization: Bearer <admin_token>`
Query params: **none.** The frontend fetches the full customer list once on mount (no
`page`/`limit`/`search` sent) and does search + pagination client-side, same as
`GET /admin/invoices` below — see the scaling note there, it applies here too.
Expected response: an array, or `{ customers: [...] }`, or `{ data: [...] }` (same
defensive pattern as `/segments`). No pagination metadata (`totalPages`/`totalCount`) is
read from the response since the frontend doesn't request server-side paging. Each
customer: `{ id?, name, phone, email?, city?, created_at? }` — no feedback/rating field.

## Not yet implemented (frontend has UI, no backend call)

- **"Send to WhatsApp" action** on a segment (`CustomerSegmentsList.tsx`) is currently
  just a client-side `alert()` — there is no API call for this yet. If you're asked to
  wire this up, this is the button (`handleSendToWhatsApp`) and this is the doc to update
  afterward.
- **Dashboard analytics tab** — no data/API wired up at all, just a placeholder string.
- **Customer directory row selection** (`CustomerList.tsx`) — checkboxes and a "N
  selected" toolbar exist, but nothing consumes the selection (no bulk export, no
  "add to segment", no delete). It's local component state only, no API call.

## Auth summary

- Single bearer token, no refresh flow, no role/permission claims consumed by the frontend.
- No endpoint here has its 401/expired-token response handled specially — a failed/expired
  token just surfaces as that screen's generic "failed to load" error state, not an
  automatic redirect to `/admin/login`. The route guard (`ProtectedRoutes.tsx`) only checks
  token *presence* at navigation time, not validity.
