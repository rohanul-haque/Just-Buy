# 03. Comprehensive API Documentation

## 1. Authentication & Security Architecture

### 1.1 Token Lifecycle
- **Access Token:** Stateless JWT, signed with `JWT_ACCESS_SECRET`. Expiry: 1 hour.
  - Payload: `{ userId: string, role: "ADMIN" | "VENDOR" | "BUYER" }`
- **Refresh Token:** Stateless JWT, signed with `JWT_REFRESH_SECRET`. Expiry: 30 days.
  - Stored in Redis as `refreshToken:<userId>` with SHA256 hashing.
- **Client Transport:**
  - Buyer Frontend (`frontend/`): Stored in HTTP-only cookies (`accessToken`, `refreshToken`).
  - Admin/Vendor SPAs: Sent in JSON body, stored in `localStorage`, attached as `Authorization: Bearer <token>`.

### 1.2 Middlewares & Access Guards
- `authenticate`: Extracts JWT from `Authorization: Bearer <token>` or `req.cookies.accessToken`. Verifies signature, checks if account is blocked (`status !== "BLOCKED"`), verifies email verification (`isEmailVerified === true`), and binds `req.user`.
- `authorize(...roles)`: Enforces role-based authorization matching `req.user.role`.
- `requireApprovedVendor`: Verifies that `req.user.role === "VENDOR"` AND `Vendor.status === "APPROVED"`. Blocks non-approved vendors from creating products or reading sensitive dashboard metrics.
- `validateRequest(schema, "body" | "query" | "params")`: Validates input against Zod schemas.

---

## 2. API Endpoint Registry

All routes are mounted under the base path `/api/v1` via `backend/src/routes/v1/index.ts`.

### 2.1 Authentication & Password Recovery (`/api/v1/auth`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `registrationRateLimiter`, `validateRequest(registerSchema)` | `{ name, email, password, role?: "BUYER" \| "VENDOR" }` | `{ success: true, message: string, data: { user } }` | `authController.register` |
| `POST` | `/auth/register/vendor` | `registrationRateLimiter`, `validateRequest(registerVendorSchema)` | `{ name, email, password }` | `{ success: true, message: string, data: { user } }` | `authController.registerVendor` |
| `POST` | `/auth/login` | `loginRateLimiter`, `validateRequest(loginSchema)` | `{ email, password }` | `{ success: true, message: string, data: { user, accessToken, refreshToken, redirectUrl } }` | `authController.login` |
| `GET` | `/auth/me` | `authenticate` | None | `{ success: true, data: user }` | `authController.getMe` |
| `POST` | `/auth/logout` | `optionalAuthenticate` | None | `{ success: true, message: "Logged out" }` | `authController.logout` |
| `POST` | `/auth/refresh-token` | `validateRequest(refreshTokenSchema)` | `{ refreshToken?: string }` | `{ success: true, data: { accessToken, refreshToken } }` | `authController.refreshToken` |
| `POST` | `/auth/forgot-password`| `validateRequest(forgotPasswordSchema)` | `{ email }` | `{ success: true, message: string }` | `authController.forgotPassword` |
| `POST` | `/auth/reset-password` | `validateRequest(resetPasswordSchema)` | `{ email, token, newPassword }` | `{ success: true, message: string }` | `authController.resetPassword` |

---

### 2.2 Email OTP Verification (`/api/v1/verification`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/verification/verify-otp` | `verificationVerifyRateLimiter`, `validateRequest(verifyOtpSchema)` | `{ email, otp: "12345" }` | `{ success: true, message: "Email verified successfully" }` | `verificationController.verifyOtp` |
| `POST` | `/verification/resend-otp` | `verificationSendRateLimiter`, `validateRequest(resendOtpSchema)` | `{ email }` | `{ success: true, message: "OTP resent" }` | `verificationController.resendOtp` |

---

