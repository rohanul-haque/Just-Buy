# JustBuy Frontend Agent Instructions

Read `README.md` and the relevant documents in `docs/` before coding.

## Current project boundary

Implement only:
- Authentication: registration, login, refresh token, password change, account verification, resend OTP, logout.
- Buyer profile: get and update.
- Buyer order history.
- Categories.
- Homepage New Arrivals (4 products) and Explore Products (8 products).
- All products, product details, reviews and related products.
- Wishlist.
- Add to cart and other cart operations only when confirmed in backend.

Do not implement buyer, seller or admin dashboards. Those are future work in a separate React project. Do not add dashboard links or placeholder dashboard pages.

## Mandatory preflight

1. Inspect Git status and preserve all existing user changes.
2. Inspect repository structure, package manager, `package.json`, lockfile, installed libraries and current implementation.
3. Read relevant installed Next.js 16 documentation under `node_modules/next/dist/docs/` before using framework APIs.
4. Inspect the actual backend routes, controllers, services, validation, middleware and response format.
5. Inspect the relevant Figma frames, component variants, variables, assets, breakpoints and interaction states.
6. Identify unknowns. Ask instead of guessing.

## Implementation rules

- Next.js 16 App Router and TypeScript.
- Use existing Tailwind and shadcn/ui setup. Verify installed component APIs; do not assume Radix APIs if the project uses Base UI.
- Use Axios for HTTP, TanStack Query for server state, React Hook Form and Zod for forms, if installed/configured.
- Server Components by default; Client Components only when needed.
- Do not expose httpOnly cookies to browser JavaScript.
- Do not invent endpoints, payloads, response properties, roles, permissions, redirect destinations, OTP policies, stock rules, prices or cart behavior.
- Build accessible, responsive UI matching Figma.
- Implement loading, empty, error, disabled, pending and success states where applicable.
- Avoid unnecessary dependencies and architecture changes.
- Do not commit, push, reset or discard changes unless explicitly requested.

## Work cadence

Work one phase at a time. Before coding, provide objective, scope, files, API dependencies, unknowns and test plan. Wait for approval for each phase. After coding, run applicable checks and update `docs/progress-tracker.md`. Do not start the next phase automatically.

## Completion report

State files changed, behavior implemented, endpoints used, tests/commands actually run, unresolved issues and tracker updates. Never claim unrun checks passed.
