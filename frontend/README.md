# JustBuy Frontend Guidelines

This documentation defines the implementation scope and workflow for the current JustBuy customer-facing frontend.

## Current scope only

1. Authentication: create account, login, refresh token, change password, verify account, resend OTP, logout.
2. Buyer: get profile, update profile, order history.
3. Public shopping: categories, New Arrivals (4), Explore Products (8), all products, product details, reviews, related products.
4. Wishlist: retrieve and add/remove items only where supported by the backend.
5. Cart: add to cart; retrieve, update and remove items only if supported by the backend.

**Out of scope:** Buyer Dashboard, Seller Dashboard and Admin Dashboard. These will be developed later as a separate React project. Do not create dashboard routes, navigation or features now.

## Read first

1. `AGENTS.md`
2. `docs/project-overview.md`
3. `docs/architecture.md`
4. `docs/feature-scope.md`
5. `docs/api-contract-checklist.md`
6. `docs/ui-context.md`
7. `docs/figma-to-code-workflow.md`
8. `docs/api-integration.md`
9. `docs/forms-and-validation.md`
10. `docs/ai-workflow-rules.md`
11. `docs/testing-strategy.md`
12. `docs/progress-tracker.md`

## Rule

Figma is the visual source of truth. Backend routes, validation, services and API documentation are the source of truth for API behavior. Never invent missing details.