### 2.3 Vendor Management & Onboarding (`/api/v1/vendors`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vendors/me` | `authenticate`, `authorize("VENDOR")` | None | `{ success: true, data: IVendor }` | `vendorController.getOwnProfile` |
| `PATCH`| `/vendors/me` | `authenticate`, `authorize("VENDOR")`, `uploadVendorImages`, `validateRequest(updateVendorProfileSchema)` | `multipart/form-data`: `{ name?, email?, location?, licenceNumber?, profile?, nidFrontImage?, nidBackImage? }` | `{ success: true, data: IVendor }` | `vendorController.updateOwnProfile` |
| `GET` | `/vendors` | `authenticate`, `authorize("ADMIN")`, `validateRequest(vendorQuerySchema)` | Query: `{ page, limit, status, search, sortBy, sortOrder }` | `{ success: true, data: IVendor[], pagination }` | `vendorController.getAllVendors` |
| `GET` | `/vendors/statistics`| `authenticate`, `authorize("ADMIN")` | None | `{ success: true, data: IVendorStatistics }` | `vendorController.getVendorStatistics` |
| `GET` | `/vendors/:vendorId` | `authenticate`, `authorize("ADMIN")` | Params: `vendorId` | `{ success: true, data: IVendor }` | `vendorController.getVendorById` |
| `PATCH`| `/vendors/:vendorId/status`| `authenticate`, `authorize("ADMIN")`, `validateRequest(updateVendorStatusSchema)` | `{ status: "APPROVED" \| "REJECTED" \| "SUSPENDED" }` | `{ success: true, data: IVendor }` | `vendorController.updateVendorStatus` |
| `DELETE`| `/vendors/:vendorId`| `authenticate`, `authorize("ADMIN")` | Params: `vendorId` | `{ success: true, message: string }` | `vendorController.deleteVendorRequest` |

---

### 2.4 Categories Taxonomy (`/api/v1/categories`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Public / None | Query: `{ isActive, page, limit }` | `{ success: true, data: ICategory[] }` | `categoryController.getAllCategories` |
| `GET` | `/categories/:categoryId`| Public / None | Params: `categoryId` | `{ success: true, data: ICategory }` | `categoryController.getCategoryById` |
| `POST` | `/categories` | `authenticate`, `authorize("ADMIN")`, `uploadCategoryIcon`, `validateRequest(createCategorySchema)` | `multipart/form-data`: `{ name, image? }` | `{ success: true, data: ICategory }` | `categoryController.createCategory` |
| `PATCH`| `/categories/:categoryId`| `authenticate`, `authorize("ADMIN")`, `uploadCategoryIcon`, `validateRequest(updateCategorySchema)` | `multipart/form-data`: `{ name?, image?, isActive? }` | `{ success: true, data: ICategory }` | `categoryController.updateCategory` |
| `DELETE`| `/categories/:categoryId`| `authenticate`, `authorize("ADMIN")` | Params: `categoryId` | `{ success: true, message: string }` | `categoryController.deleteCategory` |

---

### 2.5 Products Catalog (`/api/v1/products`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public / None | Query: `{ search, category, minPrice, maxPrice, brand, size, sort, page, limit }` | `{ success: true, data: IProduct[], pagination }` | `productController.getAllProducts` |
| `GET` | `/products/featured`| Public / None | Query: `{ limit }` | `{ success: true, data: IProduct[] }` | `productController.getFeaturedProducts` |
| `GET` | `/products/:productId`| Public / None | Params: `productId` | `{ success: true, data: IProduct }` | `productController.getProductById` |
| `GET` | `/products/vendor/products`| `authenticate`, `authorize("VENDOR")` | Query: `{ search, category, status, page, limit }` | `{ success: true, data: IProduct[], pagination }` | `productController.getVendorProducts` |
| `POST` | `/products` | `authenticate`, `authorize("VENDOR")`, `requireApprovedVendor`, `uploadProductImages`, `validateRequest(createProductSchema)` | `multipart/form-data`: `{ name, description, brand, price, stock, category, sizes, featureImage, images }` | `{ success: true, data: IProduct }` | `productController.createProduct` |
| `PATCH`| `/products/:productId`| `authenticate`, `authorize("VENDOR")`, `requireApprovedVendor`, `uploadProductImages`, `validateRequest(updateProductSchema)` | `multipart/form-data`: `{ name?, description?, brand?, price?, stock?, category?, sizes?, featureImage?, images? }` | `{ success: true, data: IProduct }` | `productController.updateProduct` |
| `DELETE`| `/products/:productId`| `authenticate`, `authorize("VENDOR")`, `requireApprovedVendor` | Params: `productId` | `{ success: true, message: string }` | `productController.deleteProduct` |

---

