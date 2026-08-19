# Design System

SlipFree doesn't have a formal design system package (no shared component library, no
design tokens file, no Storybook) — this document reverse-engineers the conventions that
are consistently followed across the codebase so future UI work stays visually consistent.
Everything is **Tailwind CSS v4 utility classes**, applied directly in JSX; there are no
reusable styled components (e.g. no shared `<Button>` or `<Card>`).

## 1. Setup

- Tailwind v4 via `@tailwindcss/vite` (`vite.config.ts`) — no `tailwind.config.js`.
- Global stylesheet is `src/index.css`: just `@import "tailwindcss";` plus one global rule
  (`body { background-color: #f1f5f9 }`, i.e. Tailwind's `slate-100`).
- `src/App.css` exists but is **unused** — leftover default Vite+React template styles
  (`.hero`, `#next-steps`, social-icon nav). Don't build on it; if you need shared CSS,
  either use Tailwind utilities or add rules to `index.css`.

## 2. Two distinct visual "modes"

The app has two separate visual languages because it serves two audiences:

### A. Customer receipt (`CustomerReceipt.tsx`) — "digital thermal slip"
A single scrollable column of white rounded cards on a light blue-grey backdrop
(`bg-[#e4ecf5]`), meant to *feel* like a paper receipt on a phone screen:
- Card radius: `rounded-[18px]` (bespoke, larger than Tailwind's default scale — used
  consistently for every section on this page).
- Card border: `border border-slate-200/50` (very light, barely-there separation) rather
  than shadows — the page relies on the blue-grey page background for contrast, not on
  card elevation.
- Content max width: `max-w-[440px]` — phone-width even on desktop, since this page is
  designed to be opened from a phone (QR/SMS link).
- Typography: base body uses Tailwind's default sans stack, but the brand title
  (`"LOGO"` — the shop's wordmark placeholder) uses a **page-local `<style>` block**
  importing **Poppins** from Google Fonts and applying extreme letter-spacing
  (`letter-spacing: 0.55em`) for a boutique/retail wordmark feel. This is the only
  non-Tailwind, non-system font in the app, and it's scoped to this one page.
- Numbers/monospace: invoice number, phone number, and FBR barcode value use `font-mono`
  to visually read as machine-generated/scannable data.
- Color for money: mostly neutral (`text-slate-800`/`text-slate-400`), with the **final
  "Paid" total in bold black** (`text-black font-semibold`) as the one emphasized figure
  on the page.
- Feedback emojis: unselected state is dimmed (`opacity-60`), selected state gets a
  `ring-2 ring-amber-400` + slight scale-up, and once submitted all others fade to
  `opacity-20 grayscale` — a single clear "you picked this, it's locked" affordance.
- Toasts: pill-shaped, fixed to `top-6`, `bg-emerald-600` (success) / `bg-rose-600`
  (error), auto-dismiss after 1s.

### B. Admin portal — "operational dashboard"
Denser, data-table-driven UI, closer to a typical SaaS back-office:
- Layout: fixed-height `flex h-screen` app shell — `Sidebar` (fixed width, collapsible)
  + main column (`Header` + scrollable content `p-6`). `Sidebar`'s footer shows a static
  company logo (`public/LOGO.jpg`, hidden when collapsed) next to the logout button —
  there's no per-admin identity/avatar anywhere in the UI.
- Card radius: standard Tailwind `rounded-xl` / `rounded-lg` (not the bespoke `18px` used
  on the receipt page) with `border-slate-200` + `shadow-sm` — flatter, more utilitarian.
- Tables: `text-xs`, `divide-y divide-slate-100` rows, uppercase `text-[11px]
  font-bold text-slate-500 tracking-wider` column headers on a `bg-slate-50/75` header row.
- Badges/pills (rating, feedback status): `px-2.5 py-0.5 rounded-full` (or `rounded` for
  the transactions rating badge) with a `bg-*-100 text-*-700`-style pairing per status —
  see the color mapping below.
- Modals: `fixed inset-0 bg-slate-900/60 backdrop-blur-sm`, click-outside-to-close via a
  wrapper `onClick` + `stopPropagation` on the inner box, `Escape`-to-close via a
  `keydown` listener, and (in `CustomerSegmentsList`) explicit **focus-trap + focus-return**
  handling — treat that modal as the reference implementation for accessible modals in
  this app if you add another one.
- Print support: the transaction receipt modal uses Tailwind's `print:` variant
  (`print:hidden`, `print:w-[80mm]`, `print:shadow-none`) to produce a clean thermal-width
  printout via `window.print()` — no separate print stylesheet or library.

## 3. Color palette (Tailwind default palette, no custom colors defined)

| Role | Classes | Where |
|---|---|---|
| Page background | `bg-slate-100` / `bg-[#e4ecf5]` (receipt only) | body / CustomerReceipt |
| Surface / card | `bg-white` | almost everything |
| Primary text | `text-slate-800` / `text-slate-900` | headings, key values |
| Secondary/muted text | `text-slate-400` / `text-slate-500` | labels, meta info |
| Borders | `border-slate-200` (admin) / `border-slate-200/50` (receipt) | cards |
| Primary interactive (brand accent) | `indigo-600` (bg/text), `indigo-500` (focus rings) | buttons, active sidebar item, focus states, links |
| Success / positive | `emerald-*` | success toast, "Best/Good" rating badges, discount amounts, WhatsApp "Action" button |
| Danger / negative | `rose-*` | error toast, logout hover state, "Worst/Not Good" badges, "Reset Filters" |
| Warning / neutral-attention | `amber-*` | "Fine" rating badge, "unrated" customer badge, selected-emoji ring |
| Info accent (segments) | `blue-*` | segment count pill, "View" button in Segments tab |

**Consistency note:** the admin transactions rating badges (`renderRatingBadge` in
`AdminTransactions.tsx`) use an `emerald`/`amber`/`rose` success/warning/danger mapping —
keep that mapping if you add another "status" indicator anywhere else. (The customer
directory, `CustomerList.tsx`, no longer has a feedback/status column or badge at all —
its `getFeedbackBadgeClass` helper was removed along with the `last_feedback` field when
the table was reworked to show Name/Phone/Email/City instead.)

## 4. Interaction / accessibility conventions

- All icon-only or ambiguous buttons get `aria-label` (sidebar toggle, logout, modal
  close, carousel prev/next, search icon context).
- Focus states use `focus:outline-none focus:ring-2 focus:ring-{color}-500`
  (color matches the button's semantic role — indigo for primary, rose for destructive,
  blue for segment actions) rather than relying on default browser outlines.
- Loading states: inline `role="status" aria-live="polite"` with a spinning SVG
  (`animate-spin`) + short label text (e.g. "Fetching records...") — used in both
  `CustomerList` and implicitly elsewhere via plain "Loading..." text blocks.
- Empty/error states always pair the message with a **Retry** action that re-runs the
  fetch function, never just a dead-end message.
- Disabled states pair `disabled` with `opacity-50 cursor-not-allowed` (or `opacity-20
  grayscale` for the receipt's locked feedback emojis) so disabled controls are always
  visually distinct, not just non-interactive.

## 5. Extending this system

There's no component abstraction layer yet — if you're adding a new admin screen or a new
card type, the fastest way to stay consistent is to **copy the closest existing
pattern** (e.g. copy `CustomerList.tsx`'s table+pagination shell for a new list view, or
`CustomerSegmentsList.tsx`'s modal for a new dialog) rather than inventing new spacing/
radius/color values. If a third or fourth screen ends up needing the same modal or badge
markup, that's a good signal to extract a shared component under `src/components/` instead
of copy-pasting again.
