# JustBuy Frontend Progress Tracker

Update statuses only after work is actually done. Add links to PRs or notes where useful.

Status values: Not Started / In Progress / Blocked / Needs Review / Completed.

## Phase 0 — Discovery

| Task | Status | Notes |
|---|---|---|
| Inspect repository and Git status | Completed | develop branch, pnpm lockfile checked |
| Inspect Next.js 16 installed docs | Completed | Async request APIs & Turbopack verified |
| Inspect dependencies and shadcn setup | Completed | Base UI, Tailwind v4, Zod installed |
| Review backend API contracts | Completed | Full API contract matrix documented |
| Inspect Figma pages and variables | Completed | Access diagnostic & design system documented |
| Approve implementation plan | Completed | Phase-wise plan approved |

## Phase 1 — Foundation

| Task | Status | Notes |
|---|---|---|
| Design tokens and global styles | Completed | OKLCH color system, Outfit typography in globals.css |
| Shared UI components | Completed | Button, Input, Label, Badge, Card, Skeleton, Separator, EmptyState, ErrorState, LoadingSpinner |
| Axios client | Completed | Centralized client with automatic token refresh queue |
| TanStack Query provider | Completed | Stale/GC times & non-retry on client errors |
| Shared API error handling | Completed | Envelope normalization & field-error mapping |
| Root layout/providers | Completed | Header, Footer, Container, Outfit font, QueryProvider |

## Phase 2 — Authentication

| Task | Status | API verified | UI verified |
|---|---|---|---|
| Create account | Completed | Yes | Yes |
| Login | Completed | Yes | Yes |
| Refresh token | Completed | Yes | Yes |
| Change password | Completed | Yes | Yes |
| Verify account | Completed | Yes | Yes |
| Resend OTP | Completed | Yes | Yes |
| Logout | Completed | Yes | Yes |

## Phase 3 — Buyer

| Task | Status | API verified | UI verified |
|---|---|---|---|
| Get buyer profile | Completed | Yes | Yes |
| Update buyer profile | Completed | Yes | Yes |
| Order history | Completed | Yes | Yes |

## Phase 4 — Public shopping

| Task | Status | API verified | UI verified |
|---|---|---|---|
| Categories | Not Started | No | No |
| New Arrivals (4) | Not Started | No | No |
| Explore Products (8) | Not Started | No | No |
| All Products | Not Started | No | No |
| Product Details | Not Started | No | No |
| Reviews | Not Started | No | No |
| Related Products | Not Started | No | No |

## Phase 5 — Shopping actions

| Task | Status | API verified | UI verified |
|---|---|---|---|
| Wishlist retrieval | Not Started | No | No |
| Add/remove wishlist item | Not Started | No | No |
| Add to cart | Not Started | No | No |
| Other cart operations, if supported | Not Started | No | No |

## Explicitly deferred

Buyer Dashboard, Seller Dashboard and Admin Dashboard — deferred to a separate future React project.

## Verification log

| Date | Scope | Commands/checks actually run | Result |
|---|---|---|---|
| 2026-11-11 | Phase 1 Foundation | `pnpm run lint` | Passed (0 errors) |
| 2026-11-11 | Phase 1 Foundation | `pnpm run build` | Passed (Turbopack compile in 2.0s, TS check in 3.8s, 4/4 pages generated) |
| 2026-11-11 | Phase 2 Authentication | `pnpm --filter frontend lint` | Passed (0 errors, 0 warnings) |
| 2026-11-11 | Phase 2 Authentication | `pnpm --filter frontend build` | Passed (Turbopack compile in 1.3s, TS check in 3.2s, 10/10 static pages generated) |
| 2026-11-11 | Dynamic Header & Toasts | `pnpm --filter frontend lint` | Passed (0 errors, 0 warnings) |
| 2026-11-11 | Dynamic Header & Toasts | `pnpm --filter frontend build` | Passed (Turbopack compile in 1.1s, TS check in 3.3s, 10/10 static pages generated) |
| 2026-11-11 | Phase 3 Buyer & Orders | `pnpm --filter frontend exec eslint .` | Passed (0 errors, 0 warnings) |
| 2026-11-11 | Phase 3 Buyer & Orders | `pnpm --filter frontend build` | Passed (Turbopack compile in 2.2s, TS check in 4.2s, 13/13 pages generated) |

## Blockers / decisions

| Topic | Decision needed | Status |
|---|---|---|
| | | |
