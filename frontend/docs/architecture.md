# Architecture and Folder Structure

Adapt to the existing repository. Do not restructure a working app solely to match this proposal.

```text
src/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [productId]/page.tsx
│   │   └── categories/
│   │       └── [slug]/page.tsx
│   ├── (auth)/
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   ├── verify-account/page.tsx
│   │   └── change-password/page.tsx
│   ├── (buyer)/
│   │   ├── profile/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── cart/page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── shared/             # reusable cross-feature UI
│   ├── layout/             # storefront header/footer/layout
│   └── providers/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   ├── buyer/
│   ├── categories/
│   ├── products/
│   ├── reviews/
│   ├── wishlist/
│   └── cart/
├── lib/
│   ├── axios/
│   ├── query/
│   ├── utils/
│   └── constants/
└── types/
```

Route groups are examples, not mandatory. Confirm the intended URLs and current route structure before creating routes.

## Feature boundaries

Each feature owns its components, hooks, service calls, schemas and feature-specific types. Shared components belong in `components/shared`; shadcn primitives remain in `components/ui`.

## State ownership

- TanStack Query: remote API data and cache.
- React Hook Form: form state.
- Local React state: temporary UI state.
- Zustand: only if a genuine shared client-state need is confirmed. Do not add it by default.
- URL search params: shareable filters, pagination and sorting when supported.

Avoid duplicating server state in a separate global store.

## Rendering

Use Server Components by default. Use Client Components for event handlers, browser APIs, form state, query hooks or interactive UI. Keep client boundaries as low in the tree as practical.
