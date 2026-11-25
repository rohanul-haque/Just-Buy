# Backend API Catalog (`/api/v1`)

Base prefix configured in `backend/src/app.ts` and `backend/src/routes/v1/index.ts`: **`/api/v1`**.
Health check endpoint at root: `GET /`.

---

## 1. Auth (`/api/v1/auth`)

Source: `backend/src/modules/v1/auth/auth.route.ts`

| Method | Endpoint                | Auth / Role            | Purpose                                | Used By                       |
| :----- | :---------------------- | :--------------------- | :------------------------------------- | :---------------------------- |
| `POST` | `/auth/register`        | Public (rate-limited)  | Register a new buyer account           | `frontend`                    |
| `POST` | `/auth/register/vendor` | Public (rate-limited)  | Register a new vendor account          | `vendor`                      |
| `POST` | `/auth/login`           | Public (rate-limited)  | Authenticate user and set auth cookies | `frontend`, `vendor`, `admin` |
| `GET`  | `/auth/me`              | `authenticate`         | Get current authenticated user         | `frontend`, `vendor`, `admin` |
| `POST` | `/auth/logout`          | `optionalAuthenticate` | Revoke session & clear cookies         | `frontend`, `vendor`, `admin` |
| `POST` | `/auth/refresh-token`   | Public (cookie/body)   | Rotate access & refresh tokens         | `frontend`                    |
| `POST` | `/auth/forgot-password` | Public                 | Request password reset email           | `frontend`                    |
| `POST` | `/auth/reset-password`  | Public                 | Reset password with token              | `frontend`                    |
| `POST` | `/auth/change-password` | `authenticate`         | Change password while logged in        | `frontend`                    |

---

## 2. Verification (`/api/v1/verification`)

Source: `backend/src/modules/v1/verification/verification.route.ts`

| Method | Endpoint                   | Auth / Role           | Purpose                               | Used By              |
| :----- | :------------------------- | :-------------------- | :------------------------------------ | :------------------- |
| `POST` | `/verification/verify-otp` | Public (rate-limited) | Verify account email with 5-digit OTP | `frontend`, `vendor` |
| `POST` | `/verification/resend-otp` | Public (rate-limited) | Resend 5-digit verification OTP       | `frontend`, `vendor` |

---

## 3. Admin Profile (`/api/v1/admins`)

Source: `backend/src/modules/v1/admin/admin.route.ts`

| Method  | Endpoint     | Auth / Role | Purpose                                          | Used By |
| :------ | :----------- | :---------- | :----------------------------------------------- | :------ |
| `GET`   | `/admins/me` | `ADMIN`     | Get admin profile                                | `admin` |
| `PATCH` | `/admins/me` | `ADMIN`     | Update admin profile & avatar (`profile` upload) | `admin` |

---

## 4. Buyers (`/api/v1/buyers` & `/api/v1/admin/buyers`)

Source: `backend/src/modules/v1/buyer/buyer.route.ts`

| Method   | Endpoint                  | Auth / Role       | Purpose                                                           | Used By    |
| :------- | :------------------------ | :---------------- | :---------------------------------------------------------------- | :--------- |
| `GET`    | `/buyers/me`              | `BUYER`           | Get own buyer profile                                             | `frontend` |
| `PATCH`  | `/buyers/me`              | `BUYER`           | Update own buyer profile & avatar (`profile` upload)              | `frontend` |
| `DELETE` | `/buyers/me`              | `BUYER`           | Delete own buyer account                                          | **Unused** |
| `GET`    | `/buyers`                 | `ADMIN`, `VENDOR` | List buyers (paginated/filtered)                                  | `admin`    |
| `GET`    | `/buyers/statistics`      | `ADMIN`           | Get buyer statistics (also mounted at `/admin/buyers/statistics`) | `admin`    |
| `GET`    | `/buyers/:buyerId`        | `ADMIN`, `VENDOR` | Get buyer details by ID                                           | `admin`    |
| `PATCH`  | `/buyers/:buyerId/status` | `ADMIN`           | Update buyer status                                               | `admin`    |
| `DELETE` | `/buyers/:buyerId`        | `ADMIN`           | Delete a buyer account                                            | `admin`    |

