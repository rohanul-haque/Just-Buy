# API Gaps, Security Issues & Performance Improvements

## 1. Missing / Lacking Backend APIs

| Priority | Missing Capability | Impact | Recommended Endpoint |
| :--- | :--- | :--- | :--- |
| **High** | **Admin Order Statistics** | `admin/src/api/services/order.service.ts` currently fetches `GET /orders?limit=100` + 3 extra `limit=1` calls to estimate stats, which breaks if orders > 100. | `GET /api/v1/orders/statistics` (or `/admin/orders/statistics`) |
| **High** | **User Profile Update (`/users/me`)** | `vendor/src/api/services/user.service.ts` calls `PATCH /users/me`, which returns 404 because no `user.route.ts` exists. | `PATCH /api/v1/users/me` or route through `PATCH /vendors/me` |
| **High** | **Stripe Refund on Order Cancel** | `PATCH /orders/:orderId/cancel` cancels orders, but there is no refund endpoint/automation if an online Stripe order is cancelled after `PAID`. | `POST /api/v1/payments/order/:orderId/refund` |
| **Medium** | **Admin Product Management** | `admin/` has no product management page or admin-level product takedown/featuring APIs. | `GET /admin/products`, `PATCH /admin/products/:id/status`, `DELETE /admin/products/:id` |
| **Medium** | **Admin Order Status Override** | `PATCH /orders/:orderId/status` only allows `UserRole.VENDOR`, blocking admins from resolving stuck orders. | Allow `ADMIN` in `authorize(UserRole.VENDOR, UserRole.ADMIN)` |
| **Medium** | **Clear Entire Cart** | Buyer must delete cart items one by one via `DELETE /cart/items/:itemId`. | `DELETE /api/v1/cart` |
| **Low** | **Review Moderation & Replies** | Buyers can create reviews (`POST /reviews`), but cannot edit/delete them, and vendors/admins cannot reply or moderate. | `PATCH /reviews/:id`, `DELETE /reviews/:id`, `GET /admin/reviews` |
| **Low** | **Contact / Newsletter Endpoint** | Storefront footer/contact forms lack dedicated backend persistence if needed beyond static UI. | `POST /api/v1/contact`, `POST /api/v1/newsletter/subscribe` |

---

## 2. Backend Security, Validation & Architecture Improvements

1. **Global Rate Limiter Disabled (`backend/src/app.ts`)**
   - Line 48 has `// app.use(limiter);` commented out. Only auth and verification routes have rate limiters. Re-enable a global API rate limiter on `/api/v1` (excluding `/payments/stripe/webhook`) to protect public catalog and order endpoints from abuse.
2. **Duplicate Route Mounts (`backend/src/routes/v1/index.ts`)**
   - Consolidate redundant mounts (`/dashboard`, `/vendor/dashboard`, `/vendors/dashboard`, `/admin/dashboard`, `/admins/dashboard`, etc.) into single canonical paths so Swagger/OpenAPI docs, middleware, and logs stay clean.
3. **Duplicate COD & Review Routes**
   - Remove unused aliases (`/orders/:orderId/payment/confirm-cod`, `/payments/order/:orderId/confirm-cod`, `/reviews/products/:productId/reviews`, `/reviews/:productId`) after confirming no external clients depend on them.
4. **MongoDB Indexes for Server-Side Filters & Pagination**
   - Ensure compound indexes exist on `Product` for `{ isActive: 1, category: 1, price: 1, createdAt: -1 }` and text/index support on `name` / `brand` so `GET /products` stays fast as the catalog grows.
   - Ensure `Order` has indexes on `{ buyer: 1, createdAt: -1 }`, `{ "productItems.vendor": 1, createdAt: -1 }`, and `{ status: 1, paymentStatus: 1 }`.

---

## 3. Performance Improvements (Backend + Frontends)

### Backend (`backend/`)
- **Lean Queries (`.lean()`)**: Read-only list endpoints (`getPublicProducts`, `getAllCategories`, `getVendorOrders`, `getAllOrders`, `getEarningsTransactions`) currently return full Mongoose documents. Adding `.lean()` reduces memory overhead and JSON serialization time.
- **Projection on `.populate()`**: Keep `.select(...)` tight on populated `vendor`, `buyer`, and `category` fields to avoid leaking or transferring unnecessary nested objects.
- **Aggregation for Statistics**: Replace multi-query stats workarounds (`admin/order.service.ts`, `vendor/order.service.ts`, `vendor/product.service.ts`) with single MongoDB `$facet` / `$group` aggregations on the backend.

### Frontend (`frontend/`)
- **Server-Side Filtering & Pagination**: `All Products` (`/products`) now uses server-side `page`, `limit=12`, `search`, `category`, `minPrice`, and `maxPrice` — avoid re-introducing client-side filtering on paginated pages.
- **Image Optimization**: Replace raw `<img>` tags (e.g., in `UserDropdown` avatar) with `next/image` or configured Cloudinary domains in `next.config.ts` for automatic resizing and WebP/AVIF delivery.
- **Prefetching & Query Keys**: `useCategories()` is shared across `HeroSection`, `CategorySection`, and `ProductFilters` with a 5-minute `staleTime` — keep query keys consistent so TanStack Query deduplicates requests across components.

### Vendor & Admin (`vendor/`, `admin/`)
- **Remove Multi-Request Statistics Fallbacks**:
  - In `vendor/src/api/services/order.service.ts` and `vendor/src/api/services/product.service.ts`, clean up extra `?limit=1` parallel calls once backend statistics endpoints are verified.
  - In `admin/src/api/services/order.service.ts`, replace the 4-call workaround (`/orders?limit=100` + 3 `limit=1` calls) with a dedicated backend `/orders/statistics` endpoint.
- **Add TanStack Query to `vendor/` & `admin/`**: Both dashboards currently use manual `useState` + `useEffect` fetching. Migrating to TanStack Query (like `frontend/`) will add request deduplication, background caching, and cleaner loading/error states.