### 2.6 Cart & Wishlist Operations (`/api/v1/cart`, `/api/v1/wishlist`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/cart` | `authenticate`, `authorize("BUYER")` | None | `{ success: true, data: ICart }` | `cartController.getCart` |
| `POST` | `/cart/items` | `authenticate`, `authorize("BUYER")`, `validateRequest(addCartItemSchema)` | `{ product: string, quantity: number, size?: string }` | `{ success: true, data: ICart }` | `cartController.addItemToCart` |
| `PATCH`| `/cart/items/:itemId`| `authenticate`, `authorize("BUYER")`, `validateRequest(updateCartItemSchema)` | `{ quantity: number }` | `{ success: true, data: ICart }` | `cartController.updateCartItemQuantity` |
| `DELETE`| `/cart/items/:itemId`| `authenticate`, `authorize("BUYER")` | Params: `itemId` | `{ success: true, data: ICart }` | `cartController.removeCartItem` |
| `DELETE`| `/cart` | `authenticate`, `authorize("BUYER")` | None | `{ success: true, message: string }` | `cartController.clearCart` |
| `GET` | `/wishlist` | `authenticate`, `authorize("BUYER")` | None | `{ success: true, data: IWishlist }` | `wishlistController.getWishlist` |
| `POST` | `/wishlist/:productId`| `authenticate`, `authorize("BUYER")` | Params: `productId` | `{ success: true, data: IWishlist }` | `wishlistController.addToWishlist` |
| `DELETE`| `/wishlist/:productId`| `authenticate`, `authorize("BUYER")` | Params: `productId` | `{ success: true, data: IWishlist }` | `wishlistController.removeFromWishlist` |

---

### 2.7 Order Processing & Life-cycle (`/api/v1/orders`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/orders` | `authenticate`, `authorize("BUYER")`, `validateRequest(createOrderSchema)` | `{ shippingAddress: IShippingAddress, orderType: "CASH_ON_DELIVERY" \| "ONLINE" }` | `{ success: true, data: IOrder }` | `orderController.createOrder` |
| `GET` | `/orders/my-orders` | `authenticate`, `authorize("BUYER")` | Query: `{ page, limit, status }` | `{ success: true, data: IOrder[], pagination }` | `orderController.getMyOrders` |
| `GET` | `/orders/vendor/orders`| `authenticate`, `authorize("VENDOR")` | Query: `{ page, limit, status }` | `{ success: true, data: IOrder[], pagination }` | `orderController.getVendorOrders` |
| `GET` | `/orders/:orderId` | `authenticate` | Params: `orderId` | `{ success: true, data: IOrder }` | `orderController.getOrderById` |
| `PATCH`| `/orders/:orderId/status`| `authenticate`, `authorize("ADMIN", "VENDOR")`, `validateRequest(updateOrderStatusSchema)` | `{ status: "CONFIRMED" \| "PROCESSING" \| "SHIPPED" \| "DELIVERED" \| "CANCELLED" }` | `{ success: true, data: IOrder }` | `orderController.updateOrderStatus` |

---

### 2.8 Stripe Payments & Webhook Listener (`/api/v1/payments`)

| Method | Endpoint | Guards / Middleware | Request Payload | Response Structure | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/payments/create-checkout-session` | `authenticate`, `authorize("BUYER")`, `validateRequest(createCheckoutSessionSchema)` | `{ orderId: string }` | `{ success: true, data: { sessionUrl: string, sessionId: string } }` | `paymentController.createCheckoutSession` |
| `POST` | `/payments/webhook` | Raw Body buffer parsing (`express.raw()`) | Stripe Webhook Event Payload + `stripe-signature` Header | `{ received: true }` | `paymentController.handleStripeWebhook` |
| `GET` | `/payments/verify/:orderId` | `authenticate`, `authorize("BUYER")` | Params: `orderId` | `{ success: true, data: IPayment }` | `paymentController.verifyPaymentStatus` |

---

### 2.9 Analytics & Dashboards (`/api/v1/dashboard`, `/api/v1/earnings`)

| Method | Endpoint | Guards / Middleware | Scope & Response Details | Controller Handler |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/summary` | `authenticate`, `authorize("ADMIN")` | Total platform revenue, sales count, total users, active vendors | `dashboardController.getSummary` |
| `GET` | `/dashboard/monthly-earnings`| `authenticate`, `authorize("ADMIN")` | 12-month rolling platform sales & commission figures | `dashboardController.getMonthlyEarnings` |
| `GET` | `/dashboard/order-distribution`| `authenticate`, `authorize("ADMIN")` | Breakdown of orders by fulfillment status (`DELIVERED`, `SHIPPED`, etc.) | `dashboardController.getOrderDistribution` |
| `GET` | `/dashboard/recent-users` | `authenticate`, `authorize("ADMIN")` | List of latest registered buyers and vendors with pagination | `dashboardController.getRecentUsers` |
| `GET` | `/earnings/vendor/summary` | `authenticate`, `authorize("VENDOR")` | Vendor total earnings, pending payouts, commission deductions | `earningsController.getVendorEarningsSummary` |
| `GET` | `/earnings/vendor/monthly` | `authenticate`, `authorize("VENDOR")` | Monthly revenue breakdown for the authenticated vendor | `earningsController.getVendorMonthlyEarnings` |
