# Project Overview

JustBuy is a multi-vendor e-commerce product. This repository is currently responsible for the customer-facing storefront and buyer shopping flows.

## Current frontend objective

Deliver a responsive Figma-matched storefront with authentication, buyer profile/order history, product discovery, wishlist and cart integration.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- TanStack Query
- React Hook Form
- Zod

Use the versions and package manager already in the repository. Do not install or upgrade packages without checking existing dependencies and approval where the change is material.

## Sources of truth

- Figma: visual layout, design tokens, assets, component variants and interactions.
- Backend source/OpenAPI: routes, HTTP methods, request and response contracts, authorization, validation and business rules.
- Approved product requirements: user-facing behavior and scope.
- `docs/`: frontend engineering conventions.

If these sources disagree, document the conflict and ask for a decision.

## Explicit exclusions

No buyer dashboard, seller dashboard, admin dashboard, dashboard analytics or dashboard management modules in this phase. These will be developed later in a separate React project.

Do not confuse buyer-facing pages such as profile, order history, wishlist and cart with a dashboard. Implement only the specifically requested pages and flows.
