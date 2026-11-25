# API Usage Matrix (Used vs. Unused & Broken Calls)

## 1. Per-Application API Consumption

### A. Buyer Storefront (`frontend/`)
Services location: `frontend/src/features/*/services/*`

- **Auth & Verification**: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh-token`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/change-password`, `GET /auth/me`, `POST /verification/verify-otp`, `POST /verification/resend-otp`
- **Buyer Profile**: `GET /buyers/me`, `PATCH /buyers/me`
- **Catalog & Reviews**: `GET /categories`, `GET /categories/:categoryId`, `GET /products`, `GET /products/new-arrivals`, `GET /products/:productId`, `GET /products/:productId/related`, `GET /products/:productId/reviews`, `POST /reviews`
- **Wishlist & Cart**: `GET /wishlist`, `POST /wishlist/items`, `DELETE /wishlist/items/:productId`, `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`
- **Orders & Payments**: `POST /orders`, `GET /orders/my-orders`, `GET /orders/:orderId`, `PATCH /orders/:orderId/cancel`, `GET /payments/verify-session?session_id=...`

### B. Vendor Dashboard (`vendor/`)
Services location: `vendor/src/api/services/*`

- **Auth & Verification**: `POST /auth/register/vendor`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /verification/verify-otp`, `POST /verification/resend-otp`
- **Vendor Profile**: `GET /vendors/me`, `PATCH /vendors/me`
- **Broken Call**: `PATCH /users/me` in `vendor/src/api/services/user.service.ts` *(see Section 3 below)*
- **Dashboard & Earnings**: `GET /dashboard/vendor/overview`, `GET /dashboard/vendor/recent-sales`, `GET /earnings/vendor/summary`, `GET /earnings/vendor`, `GET /earnings/vendor/:orderId`
- **Categories & Products**: `GET /categories`, `GET /categories/:id`, `GET /products/my-products`, `GET /products/my-products/statistics`, `GET /products/:id`, `POST /products`, `PATCH /products/my-products/:id`, `DELETE /products/my-products/:id`
- **Orders**: `GET /orders/vendor/orders`, `GET /orders/vendor/statistics`, `GET /orders/:id`, `PATCH /orders/:orderId/status`, `PATCH /orders/:orderId/confirm-cod-payment`, `PATCH /orders/:orderId/payment/status`

### C. Admin Dashboard (`admin/`)
Services location: `admin/src/api/services/*`

- **Auth & Admin Profile**: `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `GET /admins/me`, `PATCH /admins/me`
- **Dashboard**: `GET /admin/dashboard/summary`, `GET /admin/dashboard/monthly-earnings`, `GET /admin/dashboard/order-distribution`, `GET /admin/dashboard/recent-users`, `GET /admin/dashboard/users/:userId`
- **Buyers & Vendors**: `GET /buyers`, `GET /admin/buyers/statistics`, `GET /buyers/:buyerId`, `PATCH /buyers/:buyerId/status`, `DELETE /buyers/:buyerId`, `GET /vendors`, `GET /admin/vendors/statistics`, `GET /vendors/:id`, `PATCH /vendors/:id/status`, `DELETE /vendors/:id`
- **Categories**: `GET /categories`, `GET /admin/categories/statistics`, `GET /categories/:id`, `POST /categories`, `PATCH /categories/:id`, `PATCH /categories/:id/status`, `DELETE /categories/:id`
- **Orders & Earnings**: `GET /orders`, `GET /orders/:id`, `GET /earnings/summary`, `GET /earnings`, `GET /earnings/:orderId`
- **Workaround Calls**: `admin/src/api/services/order.service.ts` calls `/orders?limit=100`, `/buyers?limit=1`, `/vendors?limit=1`, `/products?limit=1` to compute order page stats because a dedicated `/orders/statistics` endpoint does not exist.
- **Empty Service**: `admin/src/api/services/user.service.ts` is currently empty.

---

## 2. Completely Unused Backend Endpoints

| Endpoint | Module | Reason / Notes |
| :--- | :--- | :--- |
| `DELETE /api/v1/buyers/me` | `buyer` | Self-service account deletion is not wired in `frontend`. |
| `GET /api/v1/payments/order/:orderId` | `payment` | Order details already include payment fields; `frontend` does not call this separately. |
| `GET /api/v1/payments/verify-session/:sessionId` | `payment` | `frontend` uses `GET /payments/verify-session?session_id=...` instead. |
| `PATCH /api/v1/orders/:orderId/payment/confirm-cod` | `order` | Duplicate alias of `PATCH /orders/:orderId/confirm-cod-payment`. |
| `PATCH /api/v1/payments/order/:orderId/confirm-cod` | `payment` | Duplicate COD confirmation route in `payment.route.ts`. |
| `GET /api/v1/reviews/products/:productId/reviews` | `review` | `frontend` uses `GET /products/:productId/reviews`. |
| `GET /api/v1/reviews/:productId` | `review` | `frontend` uses `GET /products/:productId/reviews`. |
| `GET /api/v1/vendors/dashboard/overview` | `vendor` | Duplicate alias; `vendor` calls `/dashboard/vendor/overview`. |
| `GET /api/v1/vendors/dashboard/recent-sales` | `vendor` | Duplicate alias; `vendor` calls `/dashboard/vendor/recent-sales`. |

### Redundant Router Mounts in `backend/src/routes/v1/index.ts`
`backend/src/routes/v1/index.ts` mounts several routers multiple times:
- `dashboardRoutes` is mounted 5 times (`/dashboard`, `/vendor/dashboard`, `/vendors/dashboard`, `/admin/dashboard`, `/admins/dashboard`).
- `earningsRoutes` is mounted at `/earnings` and `/admin/earnings`.
- `buyerRoutes`, `vendorRoutes`, `categoryRoutes` are mounted both at `/<resource>` and `/admin/<resource>`.

---

## 3. Broken / Mismatched API Integrations

1. **`PATCH /users/me` in `vendor/src/api/services/user.service.ts`**
   - `vendor` calls `apiClient.patch("/users/me", data)`.
   - `backend/src/modules/v1/user/` has **no** `user.route.ts`, and `/users` is **not** mounted in `backend/src/routes/v1/index.ts`. Any call to `userService.updateProfile` in `vendor` will return `404 Not Found`.
2. **`POST /auth/forgot-password`, `reset-password`, `change-password` missing in `vendor` & `admin`**
   - Backend supports these for all users, and `frontend` implements them, but `vendor` and `admin` do not expose password reset/change flows in their services/UI.
