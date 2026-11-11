# API Integration

## Before writing a service

Verify the exact backend route, method, controller/service behavior, validation schema, middleware, response envelope and error format. Update `api-contract-checklist.md`.

## Axios client

Use a centralized Axios instance and environment-based base URL. Confirm actual backend prefix and CORS configuration. For cookie-based auth, configure `withCredentials` only as required by the backend.

Example environment variable (replace with the actual URL):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Do not put private secrets in `NEXT_PUBLIC_` variables.

## Cookie-based authentication

The backend has previously been described as using access/refresh cookies. Re-check current backend code before implementation.

- httpOnly cookies cannot and should not be read by client JavaScript.
- Confirm cookie domain, path, Secure and SameSite settings.
- Confirm frontend origin and credentialed CORS configuration.
- Confirm refresh endpoint, request behavior, response behavior and retry policy.
- Prevent concurrent refresh races and redirect loops if the backend contract requires refresh handling.
- Logout must call the actual backend operation and update client cache/session state after success.
- Do not invent token storage or refresh behavior.

## TanStack Query

- Use stable query keys that include relevant IDs, filters, pagination and sorting.
- Use query hooks for server state.
- Use mutations for writes.
- Invalidate or update relevant queries after successful mutations.
- Do not cache sensitive user-specific data across accounts without appropriate cache clearing.
- Clear or invalidate user-scoped query data after logout/account changes.
- Configure retries deliberately; avoid retrying validation and authorization failures.

## API errors

Normalize errors using the actual backend error shape. Preserve field validation errors for forms. Show user-safe messages and never expose stack traces or secrets.

## Product list behavior

New Arrivals should display four products and Explore Products eight products. Verify whether backend supports limit parameters. If not, fetch according to the real contract and limit the rendered section without claiming server-side limiting.

## Wishlist and cart

Use only confirmed backend operations. Do not invent cart quantity constraints, stock availability rules, totals, discount calculations or wishlist semantics.