---

## 5. Vendors (`/api/v1/vendors` & `/api/v1/admin/vendors`)

Source: `backend/src/modules/v1/vendor/vendor.route.ts`

| Method   | Endpoint                          | Auth / Role         | Purpose                                                 | Used By                                            |
| :------- | :-------------------------------- | :------------------ | :------------------------------------------------------ | :------------------------------------------------- |
| `GET`    | `/vendors/me`                     | `VENDOR`            | Get own vendor profile                                  | `vendor`                                           |
| `PATCH`  | `/vendors/me`                     | `VENDOR`            | Update own vendor profile & shop images                 | `vendor`                                           |
| `GET`    | `/vendors/dashboard/overview`     | `VENDOR` (Approved) | Alias for vendor dashboard overview                     | **Unused** (uses `/dashboard/vendor/overview`)     |
| `GET`    | `/vendors/dashboard/recent-sales` | `VENDOR` (Approved) | Alias for vendor recent sales                           | **Unused** (uses `/dashboard/vendor/recent-sales`) |
| `GET`    | `/vendors`                        | `ADMIN`             | List vendors (paginated/filtered)                       | `admin`                                            |
| `GET`    | `/vendors/statistics`             | `ADMIN`             | Vendor statistics (also at `/admin/vendors/statistics`) | `admin`                                            |
| `GET`    | `/vendors/:vendorId`              | `ADMIN`             | Get vendor details by ID                                | `admin`                                            |
| `PATCH`  | `/vendors/:vendorId/status`       | `ADMIN`             | Approve/reject/update vendor status                     | `admin`                                            |
| `DELETE` | `/vendors/:vendorId`              | `ADMIN`             | Delete vendor request/account                           | `admin`                                            |

---

## 6. Categories (`/api/v1/categories` & `/api/v1/admin/categories`)

Source: `backend/src/modules/v1/category/category.route.ts`

| Method   | Endpoint                         | Auth / Role | Purpose                                                      | Used By                       |
| :------- | :------------------------------- | :---------- | :----------------------------------------------------------- | :---------------------------- |
| `POST`   | `/categories`                    | `ADMIN`     | Create category with optional `image` upload                 | `admin`                       |
| `GET`    | `/categories`                    | Public      | List categories (`search`, `isActive`)                       | `frontend`, `vendor`, `admin` |
| `GET`    | `/categories/statistics`         | `ADMIN`     | Category statistics (also at `/admin/categories/statistics`) | `admin`                       |
| `GET`    | `/categories/:categoryId`        | Public      | Get single category by ID                                    | `frontend`, `vendor`, `admin` |
| `PATCH`  | `/categories/:categoryId`        | `ADMIN`     | Update category & optional `image`                           | `admin`                       |
| `PATCH`  | `/categories/:categoryId/status` | `ADMIN`     | Toggle category active status                                | `admin`                       |
| `DELETE` | `/categories/:categoryId`        | `ADMIN`     | Delete category                                              | `admin`                       |

---

## 7. Products (`/api/v1/products`)

Source: `backend/src/modules/v1/product/product.route.ts`

| Method   | Endpoint                           | Auth / Role         | Purpose                                                                                            | Used By                               |
| :------- | :--------------------------------- | :------------------ | :------------------------------------------------------------------------------------------------- | :------------------------------------ |
| `POST`   | `/products`                        | `VENDOR` (Approved) | Create product (`featureImage` + `images`)                                                         | `vendor`                              |
| `GET`    | `/products/my-products`            | `VENDOR` (Approved) | List vendor's own products (paginated)                                                             | `vendor`                              |
| `GET`    | `/products/my-products/statistics` | `VENDOR` (Approved) | Vendor product counts/stats                                                                        | `vendor`                              |
| `PATCH`  | `/products/my-products/:productId` | `VENDOR` (Approved) | Update vendor's product & images                                                                   | `vendor`                              |
| `DELETE` | `/products/my-products/:productId` | `VENDOR` (Approved) | Delete vendor's product                                                                            | `vendor`                              |
| `GET`    | `/products`                        | Public              | Public catalog (`page`, `limit`, `skip`, `search`, `category`, `minPrice`, `maxPrice`, `isActive`) | `frontend`, `admin` (`limit=1` count) |
| `GET`    | `/products/new-arrivals`           | Public              | Latest active products (`limit`)                                                                   | `frontend`                            |
| `GET`    | `/products/:productId`             | Public              | Public product detail                                                                              | `frontend`, `vendor`                  |
| `GET`    | `/products/:productId/related`     | Public              | Related products in same category                                                                  | `frontend`                            |
| `GET`    | `/products/:productId/reviews`     | Public              | Product reviews list                                                                               | `frontend`                            |

