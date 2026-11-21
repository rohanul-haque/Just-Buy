# How to Work — Step-by-Step

## Step 0: Prepare

1. Extract this guideline package into the frontend repository root.
2. Check Git status and make sure no user changes are at risk.
3. Confirm the actual package manager and scripts.
4. Provide the Figma file/link and backend API documentation or backend repository access to the coding agent.

## Step 1: Audit only

Ask the agent to read `AGENTS.md` and `docs/`, inspect the repository, installed Next.js docs, dependencies, existing routes, backend contracts and Figma. It must not change files during this audit.

Expected output: current-state report, missing information, API contract table, Figma page inventory and proposed phase plan.

## Step 2: Resolve unknowns

Confirm endpoint paths, request/response types, auth cookies, verification flow, OTP rules, buyer permissions, product query parameters, review rules, wishlist/cart behavior and Figma responsive frames. Record verified API details in `api-contract-checklist.md`.

## Step 3: Foundation

Approve and implement design tokens, global styles, shared components, root layout/providers, Axios client, TanStack Query and error normalization. Verify the foundation before moving on.

## Step 4: Authentication

Implement one auth operation/page at a time. Recommended order:
1. Create account
2. Verify account
3. Resend OTP
4. Login
5. Refresh token/session recovery
6. Change password
7. Logout

The order may change if the actual backend flow requires it. Verify every route and cookie behavior first.

## Step 5: Buyer

Implement profile retrieval, profile update and order history using actual backend contracts. Do not add dashboard analytics.

## Step 6: Public shopping

Implement categories, homepage New Arrivals (4), Explore Products (8), all products, product details, reviews and related products. Use only backend-supported filters, pagination, sorting and review actions.

## Step 7: Wishlist and cart

Implement confirmed wishlist and cart operations. Verify unauthenticated behavior, duplicate items, quantity constraints, stock rules and server-calculated totals from backend behavior; do not invent these rules.

## Step 8: Quality pass

Test mobile/tablet/desktop, keyboard accessibility, API failure states, session expiry, loading/empty states, typecheck, lint, tests and production build.

## Step 9: Update progress

Update `progress-tracker.md` after verification. Record anything blocked by missing Figma details or backend functionality.

## Working rule

One phase per approval. After each phase, review the result before beginning the next.