---

## 8. Wishlist (`/api/v1/wishlist`)

Source: `backend/src/modules/v1/wishlist/wishlist.route.ts`

| Method   | Endpoint                     | Auth / Role | Purpose                      | Used By    |
| :------- | :--------------------------- | :---------- | :--------------------------- | :--------- |
| `POST`   | `/wishlist/items`            | `BUYER`     | Add product to wishlist      | `frontend` |
| `GET`    | `/wishlist`                  | `BUYER`     | Get buyer's wishlist         | `frontend` |
| `DELETE` | `/wishlist/items/:productId` | `BUYER`     | Remove product from wishlist | `frontend` |

---

## 9. Cart (`/api/v1/cart`)

Source: `backend/src/modules/v1/cart/cart.route.ts`

| Method   | Endpoint              | Auth / Role | Purpose                     | Used By    |
| :------- | :-------------------- | :---------- | :-------------------------- | :--------- |
| `POST`   | `/cart/items`         | `BUYER`     | Add product/variant to cart | `frontend` |
| `GET`    | `/cart`               | `BUYER`     | Get buyer's cart            | `frontend` |
| `PATCH`  | `/cart/items/:itemId` | `BUYER`     | Update cart item quantity   | `frontend` |
| `DELETE` | `/cart/items/:itemId` | `BUYER`     | Remove item from cart       | `frontend` |

---

## 10. Orders (`/api/v1/orders`)

Source: `backend/src/modules/v1/order/order.route.ts`

| Method  | Endpoint                               | Auth / Role                | Purpose                              | Used By                       |
| :------ | :------------------------------------- | :------------------------- | :----------------------------------- | :---------------------------- |
| `POST`  | `/orders`                              | `BUYER`                    | Place order (COD or Stripe Online)   | `frontend`                    |
| `GET`   | `/orders`                              | `ADMIN`                    | List all orders (paginated/filtered) | `admin`                       |
| `GET`   | `/orders/my-orders`                    | `BUYER`                    | List buyer's own orders              | `frontend`                    |
| `GET`   | `/orders/vendor/orders`                | `VENDOR` (Approved)        | List vendor's orders                 | `vendor`                      |
| `GET`   | `/orders/vendor/statistics`            | `VENDOR` (Approved)        | Vendor order statistics              | `vendor`                      |
| `GET`   | `/orders/:orderId`                     | `BUYER`, `VENDOR`, `ADMIN` | Get single order details             | `frontend`, `vendor`, `admin` |
| `PATCH` | `/orders/:orderId/cancel`              | `BUYER`                    | Cancel eligible order                | `frontend`                    |
| `PATCH` | `/orders/:orderId/status`              | `VENDOR`                   | Update order fulfillment status      | `vendor`                      |
| `PATCH` | `/orders/:orderId/confirm-cod-payment` | `VENDOR`, `ADMIN`          | Confirm COD payment received         | `vendor`                      |
| `PATCH` | `/orders/:orderId/payment/confirm-cod` | `VENDOR`, `ADMIN`          | Alias for COD payment confirmation   | **Unused**                    |
| `PATCH` | `/orders/:orderId/payment/status`      | `VENDOR`, `ADMIN`          | Update order payment status          | `vendor`                      |

---

## 11. Payments (`/api/v1/payments`)

Source: `backend/src/modules/v1/payment/payment.route.ts`

| Method  | Endpoint                               | Auth / Role      | Purpose                                        | Used By    |
| :------ | :------------------------------------- | :--------------- | :--------------------------------------------- | :--------- |
| `POST`  | `/payments/stripe/webhook`             | Stripe Signature | Handle Stripe webhook events (`raw` body)      | Stripe     |
| `GET`   | `/payments/verify-session/:sessionId`  | `BUYER`          | Verify Stripe session via path param           | **Unused** |
| `GET`   | `/payments/verify-session`             | `BUYER`          | Verify Stripe session via `?session_id=` query | `frontend` |
| `GET`   | `/payments/order/:orderId`             | `BUYER`          | Lookup payment record by order ID              | **Unused** |
| `PATCH` | `/payments/order/:orderId/confirm-cod` | `VENDOR`         | Confirm COD payment via payments module        | **Unused** |

---

## 12. Reviews (`/api/v1/reviews`)

Source: `backend/src/modules/v1/review/review.route.ts`

| Method | Endpoint                               | Auth / Role | Purpose                               | Used By                                          |
| :----- | :------------------------------------- | :---------- | :------------------------------------ | :----------------------------------------------- |
| `POST` | `/reviews`                             | `BUYER`     | Create review for a delivered product | `frontend`                                       |
| `GET`  | `/reviews/products/:productId/reviews` | Public      | Get reviews for a product             | **Unused** (uses `/products/:productId/reviews`) |
| `GET`  | `/reviews/:productId`                  | Public      | Get reviews for a product             | **Unused** (uses `/products/:productId/reviews`) |

---

## 13. Earnings (`/api/v1/earnings` & `/api/v1/admin/earnings`)

Source: `backend/src/modules/v1/earnings/earnings.route.ts`

| Method | Endpoint                    | Auth / Role         | Purpose                                    | Used By  |
| :----- | :-------------------------- | :------------------ | :----------------------------------------- | :------- |
| `GET`  | `/earnings/vendor/summary`  | `VENDOR` (Approved) | Vendor earnings summary                    | `vendor` |
| `GET`  | `/earnings/vendor`          | `VENDOR` (Approved) | Vendor earnings transactions (paginated)   | `vendor` |
| `GET`  | `/earnings/vendor/:orderId` | `VENDOR` (Approved) | Vendor earning details for an order        | `vendor` |
| `GET`  | `/earnings/summary`         | `ADMIN`             | Platform earnings summary                  | `admin`  |
| `GET`  | `/earnings`                 | `ADMIN`             | Platform earnings transactions (paginated) | `admin`  |
| `GET`  | `/earnings/:orderId`        | `ADMIN`             | Platform earning details for an order      | `admin`  |

---

## 14. Dashboard (`/api/v1/dashboard`, `/vendor/dashboard`, `/admin/dashboard`, etc.)

Source: `backend/src/modules/v1/dashboard/dashboard.route.ts`

| Method | Endpoint                         | Auth / Role         | Purpose                                                                   | Used By  |
| :----- | :------------------------------- | :------------------ | :------------------------------------------------------------------------ | :------- |
| `GET`  | `/dashboard/vendor/overview`     | `VENDOR` (Approved) | Vendor dashboard overview metrics                                         | `vendor` |
| `GET`  | `/dashboard/vendor/recent-sales` | `VENDOR` (Approved) | Vendor recent product sales                                               | `vendor` |
| `GET`  | `/dashboard/summary`             | `ADMIN`             | Admin dashboard summary (used at `/admin/dashboard/summary`)              | `admin`  |
| `GET`  | `/dashboard/monthly-earnings`    | `ADMIN`             | Monthly earnings chart data (used at `/admin/dashboard/monthly-earnings`) | `admin`  |
| `GET`  | `/dashboard/order-distribution`  | `ADMIN`             | Order status distribution (used at `/admin/dashboard/order-distribution`) | `admin`  |
| `GET`  | `/dashboard/recent-users`        | `ADMIN`             | Recent users list (used at `/admin/dashboard/recent-users`)               | `admin`  |
| `GET`  | `/dashboard/users/:userId`       | `ADMIN`             | User details modal (used at `/admin/dashboard/users/:userId`)             | `admin`  |
