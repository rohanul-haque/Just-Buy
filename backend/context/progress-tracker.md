# Jus Buy — Backend Progress Tracker

**Purpose:** Track the actual implementation progress of the Jus Buy backend.

**Rule:** Update this file whenever the current phase, active feature, implementation state, architecture decision, technical dependency, or development blocker changes.

**Source of Truth:** backend-feature-breakdown.md and architecture-context.md.

**Important:** This tracker must always represent the actual implementation state, never the planned or assumed implementation state.

## 1. Project Information

| Item            | Details                          |
| --------------- | -------------------------------- |
| Project Name    | Jus Buy                          |
| Project Type    | Multi-Vendor E-commerce Platform |
| Backend Runtime | Node.js                          |
| Framework       | Express.js                       |
| Language        | TypeScript                       |
| Database        | MongoDB                          |
| ODM             | Mongoose                         |
| Validation      | Zod                              |
| Authentication  | JWT Access Token + Refresh Token |
| File Storage    | Cloudinary                       |
| Payment Gateway | Stripe + COD                     |
| API Version     | /api/v1                          |
| Architecture    | Modular Architecture             |

### Tracker Metadata

| Item           | Value           |
| -------------- | --------------- |
| Last Updated   | 2026-11-07      |
| Current Phase  | Phase 21        |
| Active Feature | Review & Rating Management |
| Current Status | COMPLETED       |
| Overall Status | IN_PROGRESS     |

## 2. Current Development Status

### Current Phase

**Phase 21 — Review & Rating Management**

**Status:** COMPLETED

### Current Goal

- Review module implemented in strict alignment with `context/features/review.md`.
- Review model created with unique compound index on `{ product: 1, buyer: 1 }`.
- Buyer-only review creation (`POST /reviews`) validates delivered order purchase (`OrderStatus.DELIVERED`) and prevents duplicate reviews.
- Public product reviews retrieval (`GET /products/:productId/reviews`) verifies product existence, populates safe buyer info, and sorts newest first.
- Zero TypeScript errors (`npx tsc --noEmit`), successful production build (`npm run build`), and 100% pass on all 11 integration test scenarios.
- Awaiting user's next instruction.

### Overall Progress

| Metric             | Status |
| ------------------ | ------ |
| Total Phases       | 26     |
| Completed Phases   | 15     |
| In Progress Phases | 0      |
| Review Phases      | 0      |
| Testing Phases     | 0      |
| Pending Phases     | 11     |
| Blocked Phases     | 0      |
| Deferred Phases    | 0      |

**Overall Status:** IN_PROGRESS

### Progress Calculation Rules

- Update metrics whenever a phase status changes.
- Count each phase only once.
- A phase under REVIEW or TESTING is not completed.
- A phase marked BLOCKED must have a documented blocker.
- A phase marked DEFERRED must have an approved reason.
- Never mark a phase COMPLETED until its implementation and required verification are finished.

## 3. Development Status Definitions

Use these status values consistently throughout this tracker.

| Status      | Meaning                                                     |
| ----------- | ----------------------------------------------------------- |
| NOT_STARTED | Implementation has not started.                             |
| IN_PROGRESS | Currently implementing.                                     |
| REVIEW      | Implementation completed, awaiting code review or approval. |
| TESTING     | Running tests and fixing issues.                            |
| BLOCKED     | Cannot proceed because of a technical or business blocker.  |
| COMPLETED   | Implementation and required tests successfully completed.   |
| DEFERRED    | Intentionally postponed with an approved reason.            |

### Status Transition Rules

Recommended development lifecycle:

`NOT_STARTED → IN_PROGRESS → REVIEW → TESTING → COMPLETED`

Additional transitions:

- IN_PROGRESS → BLOCKED
- REVIEW → IN_PROGRESS
- TESTING → IN_PROGRESS
- BLOCKED → IN_PROGRESS
- NOT_STARTED → DEFERRED
- DEFERRED → IN_PROGRESS

A task may skip REVIEW when formal review is not required.

Do not force unnecessary status transitions.

## 4. Phase-wise Development Tracker

### Phase 01 — Project Setup & Shared Infrastructure

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Initialize Node.js + Express.js project.
- [ ] Configure TypeScript.
- [ ] Configure development and production scripts.
- [ ] Configure MongoDB connection with Mongoose.
- [ ] Establish modular folder architecture.
- [ ] Configure environment variables.
- [ ] Configure centralized error handling.
- [ ] Configure centralized API response utility.
- [ ] Configure Winston logger.
- [ ] Configure Zod validation middleware.
- [ ] Configure Helmet and CORS.
- [ ] Configure rate limiting.
- [ ] Configure Cloudinary.
- [ ] Configure Stripe.
- [ ] Configure email service.
- [ ] Configure shared image schema.
- [ ] Configure shared pagination utility.
- [ ] Configure shared currency calculation utility.
- [ ] Configure transaction infrastructure where appropriate.
- [ ] Configure environment validation.
- [ ] Configure graceful server shutdown.
- [ ] Verify server startup and database connection.

**Completion Criteria**

- Project runs successfully.
- Database connects successfully.
- Shared infrastructure is reusable.
- TypeScript compiles without errors.
- Environment validation works correctly.
- Centralized error handling works correctly.
- Server startup and shutdown are verified.
- Required shared utilities are tested.

### Phase 02 — User Model

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create User interface.
- [x] Create User validation schema.
- [x] Create User Mongoose model.
- [x] Define BUYER, VENDOR and ADMIN roles.
- [x] Define ACTIVE and BLOCKED account statuses.
- [x] Configure unique lowercase email.
- [x] Configure password hashing strategy.
- [x] Set emailVerified default to false.
- [x] Set account status default to ACTIVE.
- [x] Prevent password from appearing in normal queries.
- [x] Ensure public registration cannot create ADMIN accounts.
- [x] Configure appropriate database indexes.
- [x] Test User model and database constraints.

**Completion Criteria**

- User schema follows approved architecture.
- Password hashing works correctly.
- Sensitive fields are protected.
- Email uniqueness is enforced at database level.
- Public registration cannot create ADMIN accounts.
- Model validation and database tests pass.

### Phase 03 — Authentication: Registration & Login

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Authentication module.
- [x] Implement registration validation.
- [x] Implement common registration API.
- [x] Allow only BUYER and VENDOR registration.
- [x] Check duplicate email.
- [x] Hash password.
- [x] Create User account.
- [x] Generate email verification OTP.
- [x] Save OTP securely through Verification module.
- [x] Send verification email.
- [x] Implement common login API.
- [x] Verify email and password.
- [x] Check email verification status.
- [x] Check account status.
- [x] Generate access and refresh tokens after successful validation.
- [x] Return role-based redirect path.
- [x] Prevent unauthorized role assignment.
- [x] Test registration and login flows.

**Completion Criteria**

- Buyer and Vendor registration work correctly.
- Admin cannot be created through public registration.
- Duplicate accounts are prevented.
- Passwords are securely hashed.
- Unverified users cannot log in.
- Blocked users cannot log in.
- Tokens are generated only after successful validation.
- Registration and login tests pass.

### Phase 04 — Email OTP Verification

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Verification interface.
- [x] Create Verification validation schema.
- [x] Create Verification model.
- [x] Define EMAIL_VERIFICATION and PASSWORD_RESET purposes.
- [x] Implement OTP generator.
- [x] Implement OTP hashing.
- [x] Configure OTP expiration.
- [x] Configure TTL index.
- [x] Configure compound index.
- [x] Implement verify-email API.
- [x] Implement resend-OTP API.
- [x] Implement failed-attempt tracking.
- [x] Implement OTP expiration validation.
- [x] Invalidate previous active OTP during resend.
- [x] Prevent OTP reuse after successful verification.
- [x] Implement resend rate limiting.
- [x] Update User emailVerified after successful verification.
- [x] Test valid, invalid, expired and reused OTP scenarios.

**Completion Criteria**

- OTP is securely generated and stored.
- Plaintext OTP is never stored.
- OTP expiration is enforced.
- Previous active OTP is invalidated during resend.
- OTP cannot be reused.
- Failed attempts and resend limits work.
- Email verification updates the User correctly.

### Phase 05 — Forgot Password & Reset Password

**Status:** COMPLETED

**Implementation Checklist**

- [x] Implement forgot-password API.
- [x] Generate password reset OTP or secure reset token.
- [x] Store verification information securely.
- [x] Send reset email.
- [x] Avoid revealing whether an account exists.
- [x] Configure expiration and rate limiting.
- [x] Implement reset-password API.
- [x] Validate OTP/reset token.
- [x] Hash new password.
- [x] Invalidate used reset token.
- [x] Revoke relevant old sessions when required.
- [x] Test password recovery flow.

**Completion Criteria**

- Password recovery does not reveal account existence.
- Reset tokens are securely stored.
- Expired and reused tokens are rejected.
- New passwords are securely hashed.
- Relevant old sessions are revoked according to the approved strategy.

### Phase 06 — Access Token & Refresh Token

**Status:** COMPLETED

**Implementation Checklist**

- [x] Implement JWT access token utility.
- [x] Implement refresh token utility.
- [x] Configure token payload.
- [x] Configure access token lifetime through environment variables.
- [x] Configure refresh token lifetime through environment variables.
- [x] Configure secure cookie strategy.
- [x] Decide whether server-side RefreshToken storage is required.
- [x] If required, implement RefreshToken model.
- [x] Store only hashed refresh tokens.
- [x] Implement refresh-token API.
- [x] Implement token expiration validation.
- [x] Implement revoked-token validation.
- [x] Implement token rotation if selected.
- [x] Implement logout and token revocation.
- [x] Configure CSRF protection strategy.
- [x] Test refresh and logout flows.

**Completion Criteria**

- Access and refresh tokens work correctly.
- Token expiration is enforced.
- Refresh token security follows the approved strategy.
- Revoked tokens cannot be reused.
- Cookie and CSRF protection are verified.
- Logout invalidates the appropriate session.

### Phase 07 — Authentication & Authorization Middleware

**Status:** IN_PROGRESS

**Implementation Checklist**

- [x] Implement authenticate.
- [x] Verify access token.
- [x] Fetch current User from database.
- [x] Validate account status.
- [x] Validate email verification.
- [x] Attach typed user information to request.
- [x] Implement authorize.
- [x] Implement requireApprovedVendor.
- [ ] Implement ownership validation strategy.
- [ ] Protect all role-specific routes.
- [x] Verify blocked users cannot access protected APIs.
- [x] Verify unverified users cannot access protected APIs.
- [x] Verify unapproved vendors cannot perform selling operations.
- [x] Test authorization and ownership scenarios.

**Completion Criteria**

- Authentication middleware validates tokens correctly.
- Role-based authorization works.
- Blocked accounts are rejected.
- Unverified accounts are rejected.
- Vendor approval restrictions are enforced.
- Ownership checks prevent unauthorized access.

### Phase 08 — Buyer Profile Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Buyer interface (`src/modules/v1/buyer/buyer.interface.ts`).
- [x] Create Buyer model with Cloudinary profile schema (`src/modules/v1/buyer/buyer.model.ts`).
- [x] Define Gender enum and constants (`src/modules/v1/buyer/buyer.constant.ts`).
- [x] Create Buyer Zod validation schemas (`src/modules/v1/buyer/buyer.validation.ts`).
- [x] Implement Multer memoryStorage configuration (`src/utils/multer/`).
- [x] Implement Cloudinary client and buffer upload/delete helpers (`src/lib/cloudinary/`).
- [x] Implement upload middleware (`src/middlewares/upload.middleware.ts`).
- [x] Integrate automatic Buyer profile creation in User registration transaction (`auth.service.ts`).
- [x] Implement GET /buyers/me (get own profile).
- [x] Implement PATCH /buyers/me (update profile with optional Cloudinary image upload).
- [x] Implement DELETE /buyers/me (account deletion with session revocation and image cleanup).
- [x] Implement GET /buyers (Admin & Vendor access with pagination).
- [x] Implement GET /buyers/:buyerId (Admin & Vendor access with ID validation).
- [x] Implement PATCH /buyers/:buyerId/status (Admin-only account status update).
- [x] Implement safe image replacement and rollback cleanup on database failure.
- [x] Test Buyer model, APIs, authorization, pagination, and upload workflows.

**Completion Criteria**

- Buyer profile is automatically created in registration transaction for BUYER users.
- One Buyer document per buyer user is strictly enforced.
- Profile image uploads and replacements via Multer and Cloudinary work reliably.
- Old Cloudinary images are removed on update/deletion and deleted on upload failure.
- Cloudinary operations remain outside MongoDB transactions.
- Role-based authorization protects buyer endpoints appropriately.
- Sensitive user information is never exposed.
- Buyer APIs pass tests and production build succeeds.

### Phase 09 — Vendor Profile & Shop Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Vendor interface (`src/modules/v1/vendor/vendor.interface.ts`).
- [x] Create Vendor model with Cloudinary images (`src/modules/v1/vendor/vendor.model.ts`).
- [x] Define Vendor constants and VendorStatus enum (`src/modules/v1/vendor/vendor.constant.ts`).
- [x] Create Vendor Zod validation schemas (`src/modules/v1/vendor/vendor.validation.ts`).
- [x] Configure `upload.fields` middleware for `profile`, `nidFrontImage`, `nidBackImage`.
- [x] Integrate automatic Vendor profile creation in User registration transaction (`auth.service.ts`).
- [x] Implement GET /vendors/me (get own vendor profile).
- [x] Implement PATCH /vendors/me (update own vendor profile with independent image replacements).
- [x] Implement GET /vendors (Admin only with pagination and status filtering defaulting to APPROVED).
- [x] Implement GET /vendors/:vendorId (Admin only with ID validation).
- [x] Implement PATCH /vendors/:vendorId/status (Admin only status update).
- [x] Implement safe image replacement and rollback cleanup on database failure.
- [x] Mount vendor routes in `src/routes/v1/index.ts`.
- [x] Test vendor APIs, authorization, pagination, and upload workflows.

**Completion Criteria**

- Vendor profile and shop information are maintained separately.
- Vendor email verification and shop verification are independent.
- Pending vendors can access their dashboard.
- Only authorized admins can access private verification documents.
- Sensitive documents are not publicly accessible.
- Document replacement and cleanup work safely.

### Phase 10 — Admin Profile Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Admin interface (`src/modules/v1/admin/admin.interface.ts`).
- [x] Create Admin model with Cloudinary profile schema (`src/modules/v1/admin/admin.model.ts`).
- [x] Define Admin constants (`src/modules/v1/admin/admin.constant.ts`).
- [x] Create Admin Zod validation schemas (`src/modules/v1/admin/admin.validation.ts`).
- [x] Integrate automatic Admin profile creation in User creation transaction.
- [x] Implement GET /admins/me (get own Admin profile with populated User information).
- [x] Implement PATCH /admins/me (update profile with optional Cloudinary image upload).
- [x] Implement safe image replacement and rollback cleanup on database failure.
- [x] Reuse existing Multer and Cloudinary utilities without duplication.
- [x] Test Admin model, APIs, authorization, and upload workflows.

**Completion Criteria**

- Creating an ADMIN user automatically creates an Admin profile within the same transaction.
- Authenticated Admin can retrieve their own profile with public User data.
- Authenticated Admin can update their phone number and profile image.
- Profile image replacement and cleanup work safely outside MongoDB transactions.
- Admin cannot update another Admin's profile or change protected fields (role, status, admin ID).
- Production build passes and test suite passes.

### Phase 11 — Admin User Details & Management

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement GET /admin/users.
- [ ] Implement role-based user filtering.
- [ ] Implement pagination and search.
- [ ] Implement GET /admin/users/.
- [ ] Include relevant Buyer Profile information.
- [ ] Include relevant order statistics when available.
- [ ] Implement PATCH /admin/users//status.
- [ ] Implement DELETE /admin/users/.
- [ ] Protect against accidental self-block/self-delete.
- [ ] Consider related data before user deletion.
- [ ] Exclude passwords, OTP hashes and refresh tokens from responses.
- [ ] Test admin user management APIs.

**Completion Criteria**

- Admin can search and filter users.
- Pagination works correctly.
- Sensitive information is excluded.
- Self-block and self-delete restrictions work.
- User deletion follows the approved data-retention strategy.

### Phase 12 — Admin Vendor Management & Approval

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement GET /admin/vendors.
- [ ] Implement GET /admin/vendors/.
- [ ] Implement GET /admin/vendors/requests.
- [ ] Implement GET /admin/vendors/requests/.
- [ ] Implement vendor details using Common User ID.
- [ ] Include VendorProfile information.
- [ ] Include verification documents for authorized admins.
- [ ] Include product and sales statistics when available.
- [ ] Implement approve vendor API.
- [ ] Implement reject vendor API.
- [ ] Save rejection reason.
- [ ] Implement vendor status management.
- [ ] Implement suspend functionality.
- [ ] Keep User account status separate from shop status.
- [ ] Ensure suspended vendors cannot sell.
- [ ] Test vendor approval and suspension flows.

**Completion Criteria**

- Vendor approval and rejection work correctly.
- Rejection reasons are stored.
- User account status and shop status remain separate.
- Suspended vendors cannot perform restricted selling operations.
- Private verification documents are protected.

### Phase 13 — Category Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Category interface.
- [x] Create Category validation schema.
- [x] Create Category model.
- [x] Configure unique category name.
- [x] Optional category image with Cloudinary integration.
- [x] Implement POST /categories (Admin only).
- [x] Implement GET /categories (Public with search, sorting, isActive filtering, non-paginated).
- [x] Implement PATCH /categories/:categoryId/status (Admin only category isActive update).
- [x] Implement GET /categories/:categoryId (Public active category lookup).
- [x] Implement PATCH /categories/:categoryId (Admin only with safe image replacement).
- [x] Implement DELETE /categories/:categoryId (Admin only with product check and Cloudinary cleanup).
- [x] Check related products before deletion.
- [x] Test category management APIs.

**Completion Criteria**

- Category uniqueness is enforced (case-insensitive duplicate detection).
- Category image requirements and safe Cloudinary handling are validated.
- Public and Admin endpoints are separated.
- Related products are considered before deletion.

### Phase 14 — Product Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Product interface.
- [x] Create Product validation schema.
- [x] Create Product model.
- [x] Define product size enum: S, M, L, XL, XXL.
- [x] Define product image structure.
- [x] Require main product image.
- [x] Validate category reference.
- [x] Validate vendor reference.
- [x] Validate product price and stock (product-level stock).
- [x] Support simple product size enum array (S, M, L, XL, XXL) without size variants.
- [x] Implement vendor product creation.
- [x] Implement vendor product listing with default server-side sorting.
- [x] Implement vendor product update.
- [x] Implement vendor product deletion.
- [x] Implement vendor product status update (via updateMyProduct).
- [x] Implement vendor stock update (via updateMyProduct).
- [x] Enforce product ownership.
- [x] Enforce approved vendor requirement for selling operations.
- [ ] Implement admin product listing and details.
- [ ] Implement admin featured status update.
- [ ] Implement admin product status update.
- [ ] Implement admin product deletion.
- [x] Implement Cloudinary image upload/replacement/cleanup.
- [x] Test product management and stock validation.

**Completion Criteria**

- Product schema and validation are consistent.
- Size variants are validated.
- Total stock matches variant stock.
- Product ownership is enforced.
- Only approved vendors can perform selling operations.
- Product image cleanup is safe.
- Stock validation tests pass.

### Phase 15 — Public Home, Product & Shop APIs

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement GET /home.
- [ ] Implement public category APIs.
- [ ] Implement GET /products.
- [ ] Implement GET /products/.
- [ ] Implement GET /products/featured.
- [ ] Implement GET /products/new-arrivals.
- [ ] Implement product search.
- [ ] Implement category filtering.
- [ ] Implement newest sorting.
- [ ] Implement pagination.
- [ ] Default product page size: 15.
- [ ] Implement GET /shops.
- [ ] Implement GET /shops/.
- [ ] Implement GET /shops//products.
- [ ] Show only approved vendor shops.
- [ ] Show only active products.
- [ ] Exclude private NID and licence documents.
- [ ] Use static/existing content strategy for promotional hero sections.
- [ ] Do not introduce a Banner model.
- [ ] Test public APIs.

**Completion Criteria**

- Public APIs expose only active and approved resources.
- Search and filtering work correctly.
- Pagination and sorting are verified.
- Private information is never exposed.
- Promotional content follows the approved static content strategy.

### Phase 16 — Wishlist Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Wishlist interface.
- [x] Create Wishlist validation schema.
- [x] Create Wishlist model.
- [x] Configure one wishlist per Buyer.
- [x] Prevent duplicate products.
- [x] Implement POST /wishlist/items.
- [x] Implement GET /wishlist.
- [x] Implement DELETE /wishlist/items/:productId.
- [x] Handle inactive/deleted products.
- [x] Enforce Buyer ownership.
- [x] Test wishlist operations.

**Completion Criteria**

- One wishlist per Buyer is enforced.
- Duplicate products are prevented.
- Ownership is validated.
- Inactive and deleted products are handled correctly.

### Phase 17 — Shopping Cart Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Cart interface.
- [x] Create Cart validation schema.
- [x] Create Cart model.
- [x] Configure one cart per Buyer.
- [x] Implement cart item structure.
- [x] Implement POST /cart/items.
- [x] Implement GET /cart.
- [x] Implement PATCH /cart/items/:itemId.
- [x] Implement DELETE /cart/items/:itemId.
- [x] Merge same product and size.
- [x] Validate quantity (positive integer).
- [x] Validate product availability (active and exists).
- [x] Validate requested quantity against product stock.
- [x] Populate required product information (safe fields, category, vendor).
- [x] Do not store product price or name in Cart (references Product).
- [x] Enforce Buyer ownership.
- [x] Non-deducting cart management (inventory not decremented).
- [x] Test cart operations.

**Completion Criteria**

- One cart per Buyer is enforced.
- Duplicate product-size combinations are merged.
- Product availability and stock are validated.
- Cart does not store duplicated product pricing information.
- Ownership is enforced.
- Cart operations do not decrement actual inventory.

### Phase 18 — Checkout & Order Summary

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement POST /buyer/checkout/summary.
- [ ] Read current Buyer cart.
- [ ] Validate active products.
- [ ] Validate available stock.
- [ ] Validate selected size.
- [ ] Fetch latest product prices from database.
- [ ] Calculate product subtotal.
- [ ] Calculate shipping charge.
- [ ] Calculate admin commission.
- [ ] Calculate vendor earnings.
- [ ] Calculate final total.
- [ ] Validate shipping information.
- [ ] Ignore client-supplied financial values.
- [ ] Return checkout summary.
- [ ] Test checkout calculations.

**Completion Criteria**

- All financial values are calculated server-side.
- Current product prices are used.
- Stock and product availability are validated.
- Shipping and commission calculations follow approved rules.
- Client-supplied financial values are never trusted.

### Phase 19 — Order Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Order interface.
- [x] Create Order validation schema.
- [x] Create Order model.
- [x] Define embedded shipping address schema.
- [x] Define embedded order item schema.
- [x] Define order status (`OrderStatus`).
- [x] Define order item status (`OrderItemStatus`).
- [x] Implement transaction number generation (`TXN-YYYYMMDD-XXXX`).
- [x] Implement POST /orders.
- [x] Validate cart and product data again.
- [x] Validate stock before order creation.
- [x] Generate immutable product snapshots (name, image, brand, price, quantity, size).
- [x] Store vendor reference per order item.
- [x] Store commission snapshots (15% platform commission, vendor earnings).
- [x] Calculate server-side totals (item subtotals, subtotal, shipping charge, total amount).
- [x] Safely update product stock.
- [x] Prevent concurrent stock overselling.
- [x] Use MongoDB transactions where required.
- [x] Clear cart only after successful order creation.
- [x] Implement Buyer order listing/details/cancellation (`GET /orders/my-orders`, `GET /orders/:orderId`, `PATCH /orders/:orderId/cancel`).
- [x] Enforce Buyer ownership.
- [x] Implement Vendor order listing/details (`GET /orders/vendor/orders`).
- [x] Enforce vendor ownership using top-level `Order.vendor`.
- [x] Implement vendor and admin order status update (`PATCH /orders/:orderId/status`).
- [x] Implement Admin order listing/details (`GET /orders`).
- [x] Enforce single vendor per order document.
- [x] Define order cancellation and stock restoration rules.
- [x] Validate order status transitions.
- [x] Track order status history (`IOrderStatusHistory`).
- [x] Test multi-vendor orders and stock consistency.

**Completion Criteria**

- Orders contain immutable product and commission snapshots.
- Product stock is updated safely.
- Concurrent stock overselling is prevented.
- Multi-vendor order ownership is enforced.
- Cart is cleared only after successful order creation.
- Transaction rollback is verified.
- Order cancellation and stock restoration follow approved rules.
- Order state transitions are validated.

### Phase 20 — Payment Integration

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Payment interface.
- [x] Create Payment validation schema.
- [x] Create Payment model.
- [x] Define payment methods: COD and ONLINE (STRIPE).
- [x] Define payment statuses (`UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED`).
- [x] Allow multiple payment attempts per Order.
- [x] Implement Stripe Checkout Session API.
- [x] Create Stripe session on backend.
- [x] Implement Stripe webhook endpoint.
- [x] Configure raw request body handling for webhook signature verification.
- [x] Verify Stripe webhook signature.
- [x] Implement webhook idempotency.
- [x] Track processed Stripe event IDs.
- [x] Update payment status from verified webhook only.
- [x] Never trust frontend success URL for payment confirmation.
- [x] Keep COD payment initially UNPAID.
- [ ] Implement COD payment confirmation according to approved workflow.
- [x] Implement payment listing/details for Buyer (`GET /payments/order/:orderId`).
- [ ] Implement payment listing/details for Admin.
- [x] Synchronize payment and order status.
- [x] Validate payment state transitions.
- [x] Test successful, failed and duplicate webhook scenarios.

**Completion Criteria**

- Stripe sessions are created securely.
- Webhook signatures are verified.
- Raw request body is preserved for signature verification.
- Duplicate events cannot process payment multiple times.
- Frontend redirects cannot confirm payment.
- COD and Stripe workflows remain consistent.
- Payment and order state transitions are verified.

### Phase 21 — Review & Rating Management

**Status:** COMPLETED

**Implementation Checklist**

- [x] Create Review interface (`src/modules/v1/review/review.interface.ts`).
- [x] Create Review validation schema (`src/modules/v1/review/review.validation.ts`).
- [x] Create Review model with unique compound index `{ product: 1, buyer: 1 }` (`src/modules/v1/review/review.model.ts`).
- [x] Configure one review per Buyer per Product (service validation and database unique index).
- [x] Validate rating as integer between 1 and 5.
- [x] Limit comment to 1000 characters.
- [x] Implement GET /products/:productId/reviews (public access, safe buyer population, sorted newest first).
- [x] Implement POST /reviews (Buyer only, validates delivered order purchase).
- [x] Enforce purchase verification (requires OrderStatus.DELIVERED containing the product for the buyer).
- [x] Enforce Buyer ownership (buyer retrieved from authenticated req.user.userId, never request body).
- [x] Test review operations (11 automated test scenarios passing).

**Completion Criteria**

- Rating validation works (integer between 1 and 5).
- Duplicate reviews are prevented via service check and MongoDB index (E11000).
- Buyer ownership is strictly enforced.
- Purchase verification requires a DELIVERED order for the product.
- Product existence is verified for all operations.

### Phase 22 — Buyer Dashboard

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement GET /buyer/dashboard/overview.
- [ ] Calculate total orders.
- [ ] Calculate pending orders.
- [ ] Calculate completed orders.
- [ ] Calculate cancelled orders.
- [ ] Calculate wishlist count.
- [ ] Return recent orders.
- [ ] Return recent activities where supported.
- [ ] Ensure data belongs to authenticated Buyer.
- [ ] Test Buyer dashboard API.

**Completion Criteria**

- Dashboard statistics are accurate.
- Data belongs only to authenticated Buyer.
- Recent orders are correctly filtered.
- Aggregation queries are efficient.

### Phase 23 — Vendor Dashboard

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement GET /vendor/dashboard/overview.
- [ ] Implement GET /vendor/dashboard/sales-chart.
- [ ] Implement GET /vendor/dashboard/earnings-chart.
- [ ] Implement GET /vendor/dashboard/recent-sales.
- [ ] Calculate total products.
- [ ] Calculate total earnings.
- [ ] Calculate monthly product sales.
- [ ] Calculate monthly earnings.
- [ ] Return recent sales and orders.
- [ ] Return vendor verification status.
- [ ] Restrict data to authenticated Vendor.
- [ ] Allow dashboard access while shop approval is pending.
- [ ] Test Vendor dashboard APIs.

**Completion Criteria**

- Vendor dashboard data is restricted to the authenticated Vendor.
- Dashboard access does not require shop approval.
- Earnings and sales calculations are accurate.
- Monthly chart data is verified.

### Phase 24 — Vendor Earnings

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Confirm commission calculation utility.
- [ ] Use 15% Admin commission.
- [ ] Use 85% Vendor earnings.
- [ ] Exclude shipping charge from commission.
- [ ] Calculate earnings from order item snapshots.
- [ ] Exclude cancelled orders from earned commission.
- [ ] Exclude failed payments from earned commission.
- [ ] Handle refund-related commission reversal where applicable.
- [ ] Implement GET /vendor/earnings/overview.
- [ ] Implement GET /vendor/earnings.
- [ ] Implement GET /vendor/earnings/.
- [ ] Restrict earnings data to authenticated Vendor.
- [ ] Do not introduce Payout or Withdrawal functionality.
- [ ] Test earnings calculations.

**Completion Criteria**

- Commission calculations follow approved business rules.
- Shipping charge is excluded.
- Vendor earnings use immutable order item snapshots.
- Refund adjustments follow the approved workflow.
- Vendor cannot access another Vendor's earnings.

### Phase 25 — Admin Dashboard & Earnings

**Status:** NOT_STARTED

**Implementation Checklist**

- [ ] Implement GET /admin/dashboard/overview.
- [ ] Implement GET /admin/dashboard/earnings.
- [ ] Implement GET /admin/dashboard/recent-users.
- [ ] Calculate total platform commission income.
- [ ] Calculate total vendors.
- [ ] Calculate total users.
- [ ] Calculate total sales.
- [ ] Generate monthly earnings chart.
- [ ] Return recent users.
- [ ] Return pending vendor requests.
- [ ] Return recent orders.
- [ ] Implement GET /admin/earnings/overview.
- [ ] Implement GET /admin/earnings.
- [ ] Implement GET /admin/earnings/.
- [ ] Implement GET /admin/earnings/chart.
- [ ] Exclude shipping charge from Admin income.
- [ ] Exclude failed/cancelled transactions from earned commission.
- [ ] Handle refund-related commission reversal where applicable.
- [ ] Test Admin dashboard and earnings APIs.

**Completion Criteria**

- Admin dashboard statistics are accurate.
- Commission income is calculated correctly.
- Shipping charge is excluded.
- Refund adjustments follow approved rules.
- Only authorized Admin accounts can access these APIs.

### Phase 26 — Testing, Security & Optimization

**Status:** NOT_STARTED

**API and Functional Testing**

- [ ] Review all API endpoints.
- [ ] Test authentication and authorization.
- [ ] Test role-based access control.
- [ ] Test ownership validation.
- [ ] Test Zod validation.
- [ ] Test centralized error handling.
- [ ] Test User and Vendor workflows.
- [ ] Test product and category management.
- [ ] Test wishlist and cart.
- [ ] Test checkout and order creation.
- [ ] Test multi-vendor order scenarios.
- [ ] Test stock concurrency and overselling prevention.
- [ ] Test Stripe webhook security and idempotency.
- [ ] Test COD payment flow.
- [ ] Test commission and earnings calculations.
- [ ] Test Cloudinary upload and cleanup.
- [ ] Test private NID document access.

**Security Review**

- [ ] Review sensitive data exposure.
- [ ] Review password and token security.
- [ ] Review cookie and CSRF security.
- [ ] Review rate limiting.
- [ ] Review authentication and authorization.
- [ ] Review file upload validation.
- [ ] Review private document access.
- [ ] Review Stripe webhook verification.
- [ ] Review environment variable handling.
- [ ] Review error messages and logging.
- [ ] Review account deletion and data retention rules.

**Database and Performance Review**

- [ ] Review database indexes.
- [ ] Review query performance.
- [ ] Review database relationships.
- [ ] Review transaction handling.
- [ ] Review transaction rollback behavior.
- [ ] Review concurrent stock updates.
- [ ] Review pagination.
- [ ] Review unnecessary database queries.
- [ ] Review aggregation performance.
- [ ] Review memory usage and response payloads.

**Production Readiness**

- [ ] Review environment configuration.
- [ ] Review production build.
- [ ] Review deployment configuration.
- [ ] Review graceful shutdown.
- [ ] Review logging and monitoring.
- [ ] Update API documentation.
- [ ] Update architecture documentation.
- [ ] Update project context files.
- [ ] Verify production build and deployment configuration.

**Completion Criteria**

- All required functional tests pass.
- Authentication and authorization are verified.
- Critical security issues are resolved.
- Transaction and concurrency behavior is verified.
- Payment integration is verified.
- Production build succeeds.
- Required documentation is updated.

## 5. Overall Phase Summary

This section is a summary of Section 4.

Update it whenever a phase status changes.

| Phase | Feature                                   | Status      |
| ----- | ----------------------------------------- | ----------- |
| 01    | Project Setup & Shared Infrastructure     | COMPLETED   |
| 02    | User Model                                | COMPLETED   |
| 03    | Authentication — Registration & Login     | COMPLETED   |
| 04    | Email OTP Verification                    | COMPLETED   |
| 05    | Forgot Password & Reset Password          | COMPLETED   |
| 06    | Access Token & Refresh Token              | COMPLETED   |
| 07    | Authentication & Authorization Middleware | IN_PROGRESS |
| 08    | Buyer Profile Management                  | COMPLETED   |
| 09    | Vendor Profile & Shop Management          | NOT_STARTED |
| 10    | Admin Profile Management                  | COMPLETED   |
| 11    | Admin User Details & Management           | NOT_STARTED |
| 12    | Admin Vendor Management & Approval        | NOT_STARTED |
| 13    | Category Management                       | NOT_STARTED |
| 14    | Product Management                        | NOT_STARTED |
| 15    | Public Home, Product & Shop APIs          | NOT_STARTED |
| 16    | Wishlist Management                       | NOT_STARTED |
| 17    | Shopping Cart Management                  | NOT_STARTED |
| 18    | Checkout & Order Summary                  | NOT_STARTED |
| 19    | Order Management                          | NOT_STARTED |
| 20    | Payment Integration                       | NOT_STARTED |
| 21    | Review & Rating Management                | COMPLETED   |
| 22    | Buyer Dashboard                           | NOT_STARTED |
| 23    | Vendor Dashboard                          | NOT_STARTED |
| 24    | Vendor Earnings                           | NOT_STARTED |
| 25    | Admin Dashboard & Earnings                | NOT_STARTED |
| 26    | Testing, Security & Optimization          | NOT_STARTED |

**Source of Phase Status:** Section 4.

Do not allow the summary to contradict the detailed phase tracker.

## 6. Database Model Progress

Track database model implementation separately from phase progress.

| Model         | Purpose                               | Status      |
| ------------- | ------------------------------------- | ----------- |
| User          | Common Account                        | COMPLETED   |
| Verification  | OTP & Password Reset                  | COMPLETED   |
| RefreshToken  | Server-side Refresh Sessions, if used | NOT_STARTED |
| Buyer         | Buyer Personal Profile                | COMPLETED   |
| Admin         | Admin Personal Profile                | COMPLETED   |
| VendorProfile | Vendor Shop & Verification            | NOT_STARTED |
| Category      | Product Categories                    | NOT_STARTED |
| Product       | Product Information                   | NOT_STARTED |
| Wishlist      | Buyer Wishlist                        | NOT_STARTED |
| Cart          | Buyer Cart                            | NOT_STARTED |
| Order         | Customer Orders                       | NOT_STARTED |
| Payment       | Payment Records                       | NOT_STARTED |
| Review        | Product Reviews & Ratings             | COMPLETED   |

### Model Completion Checklist

A model can be marked COMPLETED only after verifying:

- [ ] TypeScript interface/type implemented.
- [ ] Mongoose schema implemented.
- [ ] Required validation configured.
- [ ] Required indexes configured.
- [ ] Database constraints verified.
- [ ] Sensitive fields protected.
- [ ] Relevant model tests passed.

### Models Outside Current Scope

Do not create these models unless explicitly requested:

- Buyer
- Vendor
- Admin
- Commission
- Banner
- Notification
- OrderItem
- Payout

## 7. API Development Progress

Track API implementation through the relevant phase checklist above.

### API Completion Checklist

For each API, verify:

- [ ] Correct HTTP method and endpoint.
- [ ] Correct authentication requirement.
- [ ] Correct role authorization.
- [ ] Request validation with Zod.
- [ ] Route parameter validation.
- [ ] Query parameter validation.
- [ ] Service-layer business logic.
- [ ] Controller handles request and response.
- [ ] Ownership validation.
- [ ] Centralized error handling.
- [ ] Consistent response structure.
- [ ] Appropriate HTTP status codes.
- [ ] Successful response tested.
- [ ] Failure response tested.
- [ ] Relevant edge cases tested.
- [ ] API documentation updated.

### API Completion Rule

An API must not be marked complete merely because its route and controller exist.

Required business logic, validation, security, error handling, and relevant tests must also be verified.

## 8. Architecture Decisions

Record important decisions here.

Do not silently change an existing decision.

### Authentication & User Architecture

- One Common User Model.
- One Common Authentication System.
- Public registration supports BUYER and VENDOR only.
- ADMIN account creation uses a secure administrative process.
- Email verification is mandatory before login.
- No common /auth/me or /auth/current-user API.
- Separate Buyer, Vendor and Admin current profile APIs.

### Profile & Vendor Architecture

- Buyer Profile and VendorProfile are separate models.
- Vendor email verification and shop verification are separate.
- Vendor Dashboard access is independent of shop approval.
- Only APPROVED vendors can perform selling operations.
- Admin uses Common User ID to view Vendor details.
- User account status and shop status remain separate.

### Product & Order Architecture

- Backend owns price, stock, shipping, commission and payment calculations.
- Order items contain immutable product and commission snapshots.
- Order items are embedded in Order.
- No separate OrderItem model.
- Product price and name are not duplicated in Cart.
- Stock must be updated safely.
- Concurrent stock overselling must be prevented.

### Financial Architecture

- Admin commission is 15%.
- Vendor earning is 85%.
- Shipping charge is excluded from commission.
- Financial calculations are performed on the backend.
- Order item snapshots preserve historical financial values.
- No separate Commission model.
- Refund-related commission reversal must follow an approved workflow.

### File Storage Architecture

- Cloudinary stores product images, profile images and verification documents.
- NID documents must remain private.
- Authorized access is required for sensitive verification documents.
- Replaced or deleted assets must be cleaned up safely.

### Scope Decisions

- No separate Banner model.
- No separate Notification model.
- No separate Payout model.
- No separate Buyer, Vendor or Admin models.
- Dynamic Banner Management is outside current scope.
- Vendor Withdrawal/Payout System is outside current scope.

## 9. Open Questions & Pending Decisions

Record unresolved decisions before implementing dependent features.

Never invent business rules to close these questions.

| Question                                                  | Priority | Status  | Decision |
| --------------------------------------------------------- | -------- | ------- | -------- |
| Server-side RefreshToken storage required?                | High     | PENDING | TBD      |
| Refresh token rotation strategy?                          | High     | PENDING | TBD      |
| Exact cookie and CSRF strategy?                           | High     | PENDING | TBD      |
| MongoDB replica set deployment strategy?                  | High     | PENDING | TBD      |
| Shipping charge calculation rules?                        | High     | PENDING | TBD      |
| Vendor-wise shipping calculation for multi-vendor orders? | High     | PENDING | TBD      |
| Order cancellation and stock restoration rules?           | High     | PENDING | TBD      |
| User deletion: soft delete or hard delete?                | High     | PENDING | TBD      |
| Product deletion with existing orders?                    | High     | PENDING | TBD      |
| Purchase verification required for reviews?               | Medium   | PENDING | TBD      |
| Refund and commission reversal workflow?                  | High     | PENDING | TBD      |
| COD payment confirmation process?                         | High     | PENDING | TBD      |
| Exact money rounding strategy?                            | High     | PENDING | TBD      |
| Vendor shop suspension restrictions?                      | High     | PENDING | TBD      |
| Stripe webhook event retention strategy?                  | Medium   | PENDING | TBD      |
| Payment and order status transition rules?                | High     | PENDING | TBD      |
| Cloudinary private asset delivery strategy?               | High     | PENDING | TBD      |

### Decision Management Rules

- Mark a question as RESOLVED only after an explicit decision.
- Record the actual approved decision.
- Update the relevant Architecture Decisions section.
- Update related implementation requirements when necessary.
- Do not implement dependent business logic while a critical decision remains unresolved.
- Ask the user when clarification is required.

## 10. Current Blockers

Record all active technical and business blockers.

| Blocker       | Impact | Status | Resolution |
| ------------- | ------ | ------ | ---------- |
| None recorded | —      | —      | —          |

### Blocker Management Rules

- Document blockers as soon as they are identified.
- Explain which feature or phase is affected.
- Identify whether the blocker is technical or business-related.
- Record the required resolution.
- Update the blocker status when resolved.
- Do not mark a blocked feature as completed.

## 11. Session Notes

Record important implementation details from each development session.

### Session — 2026-11-06 (Phase 20 Completion: Payment Module & Stripe Integration)

**Date:** 2026-11-06

**Phase:** Phase 20

**Feature:** Payment Module with COD & Stripe Online Payment Support

**Status:** COMPLETED

**Completed:**

- Installed official Stripe Node.js SDK (`stripe`).
- Implemented Payment model (`src/modules/v1/payment/payment.model.ts`) with `order` (unique reference), `buyer`, `paymentMethod` (`COD`, `ONLINE`), `provider` (`COD`, `STRIPE`), `amount`, `currency`, `status` (`UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED`), `stripeSessionId`, `stripePaymentIntentId`, and `paidAt`.
- Implemented Payment interfaces and types (`src/modules/v1/payment/payment.interface.ts`).
- Implemented Payment constants (`src/modules/v1/payment/payment.constant.ts`).
- Implemented Stripe client initialization (`src/lib/stripe.ts`) using environment variables.
- Configured Express raw body parsing for `/api/v1/payments/stripe/webhook` prior to standard JSON parsing in `src/app.ts` to ensure Stripe signature verification succeeds.
- Implemented Payment service (`src/modules/v1/payment/payment.service.ts`):
  - `createPayment`: Creates payment record linked to Order.
  - `createStripeCheckoutSession`: Creates Stripe Checkout Session with server-calculated amounts, configured currency, metadata, 30-min expiration, and duplicate session prevention.
  - `handleStripeWebhook`: Verifies Stripe signatures and idempotently processes `checkout.session.completed` (marks `PAID`, sets `paidAt`, clears cart), `checkout.session.expired` (marks `FAILED`, restores reserved stock, cancels order), and `payment_intent.payment_failed`.
  - `getPaymentByOrderId`: Fetches payment details for a buyer's order.
- Updated Order service (`src/modules/v1/order/order.service.ts`):
  - `createOrder`:
    - For `COD`: Atomically creates order (`PENDING`), creates payment (`UNPAID`), deducts stock, clears cart.
    - For `ONLINE`: Atomically creates order (`PENDING`), creates payment (`PENDING`), reserves stock, creates Stripe checkout session, keeps cart intact until webhook confirmation.
  - `cancelOrder`: Guards against cancelling paid orders; restores stock and cancels pending/unpaid orders atomically.
  - `getMyOrders` & `getOrderById`: Populates payment details alongside order and vendor information.
- Mounted `/payments` route on `/api/v1/payments` in `src/routes/v1/index.ts`.
- Documented Stripe environment variables in `.env` and `.env.example`.

**Files Created:**

- `src/lib/stripe.ts`
- `src/modules/v1/payment/payment.constant.ts`
- `src/modules/v1/payment/payment.interface.ts`
- `src/modules/v1/payment/payment.model.ts`
- `src/modules/v1/payment/payment.validation.ts`
- `src/modules/v1/payment/payment.service.ts`
- `src/modules/v1/payment/payment.controller.ts`
- `src/modules/v1/payment/payment.route.ts`
- `.env.example`

**Files Updated:**

- `src/app.ts` (configured webhook raw body parsing)
- `src/config/index.ts` (added Stripe configuration)
- `src/routes/v1/index.ts` (mounted `/payments` route)
- `src/modules/v1/order/order.model.ts` (added payment reference)
- `src/modules/v1/order/order.interface.ts` (updated order and create order result types)
- `src/modules/v1/order/order.service.ts` (integrated COD and Stripe Online checkout)
- `.env` (added Stripe placeholders)
- `context/progress-tracker.md` (marked Phase 20 as COMPLETED)

**Dependencies Added:** `stripe` (^23.1.0).

**Tests Executed:**

- TypeScript production build (`tsc && tsc-alias`) — 0 errors.
- Payment test script (`test-payment.js`): Verified `PaymentStatus`, `PaymentMethod`, `PaymentProvider`, `Payment` schema paths/indexes, Webhook signature rejection on invalid signature, and Express routing.
- Order test script (`test-order.js`): Verified `createOrderSchema` COD default, explicit ONLINE, invalid type rejection, and status query filters.
- Cart regression test (`test-cart.js`): Verified 0 regressions in cart operations.

**Test Results:** All tests passed cleanly.

**Date:** 2026-11-06

**Phase:** Phase 19

**Feature:** Order Module Update (OrderType COD/ONLINE & Simplified Status)

**Status:** COMPLETED

**Completed:**

- Added `OrderType` enum (`COD`, `ONLINE`) to `src/modules/v1/order/order.constant.ts` with `OrderType.COD` as default.
- Streamlined `OrderStatus` and `OrderItemStatus` to strictly two supported values for the current implementation: `PENDING` and `CANCELLED`.
- Added `orderType` field to `orderSchema` in `src/modules/v1/order/order.model.ts` with `default: OrderType.COD` and `required: true`.
- Updated `createOrder` service to:
  - Default `orderType` to `COD` if omitted.
  - Reject `ONLINE` order creation with a clear error because online Stripe payment is not implemented yet.
  - Set initial order status to `OrderStatus.PENDING`.
- Updated `cancelOrder` service to strictly allow cancellation only when `order.status === OrderStatus.PENDING` and reject already `CANCELLED` orders.
- Updated Zod schemas in `src/modules/v1/order/order.validation.ts`:
  - `createOrderSchema`: Validates optional `orderType` (`COD` or `ONLINE`), defaulting to `COD`, with strict address validation.
  - `orderQuerySchema`: Validates optional `status` (`PENDING`, `CANCELLED`) and optional `orderType` (`COD`, `ONLINE`).
- Verified zero fake payment logic; kept architecture clean and ready for separate future Stripe integration.

**Files Created/Updated:**

- `src/modules/v1/order/order.constant.ts`
- `src/modules/v1/order/order.interface.ts`
- `src/modules/v1/order/order.model.ts`
- `src/modules/v1/order/order.validation.ts`
- `src/modules/v1/order/order.service.ts`
- `context/progress-tracker.md`

**Dependencies Added:** None.

**Tests Executed:**

- TypeScript production build (`tsc && tsc-alias`) — 0 errors.
- Scratch test script (`test-order.js`): Verified `OrderType` enum, strict two-value `OrderStatus` enum, `createOrderSchema` default COD parsing, explicit ONLINE parsing, invalid order type rejection, query filtering, and service rejection of `ONLINE` order creation.
- Cart regression test (`test-cart.js`) — 0 regressions.

**Test Results:** All tests passed cleanly.

**Dependencies Added:** None (reused existing `mongoose`, `zod`, `express`, `http-status`, `crypto`).

**Architecture Decisions:**

- Pure function-based architecture for Order service, controller, and routes (zero ES classes).
- Historical product snapshots stored on each order item (`name`, `image`, `brand`, `unitPrice`, `quantity`, `size`, `itemSubtotal`, `commissionRate`, `adminCommission`, `vendorEarning`) so future product or commission changes do not alter historical records.
- Support multi-vendor items in a single buyer order document with vendor references per item.
- Transactional atomic stock deduction and cart clearing on creation; transactional atomic stock restoration on cancellation.
- Dedicated `runInTransaction` wrapper providing full MongoDB transaction atomicity on replica sets with fallback on standalone dev MongoDB instances.

**Tests Executed:**

- TypeScript production build (`tsc && tsc-alias`) — 0 errors.
- Scratch test script (`test-order.js`): Verified `createOrderSchema` (nested and flat address formats, missing fields rejection, phone regex, strict rejection of unexpected fields), `orderIdParamsSchema`, `orderQuerySchema` (defaults, valid/invalid statuses), and Express route mounting.
- Cart regression test (`test-cart.js`): Verified 0 regressions in shopping cart operations.

**Test Results:** All tests executed and passed successfully.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user instruction for next feature/phase.

### Session — 2026-11-05 (Phase 17 Completion)

**Date:** 2026-11-05

**Phase:** Phase 17

**Feature:** Shopping Cart Module

**Status:** COMPLETED

**Completed:**

- Implemented Cart model (`src/modules/v1/cart/cart.model.ts`) with embedded `cartItemSchema` (`product`, `quantity`, `size`) and unique 1:1 `buyer` reference.
- Implemented Cart interfaces and types (`src/modules/v1/cart/cart.interface.ts`).
- Implemented Cart constants (`src/modules/v1/cart/cart.constant.ts`).
- Implemented strict Zod validation schemas (`src/modules/v1/cart/cart.validation.ts`) for `POST /cart/items`, `PATCH /cart/items/:itemId`, and `DELETE /cart/items/:itemId`.
- Implemented pure function-based Cart service (`src/modules/v1/cart/cart.service.ts`):
  - `addToCart`: Validates product existence and `isActive: true`, verifies size requirement against `product.sizes`, verifies available stock, merges duplicate product+size items by incrementing quantity, guards combined quantity against stock, and creates cart if none exists.
  - `getCart`: Retrieves authenticated buyer's cart with safe populated product fields (`name`, `description`, `brand`, `price`, `stock`, `featureImage`, `images`, `sizes`, `isActive`, safe `category`, safe `vendor`). Returns empty cart structure if none created yet.
  - `updateCartItemQuantity`: Updates specific item quantity after strictly verifying product exists, is active, and requested quantity does not exceed product stock.
  - `removeCartItem`: Removes individual cart item by item ID without affecting the rest of the cart or the Product document.
- Implemented pure function-based controller (`src/modules/v1/cart/cart.controller.ts`) and routes (`src/modules/v1/cart/cart.route.ts`) protected by `authenticate` and `authorize(UserRole.BUYER)`.
- Mounted `/cart` route on the main API router (`src/routes/v1/index.ts`).
- Ensured non-deducting cart behavior: cart operations manage intended purchase quantities and do not alter product stock.

**Files Created:**

- `src/modules/v1/cart/cart.constant.ts`
- `src/modules/v1/cart/cart.interface.ts`
- `src/modules/v1/cart/cart.model.ts`
- `src/modules/v1/cart/cart.validation.ts`
- `src/modules/v1/cart/cart.service.ts`
- `src/modules/v1/cart/cart.controller.ts`
- `src/modules/v1/cart/cart.route.ts`

**Files Updated:**

- `src/routes/v1/index.ts` (mounted `/cart` routes)
- `context/progress-tracker.md` (marked Phase 17 as COMPLETED)

**Dependencies Added:** None (reused existing `mongoose`, `zod`, `express`, `http-status`).

**Architecture Decisions:**

- Pure function-based architecture for Cart service, controller, and routes (zero ES classes).
- 1:1 relationship between User (`BUYER`) and Cart with unique index constraint on `buyer`.
- Subdocument `productItems` embedded within Cart with auto-generated subdocument `_id` used for item-level operations (`itemId`).
- Strict stock verification on add and update operations against current `Product.stock`.
- Non-deducting cart management: inventory remains untouched during cart operations (deduction is deferred to order placement).

**Tests Executed:**

- TypeScript production build (`tsc && tsc-alias`) — 0 errors.
- Scratch test script (`test-cart.js`): Verified `addToCartSchema` (valid inputs, required positive integers, invalid sizes, extra fields rejection via `.strict()`), `updateCartItemSchema`, `cartItemParamsSchema`, and Express routing integration.

**Test Results:** All tests executed and passed successfully.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user instruction for next feature/phase.

### Session — 2026-11-03 (Phase 10 Completion)

**Date:** 2026-11-03

**Phase:** Phase 10

**Feature:** Admin Profile Management with Cloudinary & Multer

**Status:** COMPLETED

**Completed:**

- Implemented Admin model (`src/modules/v1/admin/admin.model.ts`) with unique `admin` reference and Cloudinary `profile` subdocument schema (`type`, `url`, `publicId`).
- Implemented Admin interfaces (`src/modules/v1/admin/admin.interface.ts`) and constants (`src/modules/v1/admin/admin.constant.ts`).
- Implemented strict Zod validation schema (`updateAdminProfileSchema`) that validates `phoneNumber` and strictly rejects client tampering with protected fields (`role`, `status`, `admin`, `profile`, `url`, `publicId`).
- Integrated automatic Admin profile creation inside User creation transaction when role is `ADMIN` in `src/modules/v1/auth/auth.service.ts`.
- Implemented pure function-based Admin service (`admin.service.ts`):
  - `createAdminProfile`: Idempotent atomic creation within MongoDB session.
  - `getOwnProfile`: Retrieves authenticated admin profile with populated public User details.
  - `updateOwnProfile`: Replaces profile image safely via Cloudinary, cleaning up old image upon successful DB commit, and deleting newly uploaded image if DB update fails.
- Implemented pure function-based controller (`admin.controller.ts`) and routes (`admin.route.ts`):
  - `GET /admins/me` and `GET /admins/profile` (Authenticated Admin)
  - `PATCH /admins/me` and `PATCH /admins/profile` (Authenticated Admin with optional multipart image upload)
- Fixed Express 5 `req.query` getter-only assignment issue in `src/middlewares/validateRequest.ts` via `Object.defineProperty` helper `assignValidatedProperty`.
- Mounted `/admins` and `/admin` routes on the main router (`src/routes/v1/index.ts`).
- Updated `GET /buyers` to support optional `skip` query parameter with validation as non-negative integer and priority over `page`.
- Created and executed comprehensive test suites for validation, schema, router definitions, and service edge cases.

**Files Created:**

- `src/modules/v1/admin/admin.constant.ts`
- `src/modules/v1/admin/admin.interface.ts`
- `src/modules/v1/admin/admin.model.ts`
- `src/modules/v1/admin/admin.validation.ts`
- `src/modules/v1/admin/admin.service.ts`
- `src/modules/v1/admin/admin.controller.ts`
- `src/modules/v1/admin/admin.route.ts`

**Files Updated:**

- `src/modules/v1/auth/auth.service.ts` (integrated automatic Admin profile creation in User creation transaction)
- `src/routes/v1/index.ts` (mounted `/admins` and `/admin` routes)
- `context/progress-tracker.md` (marked Phase 10 and Admin model as COMPLETED)

**Files Deleted:** None

**Dependencies Added:** None (reused existing `cloudinary`, `multer`, `zod`, `mongoose`, `express`).

**Architecture Decisions:**

- Pure function-based architecture for Admin service, controller, and routes (zero ES classes).
- Schema subdocument `profile` contains `type` (MIME type), `url` (Cloudinary URL), and `publicId` (Cloudinary public ID).
- Cloudinary buffer upload and delete helpers are reused without duplication and executed strictly outside MongoDB transactions.
- Rollback cleanup of newly uploaded Cloudinary image if DB update fails to prevent orphaned asset accumulation.
- Support both `/me` and `/profile` endpoints under `/admins` and `/admin` paths for complete API compatibility.

**Tests Executed:**

- TypeScript production build (`tsc && tsc-alias`) — 0 errors.
- `scratch/test-admin.js`: Verified `updateAdminProfileSchema` strict validation and rejection of protected fields, Admin model paths/constraints, and router registration.
- `scratch/test-admin-service.js`: Verified `getOwnProfile`, `updateOwnProfile`, and `createAdminProfile` error handling, 404 guards, and idempotency.
- `scratch/test-buyer.js`: Verified zero regressions in previously completed Buyer module.

**Test Results:** All tests executed and passed successfully.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user instruction for next feature/phase.

### Session — 2026-11-02 (Phase 08 Completion)

**Date:** 2026-11-02

**Phase:** Phase 08

**Feature:** Buyer Profile Management with Cloudinary & Multer

**Status:** COMPLETED

**Completed:**

- Implemented Buyer model with unique `buyer` reference and Cloudinary `profile` subdocument schema (`publicId`, `url`, `width`, `height`).
- Implemented Multer configuration with memoryStorage, 5 MB file size limit, and strict MIME type validation (JPEG, JPG, PNG, WEBP).
- Implemented Cloudinary configuration and reusable helper functions for buffer uploads (`uploadToCloudinary`) and publicId deletions (`deleteFromCloudinary`).
- Implemented Upload middleware (`upload.single("profile")`) and handled `multer.MulterError` in the centralized error handler.
- Integrated automatic Buyer profile creation inside the MongoDB registration transaction when `role === "BUYER"`.
- Implemented all 6 Buyer API endpoints with pure function-based architecture:
  - `GET /buyers/me` (Authenticated Buyer — get own profile)
  - `PATCH /buyers/me` (Authenticated Buyer — update profile with optional multipart image)
  - `DELETE /buyers/me` (Authenticated Buyer — account deletion with session revocation and image cleanup)
  - `GET /buyers` (Admin & Vendor — paginated list of buyers)
  - `GET /buyers/:buyerId` (Admin & Vendor — get buyer by ID)
  - `PATCH /buyers/:buyerId/status` (Admin only — update account status in `User` model)
- Ensured Cloudinary calls execute outside MongoDB transactions and newly uploaded images are cleaned up if database updates fail.
- Enhanced `validateRequest` middleware to flexibly accept optional request source parameter or multi-target schema maps.

**Files Created:**

- `src/utils/multer/multer.interface.ts`
- `src/utils/multer/multer.config.ts`
- `src/utils/multer/index.ts`
- `src/lib/cloudinary/cloudinary.config.ts`
- `src/lib/cloudinary/cloudinary.upload.ts`
- `src/lib/cloudinary/cloudinary.delete.ts`
- `src/lib/cloudinary/index.ts`
- `src/middlewares/upload.middleware.ts`
- `src/modules/v1/buyer/buyer.constant.ts`
- `src/modules/v1/buyer/buyer.interface.ts`
- `src/modules/v1/buyer/buyer.model.ts`
- `src/modules/v1/buyer/buyer.validation.ts`
- `src/modules/v1/buyer/buyer.service.ts`
- `src/modules/v1/buyer/buyer.controller.ts`
- `src/modules/v1/buyer/buyer.route.ts`

**Files Updated:**

- `src/config/index.ts` (added `IMAGE_MAX_SIZE` configuration)
- `src/middlewares/globalErrorHandler.ts` (handled `MulterError`)
- `src/middlewares/validateRequest.ts` (supported `validateRequest(schema, source)`)
- `src/modules/v1/auth/auth.service.ts` (integrated Buyer profile creation in registration transaction)
- `src/routes/v1/index.ts` (mounted `/buyers` route)
- `context/progress-tracker.md` (marked Phase 08 as COMPLETED)

**Files Deleted:** None

**Dependencies Added:** None (reused installed `cloudinary`, `multer`, `zod`, `mongoose`, `express`).

**Architecture Decisions:**

- Pure standalone function-based services and controllers in `src/modules/v1/buyer/`.
- Kept all Cloudinary uploads and deletions strictly outside MongoDB transactions.
- Automated cleanup of newly uploaded Cloudinary image if database update fails to avoid orphaned storage leaks.
- Account status updates modify `User.status` directly, with immediate Redis session revocation when status is `BLOCKED`.

**Tests Executed:**

- TypeScript production build (`tsc && tsc-alias`) — 0 errors.
- Automated validation test suite (`scratch/test-buyer.js`):
  - Verified `updateBuyerProfileSchema` passes valid payload and rejects invalid phone, gender, and oversized address.
  - Verified `buyerIdParamsSchema` validates 24-character hexadecimal ObjectId format.
  - Verified `updateBuyerStatusSchema` restricts input to `ACTIVE` and `BLOCKED`.
  - Verified `buyerQuerySchema` coerces page and limit parameters with default fallbacks.
  - Verified Multer file filter accepts `image/jpeg`, `image/jpg`, `image/png`, `image/webp` and rejects unapproved MIME types.
  - Verified `validateRequest` middleware handles single targets, custom sources, and multi-property target maps.
  - Verified `Buyer` Mongoose schema paths, types, required flags, and defaults.
  - Verified all 6 Buyer API route paths and HTTP methods in the router stack.

**Test Results:** All tests executed and passed successfully.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user instruction for Phase 09 (Vendor Profile & Shop Management).

### Session 10 — Module Refactoring & Architecture Standardization

**Date:** 2026-11-04

**Phase:** Maintenance & Architecture Refactoring

**Feature:** Standardize Controllers, Services, Cloudinary & Multer Utilities

**Status:** COMPLETED

**Completed:**

- Standardized all controllers across Auth, Buyer, Vendor, Verification, and Admin to object-based default exports (e.g., `const authController = { ... }; export default authController;`). Removed all individual controller exports.
- Standardized all services across Auth, User, Buyer, Vendor, Verification, Email, and Admin to object-based default exports (e.g., `const authService = { ... }; export default authService;`). Removed all individual service exports.
- Standardized all route files to import default controller objects and call methods via `controller.method`.
- Standardized internal controller calls to invoke service methods through default-exported service objects (e.g., `authService.login(...)`).
- Reorganized Cloudinary from folder `src/lib/cloudinary/` into single file `src/lib/cloudinary.ts` exporting default `cloudinaryService` (`uploadImage`, `deleteImage`, etc.).
- Reorganized Multer from folder `src/utils/multer/` into single file `src/utils/multer.ts` exporting default `multerUtils` and named `upload` helper.
- Reviewed and verified Forgot Password and Reset Password flows: Redis is used strictly for temporary reset tokens, expiration, and cooldown; MongoDB permanently stores updated hashed passwords; all user refresh tokens and active sessions are revoked on reset.
- Maintained strict TypeScript type safety, error handling, and zero circular dependencies.

**Files Created:**

- `src/lib/cloudinary.ts`
- `src/utils/multer.ts`

**Files Updated:**

- `src/modules/v1/auth/auth.service.ts`
- `src/modules/v1/auth/auth.controller.ts`
- `src/modules/v1/auth/email/email.service.ts`
- `src/modules/v1/user/user.service.ts`
- `src/modules/v1/buyer/buyer.service.ts`
- `src/modules/v1/buyer/buyer.controller.ts`
- `src/modules/v1/vendor/vendor.service.ts`
- `src/modules/v1/vendor/vendor.controller.ts`
- `src/modules/v1/verification/verification.service.ts`
- `src/modules/v1/verification/verification.controller.ts`
- `src/modules/v1/verification/verification.route.ts`
- `src/modules/v1/admin/admin.service.ts`
- `src/modules/v1/admin/admin.controller.ts`
- `context/progress-tracker.md`

**Files Deleted:**

- Directory `src/lib/cloudinary/`
- Directory `src/utils/multer/`

**Dependencies Added:** None.

**Architecture Decisions:**

- Replaced individual exports with default-exported service and controller objects for clear namespace discovery, prevention of naming conflicts, and unified mocking in tests.
- Preserved single-file utilities for Cloudinary and Multer to prevent folder sprawl while providing backward compatibility with existing method signatures.

**Tests Executed:**

- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Structure & Exports Verification (`scratch/verify_refactored_modules.js`) — all controller, service, utility exports, and app route mounting verified.
- Vendor Creation Flow Tests (`scratch/verify_vendor_creation_flow.js`) — passed.
- Vendor Status Filter Tests (`scratch/verify_vendor_status_filter.js`) — passed.
- Vendor Dist Verification (`scratch/verify_dist_vendor.js`) — passed.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 11 — Refactor All Imports to Use the `@/` Path Alias

**Date:** 2026-11-04

**Phase:** Maintenance & Code Standardization

**Feature:** Refactor All Imports to Use the `@/` Path Alias

**Status:** COMPLETED

**Completed:**

- Scanned all TypeScript source files across `src/` to identify all relative imports (`./`, `../`, `../../`, etc.).
- Replaced all relative internal imports across every module (Admin, User, Buyer, Vendor, Verification, Auth, Email, Templates, Redis) with their respective `@/` path alias.
- Verified zero relative imports remain in the entire `src/` directory.
- Confirmed that development runtime alias resolution (`nodemon` with `ts-node -r tsconfig-paths/register`) resolves `@/*` aliases without issues.
- Confirmed that production build (`npm run build` with `tsc && tsc-alias`) transforms all `@/*` aliases into clean relative paths in `dist/`.
- Preserved all external package imports and Node.js built-ins.
- Zero changes to business logic, API behavior, error codes, or function implementations.

**Files Created:** None.

**Files Updated:**

- `src/modules/v1/admin/admin.controller.ts`
- `src/modules/v1/admin/admin.model.ts`
- `src/modules/v1/admin/admin.route.ts`
- `src/modules/v1/admin/admin.service.ts`
- `src/modules/v1/auth/auth.constant.ts`
- `src/modules/v1/auth/auth.controller.ts`
- `src/modules/v1/auth/auth.interface.ts`
- `src/modules/v1/auth/auth.route.ts`
- `src/modules/v1/auth/auth.service.ts`
- `src/modules/v1/auth/email/email.service.ts`
- `src/modules/v1/auth/email/templates/password-reset.template.ts`
- `src/modules/v1/auth/email/templates/verification.template.ts`
- `src/modules/v1/auth/email/templates/welcome-admin.template.ts`
- `src/modules/v1/auth/email/templates/welcome-buyer.template.ts`
- `src/modules/v1/auth/email/templates/welcome-vendor.template.ts`
- `src/modules/v1/auth/redis/redis.service.ts`
- `src/modules/v1/buyer/buyer.controller.ts`
- `src/modules/v1/buyer/buyer.interface.ts`
- `src/modules/v1/buyer/buyer.model.ts`
- `src/modules/v1/buyer/buyer.route.ts`
- `src/modules/v1/buyer/buyer.service.ts`
- `src/modules/v1/buyer/buyer.validation.ts`
- `src/modules/v1/user/user.interface.ts`
- `src/modules/v1/user/user.model.ts`
- `src/modules/v1/user/user.service.ts`
- `src/modules/v1/vendor/vendor.controller.ts`
- `src/modules/v1/vendor/vendor.interface.ts`
- `src/modules/v1/vendor/vendor.model.ts`
- `src/modules/v1/vendor/vendor.route.ts`
- `src/modules/v1/vendor/vendor.service.ts`
- `src/modules/v1/vendor/vendor.validation.ts`
- `src/modules/v1/verification/verification.controller.ts`
- `src/modules/v1/verification/verification.model.ts`
- `src/modules/v1/verification/verification.route.ts`
- `src/modules/v1/verification/verification.service.ts`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Replaced relative paths (`./`, `../`, etc.) with the root-relative `@/` alias throughout the codebase to ensure path consistency, improve refactoring safety, and eliminate fragile relative path depth navigation.

**Tests Executed:**

- Search for remaining relative imports across `src/` — 0 matches found.
- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Search for unresolved `@/` in `dist/` — 0 matches found (`tsc-alias` transformed all aliases).
- Development Runtime Test (`npx ts-node -r tsconfig-paths/register`) — app initialized and verified.
- Suite Verification (`scratch/verify_refactored_modules.js`) — passed.
- Flow & Filter Verification (`scratch/verify_vendor_creation_flow.js`, `scratch/verify_vendor_status_filter.js`) — passed.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 12 — Standardize validateRequest Usage Across the Backend

**Date:** 2026-11-04

**Phase:** Maintenance & Code Standardization

**Feature:** Standardize validateRequest Usage Across the Entire Backend

**Status:** COMPLETED

**Completed:**

- Scanned all route handlers across all backend modules for `validateRequest` usage.
- Refactored all single-source request validations to the explicit `validateRequest(schema, "body" | "params" | "query")` pattern:
  - `auth.route.ts`: standardizing registration, login, refresh-token, forgot-password, and reset-password body validations.
  - `admin.route.ts`: standardizing `updateAdminProfileSchema` body validations.
  - `buyer.route.ts`: standardizing `updateBuyerProfileSchema` body validation.
  - `vendor.route.ts`: standardizing `updateVendorProfileSchema` body validation.
  - `verification.route.ts`: standardizing `sendOtpSchema`, `verifyOtpSchema`, and `resendOtpSchema` body validations.
- Preserved genuine multiple-source object-based validations (`params` + `body`) on `/:buyerId/status` and `/:vendorId/status`.
- Verified type safety, centralized error handling, and `safeParseAsync` in `src/middlewares/validateRequest.ts`.
- Verified 0 remaining ambiguous or single-source object-based validation calls.
- Verified TypeScript compilation and production build.

**Files Created:** None.

**Files Updated:**

- `src/modules/v1/auth/auth.route.ts`
- `src/modules/v1/admin/admin.route.ts`
- `src/modules/v1/buyer/buyer.route.ts`
- `src/modules/v1/vendor/vendor.route.ts`
- `src/modules/v1/verification/verification.route.ts`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Enforced explicit `"body" | "params" | "query"` target declarations for all single-source validations for code readability, predictability, and uniform middleware signature.
- Maintained object-based configuration strictly for endpoints requiring joint multi-source validation (e.g., path parameters and request body simultaneously).

**Tests Executed:**

- Search for all `validateRequest` invocations — verified all single-source validations include explicit target string, and only multi-source endpoints use object-based validation.
- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Suite Verification (`scratch/verify_refactored_modules.js`) — passed.
- Flow & Filter Verification (`scratch/verify_vendor_creation_flow.js`, `scratch/verify_vendor_status_filter.js`) — passed.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 13 — Category Management Module Implementation

**Date:** 2026-11-04

**Phase:** Phase 13 — Category Management

**Feature:** Category Module (Management & Public APIs)

**Status:** COMPLETED

**Completed:**

- Implemented full Category management module in `src/modules/v1/category/` adhering strictly to specifications in `context/features/category.md`.
- Implemented `category.model.ts` with `admin` (ref: "User", required), `name` (required, trimmed, max 100), `image` (publicId, url, width, height), `isActive` (boolean, default: true), timestamps, versionKey: false, and case-insensitive unique index with English collation.
- Implemented `category.validation.ts` with strict Zod schemas for `createCategorySchema`, `updateCategorySchema`, `categoryIdParamsSchema`, and `categoryQuerySchema`.
- Implemented `category.service.ts` with:
  - `createCategory`: case-insensitive duplicate check, optional Cloudinary upload with automatic cleanup on database error.
  - `getAllCategories`: pagination (`page`, `limit`, `skip`), case-insensitive name search, customizable sorting, and default `isActive: true` filtering (with support for explicit `isActive: false` or `isActive: true`).
  - `getCategoryById`: public active category retrieval with 404 NOT_FOUND for non-existent or inactive categories.
  - `updateCategory`: case-insensitive uniqueness check upon rename, partial field updates, safe Cloudinary image upload and previous image deletion outside transactions.
  - `deleteCategory`: blocked if referenced by existing products (`mongoose.models.Product`), database deletion, and Cloudinary asset cleanup.
- Implemented `category.controller.ts` with standard default-exported `categoryController` and uniform `sendResponse`.
- Implemented `category.route.ts` with explicit `validateRequest(schema, "body" | "params" | "query")` and multi-source `{ params, body }` for partial updates.
- Mounted `/categories` in `src/routes/v1/index.ts`.
- Added `CATEGORY_IN_USE` and `INVALID_CATEGORY_ID` to `src/utils/ERROR_CODES.ts`.
- Verified 100% build compatibility and executed comprehensive schema, router, and service logic tests.

**Files Created:**

- `src/modules/v1/category/category.constant.ts`
- `src/modules/v1/category/category.interface.ts`
- `src/modules/v1/category/category.model.ts`
- `src/modules/v1/category/category.validation.ts`
- `src/modules/v1/category/category.service.ts`
- `src/modules/v1/category/category.controller.ts`
- `src/modules/v1/category/category.route.ts`
- `scratch/verify_category.js`
- `scratch/verify_category_service_logic.js`

**Files Updated:**

- `src/utils/ERROR_CODES.ts`
- `src/routes/v1/index.ts`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Case-Insensitive Uniqueness: Combined database-level collation index `{ locale: "en", strength: 2 }` with service-level regex check `^${escapeRegex(name)}$` for resilient uniqueness.
- Product Association Safety: Conditionally checks `mongoose.models.Product` to prevent deleting categories currently linked to products without creating hard dependency cycles before Phase 14.
- Safe Cloudinary Cleanup: Image uploads and deletions occur strictly outside MongoDB transactions, with rollback deletions on database update failures to avoid orphaned cloud assets.

**Tests Executed:**

- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Category Model, Validation, and Router Tests (`scratch/verify_category.js`) — passed.
- Category Service Logic Tests (`scratch/verify_category_service_logic.js`) — duplicate name rejection, active filtering, product reference blocking, and Cloudinary cleanup verified.
- Full Suite Verification (`scratch/verify_refactored_modules.js`) — passed.
- Regression Tests (`scratch/verify_vendor_creation_flow.js`, `scratch/verify_vendor_status_filter.js`, `scratch/verify_dist_vendor.js`) — passed.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 14 — Category Module Refinements (Non-Paginated List & Status Update API)

**Date:** 2026-11-04

**Phase:** Phase 13 — Category Management

**Feature:** Category Module Updates

**Status:** COMPLETED

**Completed:**

- Removed pagination from GET /categories to return all matching categories directly without page, limit, or pagination metadata.
- Preserved case-insensitive search and isActive filtering in GET /categories, defaulting to isActive: true when no status is provided while honoring explicit isActive: false.
- Added Admin-only endpoint PATCH /categories/:categoryId/status to toggle/update category isActive status.
- Added updateCategoryStatusSchema in category.validation.ts validating categoryId (MongoDB ObjectId) and boolean isActive.
- Updated category.service.ts with updateCategoryStatus returning populated admin details, with 404 NOT_FOUND when the category does not exist.
- Updated category.controller.ts with updateCategoryStatus and non-paginated getAllCategories.
- Updated category.route.ts mounting PATCH /:categoryId/status with authenticate, authorize(UserRole.ADMIN), and multi-source validateRequest({ params, body }).
- Updated category.interface.ts, category.constant.ts, and feature documentation in context/features/category.md.
- Verified TypeScript compilation (npx tsc --noEmit) and production build (npm run build).
- Verified with comprehensive test scripts (verify_category.js, verify_category_service_logic.js, verify_refactored_modules.js).

**Files Created:** None.

**Files Updated:**

- src/modules/v1/category/category.constant.ts
- src/modules/v1/category/category.interface.ts
- src/modules/v1/category/category.validation.ts
- src/modules/v1/category/category.service.ts
- src/modules/v1/category/category.controller.ts
- src/modules/v1/category/category.route.ts
- context/features/category.md
- context/progress-tracker.md

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Non-Paginated Category Retrieval: Categories represent a bounded hierarchical taxonomy suitable for full retrieval with client-side/server-side filtering without pagination overhead.
- Direct Status Management: PATCH /categories/:categoryId/status provides a dedicated, lightweight endpoint for enabling/disabling categories without multipart image processing.
- Multi-Source Validation Pattern: Adheres to validateRequest({ params: categoryIdParamsSchema, body: updateCategoryStatusSchema }) for simultaneous params + body validation.

**Tests Executed:**

- TypeScript Typecheck (npx tsc --noEmit) — 0 errors.
- Production Build (npm run build -> tsc && tsc-alias) — completed successfully.
- Category Verification Script (verify_category.js) — 6 routes, schemas, and app mounting verified.
- Category Service Logic Verification (verify_category_service_logic.js) — non-paginated list, default active filter, updateCategoryStatus success, and 404 behavior verified.
- Full Suite Verification (verify_refactored_modules.js) — all modules verified.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 15 — Stripe API Version Pinning and Documentation Update

**Date:** 2026-11-06

**Phase:** Phase 20 (Payment Integration & Order Update)

**Feature:** Stripe API Version Troubleshooting & Explicit Pinning

**Status:** COMPLETED

**Completed:**

- Diagnosed and resolved the `Invalid Stripe API version: 2020-08-27;vipps_preview=v1. You do not have permission to pass this beta header: vipps_preview.` error.
- Pin explicit stable API version (`2026-10-28.endive`) and `typescript: true` on the Stripe SDK instance in `src/lib/stripe.ts` to prevent fallback to legacy/unwhitelisted preview headers.
- Updated `README.md` and `PAYMENT_TESTING_README.md` with a detailed explanation of the error, root causes (outdated Postman collections or account settings), and steps to resolve it in API testing tools and Stripe dashboard.
- Verified TypeScript compilation (`npx tsc --noEmit`) and production build (`npm run build`).

**Files Created:** None.

**Files Updated:**

- `src/lib/stripe.ts`
- `README.md`
- `PAYMENT_TESTING_README.md`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Explicitly declared Stripe client API version in `src/lib/stripe.ts` to eliminate ambiguity and prevent legacy beta/preview headers from affecting API calls.

**Tests Executed:**

- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 16 — Complete Order Lifecycle & Status Management

**Date:** 2026-11-07

**Phase:** Phase 19 (Order Management) & Phase 20 (Payment Integration)

**Feature:** Order Status Management, Vendor Order Item Ownership, Status History & Admin Controls

**Status:** COMPLETED

**Completed:**

- Expanded `OrderStatus` enum with complete lifecycle: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PARTIALLY_SHIPPED`, `PARTIALLY_DELIVERED`.
- Expanded `OrderItemStatus` enum with: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- Implemented `calculateOverallOrderStatus(items)` to automatically synchronize overall order status based on item statuses:
  - `PARTIALLY_SHIPPED`: when some items are shipped while others are not yet shipped.
  - `SHIPPED`: when all applicable items are shipped.
  - `PARTIALLY_DELIVERED`: when some items are delivered while others are not yet delivered.
  - `DELIVERED`: when all applicable items are delivered.
  - `CANCELLED`: when all items are cancelled.
  - Correctly handles mixed cancellation and fulfillment states without false full-fulfillment.
- Enforced strict Vendor ownership on `PATCH /orders/:orderId/items/:itemId/status`:
  - Verified authenticated vendor ID against Order Item's `vendor` reference and `Product.vendor`.
  - Returned 403 FORBIDDEN when vendor does not own the requested item.
  - Returned 404 NOT_FOUND for non-existent orders or items.
  - Prevented vendors from directly altering overall order status (only auto-synchronized).
- Added transition validation (`VALID_ITEM_STATUS_TRANSITIONS` & `VALID_ORDER_STATUS_TRANSITIONS`) preventing invalid backward transitions and terminal state updates.
- Implemented `statusHistory` in `orderSchema` tracking `previousStatus`, `newStatus`, `changedBy`, `note`, and `createdAt`.
- Maintained MongoDB transaction consistency for status updates and automatic stock restoration upon cancellation.
- Avoided unnecessary database writes when requested status is unchanged.
- Added Admin management endpoints (`GET /orders`, `PATCH /orders/:orderId/status`) and Vendor order listing (`GET /orders/vendor/orders`).

**Files Created:** None.

**Files Updated:**

- `src/modules/v1/order/order.constant.ts`
- `src/modules/v1/order/order.interface.ts`
- `src/modules/v1/order/order.model.ts`
- `src/modules/v1/order/order.validation.ts`
- `src/modules/v1/order/order.service.ts`
- `src/modules/v1/order/order.controller.ts`
- `src/modules/v1/order/order.route.ts`
- `context/features/order.md`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Status Synchronization Strategy: Defined hierarchical evaluation (all cancelled -> delivered checks -> shipped checks -> processing/confirmed checks -> pending) to ensure mathematical consistency across mixed multi-item states.
- Ownership Multi-Check: Validated both the historical snapshot vendor reference in `productItems` and the underlying `Product.vendor` against the authenticated vendor's approved profile to prevent tampering.
- Auditability: Integrated `statusHistory` subdocument array within `Order` to maintain an immutable log of status transitions, notes, and actors.

**Tests Executed:**

- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Logic Test Suite (`verify_order_status_logic.js`) — verified all 8 OrderStatus, 6 OrderItemStatus, transition maps, single item, multi-item partial, full, and mixed cancellation/delivery scenarios.
- Structure Test Suite (`verify_order_module_structure.js`) — verified Mongoose schema paths, Zod validation schemas, controller methods, service methods, and all 8 router endpoints.
- Service Simulation Test (`verify_order_service_behavior.js`) — verified multi-vendor 7-step lifecycle with status history and cancellation edge cases.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 17 — Refactor Order Status to Single Order-Level Status

**Date:** 2026-11-07

**Phase:** Phase 19 (Order Management) & Phase 20 (Payment Integration)

**Feature:** Order Module Refactoring to Single Order-Level Status & Dedicated Vendor Reference

**Status:** COMPLETED

**Completed:**

- Streamlined `OrderStatus` enum to exactly 6 values: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- Removed `OrderItemStatus` completely from the codebase along with partial statuses (`PARTIALLY_SHIPPED`, `PARTIALLY_DELIVERED`).
- Removed `status` field from `orderItemSchema`.
- Added dedicated top-level `vendor` reference (`Schema.Types.ObjectId`, `ref: "Vendor"`) to `orderSchema` and indexed `{ vendor: 1, createdAt: -1 }`.
- Enforced single vendor per order in `createOrder` service (`vendorIds.length > 1` throws 400).
- Refactored `PATCH /orders/:orderId/status` to be authorized for both the owning `VENDOR` and `ADMIN`:
  - Verified Vendor ownership using `order.vendor` against the authenticated vendor's ID (`req.user.userId` -> `Vendor._id`).
  - Returns `403 FORBIDDEN` if vendor attempts to update another vendor's order.
  - Returns `404 NOT_FOUND` if order does not exist.
  - Blocks updates to terminal states (`DELIVERED` or `CANCELLED`).
  - Validates forward status transitions (`PENDING` -> `CONFIRMED`/`PROCESSING`/`CANCELLED` -> `SHIPPED` -> `DELIVERED`).
  - Skips database writes if requested status equals current status.
  - Automatically restores reserved product stock if order is cancelled.
- Preserved `statusHistory` audit trail on `Order`, recording `previousStatus`, `newStatus`, `changedBy`, `note`, and `createdAt`.
- Removed obsolete `updateOrderItemStatus` route, controller, service, and validation schemas.
- Updated `src/modules/v1/payment/payment.service.ts` webhook handlers to remove references to `OrderItemStatus` while cleanly releasing product stock on payment failure.

**Files Created:** None.

**Files Updated:**

- `src/modules/v1/order/order.constant.ts`
- `src/modules/v1/order/order.interface.ts`
- `src/modules/v1/order/order.model.ts`
- `src/modules/v1/order/order.validation.ts`
- `src/modules/v1/order/order.service.ts`
- `src/modules/v1/order/order.controller.ts`
- `src/modules/v1/order/order.route.ts`
- `src/modules/v1/payment/payment.service.ts`
- `context/features/order.md`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Dedicated Order-Level Vendor: Replaced item-level vendor deduction with a primary `Order.vendor` reference. Since Jus Buy uses separate orders per vendor, this eliminates multi-item partial status synchronization complexity while establishing a direct ownership boundary.
- Unified Status Management: Consolidated order status updates into a single endpoint (`PATCH /orders/:orderId/status`), enabling both owning Vendors and Admins to manage order progression with role-based checks and immutable status history.

**Tests Executed:**

- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Structure & Enum Verification (`verify_refactored_order_status.js`) — verified 6 OrderStatus values, removal of OrderItemStatus, orderSchema paths (top-level vendor, status, statusHistory, no item status), valid transitions, controller/service exports, and 7 mounted routes.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 18 — Simplify Order Status Management (Removed statusHistory)

**Date:** 2026-11-07

**Phase:** Phase 19 (Order Management) & Phase 20 (Payment Integration)

**Feature:** Simplified Order Status Management — Removal of statusHistory and History Schemas

**Status:** COMPLETED

**Completed:**

- Removed `statusHistory` field from `orderSchema` and `IOrder` interface.
- Removed `orderStatusHistorySchema` and `IOrderStatusHistory` interface.
- Removed all `statusHistory` creation, push, and populate operations across `createOrder`, `cancelOrder`, `updateOrderStatus`, `getMyOrders`, `getOrderById`, `getAllOrders`, and `getVendorOrders`.
- Removed all unused imports, types, and references related to status history.
- Retained exactly one `status` field at the Order level using `OrderStatus` enum (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- Preserved Vendor ownership checks (`order.vendor`), forward transition rules (`VALID_ORDER_STATUS_TRANSITIONS`), terminal state protection, and transaction-safe stock restoration.

**Files Created:** None.

**Files Updated:**

- `src/modules/v1/order/order.interface.ts`
- `src/modules/v1/order/order.model.ts`
- `src/modules/v1/order/order.service.ts`
- `context/progress-tracker.md`

**Files Deleted:** None.

**Dependencies Added:** None.

**Architecture Decisions:**

- Simplified Status Architecture: Eliminated status history subdocument tracking and associated population overhead. Kept the Order model lightweight with single `status` field while retaining complete status transition validation and ownership security.

**Tests Executed:**

- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Structure Verification (`verify_simplified_order_status.js`) — confirmed absence of `statusHistory`, confirmed top-level `vendor` and `status`, verified forward transitions, terminal states, controller/service exports, and 7 routes.

**Test Results:** All tests and checks passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 19 — Fix Stripe Payment Success: paidAt Not Updating

**Date:** 2026-11-07

**Phase:** Phase 20 (Payment Module & Stripe Integration)

**Feature:** Fix Stripe Payment Success: paidAt Not Updating

**Status:** COMPLETED

**Root Cause Analysis:**
1. **Missing `payment_intent.succeeded` Handler:** Stripe webhook events for successful payments dispatch both `checkout.session.completed` and `payment_intent.succeeded`. The webhook handler only had `checkout.session.completed`, silently ignoring `payment_intent.succeeded`.
2. **Missing Metadata on PaymentIntent:** `createStripeCheckoutSession` passed metadata at the Checkout Session level, but omitted `payment_intent_data.metadata`, leaving the underlying Stripe PaymentIntent without payment and order reference IDs.
3. **Non-Atomic Document Update:** Previous logic modified the in-memory mongoose document and called `payment.save()`, which was susceptible to race conditions and did not update `status` and `paidAt` in a single atomic database `$set` operation.
4. **Stripe Unix Timestamp Conversion:** Stripe timestamps (`event.created`, `session.created`, `paymentIntent.created`) are Unix timestamps in seconds. They must be safely extracted and multiplied by 1000 before constructing JavaScript `Date` instances.
5. **Idempotency & Concurrent Overwrite Prevention:** Concurrent webhook deliveries could overwrite previously persisted `paidAt` dates.

**Completed:**
- Updated `createStripeCheckoutSession` in `src/modules/v1/payment/payment.service.ts` to include `payment_intent_data: { metadata: ... }`.
- Created robust timestamp helper `getStripeTimestamp` converting Stripe second timestamps to JavaScript `Date` with fallback to `new Date()`.
- Implemented single atomic MongoDB `$set` update using `Payment.findOneAndUpdate` with filter `{ _id: payment._id, status: { $ne: PaymentStatus.PAID } }` and `{ returnDocument: "after" }` in `checkout.session.completed`.
- Implemented `payment_intent.succeeded` handler in `handleStripeWebhook` with matching `$or` lookup, amount/currency validation, refund protection for cancelled orders, atomic `$set` update of `status: PAID` and `paidAt`, and cart clearing.
- Strengthened idempotency so duplicate webhook deliveries will never mutate or overwrite an already-paid payment's `paidAt` timestamp.
- Updated `src/modules/v1/payment/payment.interface.ts` with `paidAt?: Date | null;`.

**Files Created:** None (non-artifact scratch test `verify_paid_at.js` created in app brain).

**Files Updated:**
- `src/modules/v1/payment/payment.service.ts`
- `src/modules/v1/payment/payment.interface.ts`
- `context/progress-tracker.md`

**Dependencies Added:** None.

**Architecture Decisions:**
- Enforced database-level atomic idempotency: `{ status: { $ne: PaymentStatus.PAID } }` in `findOneAndUpdate` guarantees thread safety and immutability of `paidAt` across parallel/repeated webhook deliveries without requiring manual distributed locks.

**Tests Executed:**
- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Webhook Integration Verification (`verify_paid_at.js`):
  - Verified `checkout.session.completed` successfully saves `status: PAID` and `paidAt` with Stripe's timestamp.
  - Verified duplicate webhook delivery does not overwrite original `paidAt`.
  - Verified `payment_intent.succeeded` successfully updates `status: PAID` and `paidAt`.
  - Cleaned up test database documents.

**Test Results:** All tests passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 20 — Fix Stripe Payment Success Database Status Update & Session Verification

**Date:** 2026-11-07

**Phase:** Phase 20 (Payment Module & Stripe Integration)

**Feature:** Fix Stripe Payment Success Database Status Update & Session Verification

**Status:** COMPLETED

**Root Cause Analysis:**
1. **Timing Asynchrony & Client Redirect:** Stripe redirects the client browser immediately to `/payment/success?session_id=...&order_id=...` upon payment completion, while server-to-server webhook delivery occurs asynchronously in the background. The user arrives on the frontend success page before the webhook finishes processing.
2. **Missing Session Verification API on Backend:** The backend lacked an endpoint (`/api/v1/payments/verify-session/:sessionId`) for the frontend success page to verify the Stripe Checkout Session on-demand, leaving the frontend with no reliable way to confirm payment if the webhook was delayed or undelivered in local development.
3. **Local Development Webhook Reachability:** Stripe cannot deliver webhooks to localhost without active Stripe CLI tunneling (`stripe listen --forward-to localhost:8080/api/v1/payments/stripe/webhook`). When developers tested checkout by following the redirect URL in test mode, the redirect succeeded but webhooks never reached localhost, leaving database records in `PENDING` state permanently without session reconciliation.
4. **Duplicate `express.raw` Middleware:** `express.raw({ type: "application/json" })` was configured in both `src/app.ts` and `src/modules/v1/payment/payment.route.ts`. Running raw body parsing twice on the same stream risked corrupted/empty bodies on incoming webhooks.
5. **Webhook Secret Formatting Typo:** `.env` contained `STRIPE_WEBHOOK_SECRET=hsec_...` instead of `whsec_...` (missing leading 'w'), which caused cryptographic HMAC signature verification mismatches on real Stripe events.

**Completed:**
- Sanitized `STRIPE_WEBHOOK_SECRET` in `src/config/index.ts` to automatically format secrets starting with `hsec_` to `whsec_`, and corrected `.env`.
- Cleaned up webhook middleware in `src/modules/v1/payment/payment.route.ts` by removing redundant duplicate `express.raw()` (relying on `app.ts` pre-JSON raw body parser).
- Implemented shared transaction-safe payment confirmation helper `confirmPaymentSuccess` in `src/modules/v1/payment/payment.service.ts` that atomically sets `status: PAID`, records `paidAt`, links `order.payment`, preserves `order.status: PENDING`, and clears the buyer's cart.
- Created `verifyStripeCheckoutSession` in `src/modules/v1/payment/payment.service.ts` to retrieve and verify live Stripe Checkout Session status directly from Stripe API, reconcile database state atomically, and return confirmed or pending states.
- Enhanced `getPaymentByOrderId` to reconcile with Stripe session directly if payment is in `PENDING` state.
- Implemented `verifyStripeSession` controller and mounted protected endpoints:
  - `GET /api/v1/payments/verify-session/:sessionId` (Path parameter)
  - `GET /api/v1/payments/verify-session` (Query parameter `?session_id=...`)
- Added Zod validation schemas for session verification (`sessionIdParamsSchema` and `sessionIdQuerySchema`).
- Updated `PAYMENT_TESTING_README.md` with Step 7B (Frontend Payment Success Page Verification).

**Files Created:** None (persistent test scripts maintained in application brain scratch).

**Files Updated:**
- `src/config/index.ts`
- `.env`
- `src/modules/v1/payment/payment.service.ts`
- `src/modules/v1/payment/payment.controller.ts`
- `src/modules/v1/payment/payment.route.ts`
- `src/modules/v1/payment/payment.interface.ts`
- `src/modules/v1/payment/payment.validation.ts`
- `PAYMENT_TESTING_README.md`
- `context/progress-tracker.md`

**Dependencies Added:** None.

**Architecture Decisions:**
- Reused `confirmPaymentSuccess` across both webhook processing and frontend session verification: ensures 100% DRY, transaction-safe, idempotent updates regardless of whether confirmation originates from the webhook or the success redirect.
- Strict Buyer Ownership Enforcement: Verification requests strictly authenticate and verify that the target payment belongs to the calling buyer, preventing unauthorized access.

**Tests Executed:**
- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- End-to-end Integration Test (`verify_stripe_payment_flow.js`):
  - Verified Order & Payment creation in `PENDING` status.
  - Verified `checkout.session.completed` webhook updates `status: PAID`, sets `paidAt`, links `order.payment`, and clears cart.
  - Verified duplicate webhook delivery idempotently preserves original `paidAt`.
  - Verified `verifyStripeCheckoutSession` returns confirmed `PAID` payment and order data.
  - Verified `getPaymentByOrderId` returns confirmed payment.
  - Verified ownership security rejects impostor buyer requests with 403 Forbidden.
  - Cleaned up test database documents.

**Test Results:** All tests passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 21 — Implement Correct ONLINE and COD Payment Status Management

**Date:** 2026-11-07

**Phase:** Phase 20 (Payment Module & Order Fulfillment Decoupling)

**Feature:** Implement Correct ONLINE and COD Payment Status Management

**Status:** COMPLETED

**Overview:**
Implemented the complete, decoupled payment status lifecycle for both ONLINE and COD orders.

1. **ONLINE Orders Lifecycle:**
   - On creation: Payment `status = PENDING`, Order `status = PENDING`.
   - On Stripe payment success (webhook / session verification): Payment `status = PAID`, `paidAt` populated with Stripe timestamp. Order fulfillment status remains independent (`PENDING`).
2. **COD Orders Lifecycle:**
   - On creation: Payment `status = UNPAID`, `paidAt = null`, Order `status = PENDING`.
   - On order delivery (`status -> DELIVERED`): Payment strictly remains `UNPAID` until actual cash collection confirmation.
   - Dedicated COD payment confirmation action (`PATCH /api/v1/payments/cod/confirm/:orderId`, `PATCH /api/v1/orders/:orderId/confirm-cod-payment`):
     - Validates order is COD.
     - Validates order fulfillment status is `DELIVERED`.
     - Validates authenticated caller is either the owning Vendor (`order.vendor.toString() === vendor._id.toString()`) or an Admin.
     - Never trusts client-supplied vendor ID or buyer ID.
     - Rejects duplicate confirmation attempts safely.
     - Rejects online orders or non-delivered orders.
     - Atomically updates Payment `status = PAID` and `paidAt = new Date()` in a MongoDB transaction.

**Completed:**
- Implemented `confirmCODPayment` in `src/modules/v1/payment/payment.service.ts` with strict vendor ownership verification, role authorization (Vendor/Admin), delivery status check (`DELIVERED`), order type check (`COD`), and atomic database updates inside `runInTransaction`.
- Added `confirmCODPayment` controller in `src/modules/v1/payment/payment.controller.ts` and `src/modules/v1/order/order.controller.ts`.
- Mounted protected COD payment confirmation routes in `src/modules/v1/payment/payment.route.ts` and `src/modules/v1/order/order.route.ts`.
- Added new messages (`COD_PAYMENT_CONFIRMED`, `COD_ONLY`, `ORDER_NOT_DELIVERED`, `UNAUTHORIZED_CONFIRMATION`) to `PAYMENT_MESSAGES` in `src/modules/v1/payment/payment.constant.ts`.
- Updated `PAYMENT_TESTING_README.md` with endpoint documentation.

**Files Created:** None (persistent test scripts maintained in brain scratch).

**Files Updated:**
- `src/modules/v1/payment/payment.constant.ts`
- `src/modules/v1/payment/payment.service.ts`
- `src/modules/v1/payment/payment.controller.ts`
- `src/modules/v1/payment/payment.route.ts`
- `src/modules/v1/order/order.controller.ts`
- `src/modules/v1/order/order.route.ts`
- `PAYMENT_TESTING_README.md`
- `context/progress-tracker.md`

**Dependencies Added:** None.

**Architecture Decisions:**
- Preserved strict separation of concerns between payment status (`PaymentStatus`: `UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED`) and order fulfillment status (`OrderStatus`: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- Dual-mounting confirmation routes on both `/payments/cod/confirm/:orderId` and `/orders/:orderId/confirm-cod-payment` ensures flexible client consumption while maintaining a single DRY service implementation.

**Tests Executed:**
- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — completed successfully.
- Comprehensive 10-Scenario Integration Test (`verify_all_payment_flows.js`):
  1. ONLINE payment success -> Payment `PAID` with `paidAt`, Order remains `PENDING`.
  2. COD Order creation -> Payment `UNPAID` with `paidAt: null`.
  3. COD Order delivered -> Payment remains `UNPAID` until collection confirmation.
  4. COD payment confirmation by authorized Vendor -> Payment `PAID` with `paidAt: new Date()`.
  5. COD payment confirmation by Admin -> Payment `PAID` with `paidAt: new Date()`.
  6. Vendor cannot confirm another Vendor's Order payment -> 403 Forbidden.
  7. COD payment cannot be confirmed before delivery -> 400 Bad Request.
  8. ONLINE payment cannot use COD confirmation -> 400 Bad Request.
  9. Duplicate COD confirmation is rejected safely -> 400 Bad Request.
  10. Failed database transactions do not leave inconsistent Payment data.

**Test Results:** All 10 scenarios passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session 22

**Date:** 2026-11-07

**Phase:** Phase 21

**Feature:** Review & Rating Management (context/features/review.md)

**Status:** COMPLETED

**Completed:**
- Implemented Review module in strict accordance with `context/features/review.md`.
- Created Review schema, Mongoose model, TypeScript interface, constants, Zod validation, service, controller, and routes:
  - Model: `product` (ref Product), `buyer` (ref User), integer `rating` (1-5), `comment` (max 1000 chars, trimmed), timestamps, and compound unique index `{ product: 1, buyer: 1 }`.
  - Service `createReview`:
    - Checks Product existence (`404 NOT_FOUND`).
    - Validates delivered order purchase (`OrderStatus.DELIVERED`, `buyer: buyerId`, `productItems.product: productId`), rejecting with `400 BAD_REQUEST` / `REVIEW_NOT_ALLOWED` if unpurchased or undelivered.
    - Validates duplicate review prevention at service level (`409 CONFLICT` / `REVIEW_ALREADY_EXISTS`).
    - Catches MongoDB duplicate key error code 11000 and maps to `409 CONFLICT` / `REVIEW_ALREADY_EXISTS`.
  - Service `getProductReviews`:
    - Verifies product existence (`404 NOT_FOUND`).
    - Fetches reviews sorted by `createdAt: -1`.
    - Populates safe buyer fields (`name`, `email`) avoiding sensitive data.
    - Returns `[]` when no reviews exist.
  - Routes:
    - `POST /api/v1/reviews`: protected by `authenticate`, `authorize(UserRole.BUYER)`, and `validateRequest(createReviewSchema, "body")`.
    - `GET /api/v1/products/:productId/reviews`: public access with `validateRequest(productIdParamsSchema, "params")` mounted on `productRoutes` and `reviewRoutes`.

**Files Created:**
- `src/modules/v1/review/review.interface.ts`
- `src/modules/v1/review/review.constant.ts`
- `src/modules/v1/review/review.model.ts`
- `src/modules/v1/review/review.validation.ts`
- `src/modules/v1/review/review.service.ts`
- `src/modules/v1/review/review.controller.ts`
- `src/modules/v1/review/review.route.ts`

**Files Updated:**
- `src/routes/v1/index.ts` (mounted `/reviews` routes)
- `src/modules/v1/product/product.route.ts` (mounted `GET /:productId/reviews`)
- `context/progress-tracker.md` (updated Phase 21 & Review model progress and session history)

**Dependencies Added:** None.

**Architecture Decisions:**
- Followed standard modular architecture with object-based default exports (`reviewService`, `reviewController`).
- Kept controller thin and delegated all purchase eligibility and duplicate checks to the service layer.
- Populated only non-sensitive buyer fields (`name`, `email`).
- Dual route registration for product reviews ensures both direct product-nested routing (`/api/v1/products/:productId/reviews`) and review namespace (`/api/v1/reviews/products/:productId/reviews` / `/api/v1/reviews/:productId`) are fully operational.

**Tests Executed:**
- TypeScript Typecheck (`npx tsc --noEmit`) — 0 errors.
- Production Build (`npm run build` -> `tsc && tsc-alias`) — succeeded.
- Integration Verification (`verify_review_module.js`):
  1. Review creation succeeds for purchased & delivered product.
  2. Duplicate review rejected with 409 & REVIEW_ALREADY_EXISTS.
  3. Database unique compound index catches duplicate key error 11000.
  4. Undelivered product (SHIPPED order) review rejected with 400 & REVIEW_NOT_ALLOWED.
  5. Unpurchased product review rejected with 400 & REVIEW_NOT_ALLOWED.
  6. Non-existent product review creation rejected with 404 & PRODUCT_NOT_FOUND.
  7. Zod validation rejects rating < 1, rating > 5, fractional rating, empty comment, comment > 1000 chars, invalid product ID format, and invalid route parameter.
  8. Public getProductReviews returns reviews sorted by newest first with safe buyer fields.
  9. Public getProductReviews returns empty array `[]` when product has no reviews.
  10. Public getProductReviews for non-existent product returns 404 PRODUCT_NOT_FOUND.
  11. Route definitions verified for POST /reviews and GET /products/:productId/reviews.

**Test Results:** All 11 scenarios passed with 100% success.

**Issues:** None.

**Blockers:** None.

**Next Action:** Await user's next instruction.

### Session Template





**Date:** YYYY-MM-DD

**Phase:** Phase XX

**Feature:** Feature Name

**Status:** IN_PROGRESS / REVIEW / TESTING / COMPLETED / BLOCKED

**Completed:**

**Files Created:**

**Files Updated:**

**Files Deleted:**

**Dependencies Added:**

**Architecture Decisions:**

**Tests Executed:**

**Test Results:**

**Issues:**

**Blockers:**

**Next Action:**

### Session Tracking Rules

- Record meaningful implementation progress.
- Mention actual file names.
- Record important technical decisions.
- Record test results accurately.
- Document unresolved issues.
- Do not record planned work as completed work.

## 12. AI Coding Agent Instructions

Every AI coding agent must follow these rules when working on Jus Buy.

### Before Coding

Read the following project documents:

- project-overview.md
- backend-feature-breakdown.md
- architecture-context.md
- backend-code-standards.md
- ai-workflow-rules.md
- progress-tracker.md

Then:

- Inspect the existing source code.
- Identify the current phase and active feature.
- Understand existing architecture and implementation patterns.
- Check Git status and preserve unrelated changes.
- Review related models, controllers, services, routes and utilities.
- Identify unresolved decisions and blockers.
- Prepare a short implementation plan before coding.

### During Implementation

- Implement only the currently requested feature.
- Follow the existing modular architecture.
- Reuse existing shared utilities and middlewares.
- Keep business logic in Service layers.
- Keep Controllers focused on HTTP request/response handling.
- Use TypeScript and Zod.
- Avoid unnecessary any, as any and @ts-ignore.
- Do not introduce unapproved models, features or dependencies.
- Do not break existing functionality.
- Do not silently change architecture decisions.
- Follow database transaction requirements.
- Validate resource ownership.
- Protect sensitive information.
- Handle errors consistently.
- Avoid unnecessary code changes.

### After Implementation

- Run TypeScript checks.
- Run relevant tests.
- Run linting and build checks where available.
- Fix implementation errors.
- Review security and ownership rules.
- Verify database consistency and transaction behavior where relevant.
- Update API documentation where necessary.
- Update relevant context files.
- Update this progress tracker.
- Record completed files and important decisions.
- Clearly report any remaining issue or blocker.

### Important Rules

- Never claim tests passed without executing them.
- Never mark unverified work as COMPLETED.
- Never invent missing business requirements.
- Never automatically start the next phase.
- Wait for the user's next instruction unless the user explicitly authorizes continuing.

## 13. Scope Restrictions

The following features are outside the current project scope:

- Dynamic Banner Management.
- Notification System.
- Vendor Withdrawal/Payout System.

Do not add these features, their APIs, models, utilities or dependencies without explicit approval.

### Additional Restrictions

- Do not introduce unnecessary database models.
- Do not duplicate existing business logic.
- Do not introduce unapproved architectural patterns.
- Do not modify unrelated modules.
- Do not add features simply because they are common in other e-commerce platforms.
- Any scope expansion requires explicit approval.

## 14. Next Development Action

### Next Phase

**Phase 01 — Project Setup & Shared Infrastructure**

**Status:** NOT_STARTED

### Goal

Establish a clean, maintainable, production-oriented Express.js + TypeScript backend foundation for Jus Buy.

### Implementation Rules

- First inspect the existing repository and context files.
- Check existing dependencies and configurations.
- Inspect existing folder structure and shared utilities.
- Identify what is already implemented.
- Do not recreate existing configurations or utilities.
- Identify missing requirements.
- Prepare a short implementation plan.
- Implement only the approved Phase 01 scope.
- Run relevant verification.
- Update documentation and this progress tracker.

### Expected Outcome

- A working Express.js backend.
- Proper TypeScript configuration.
- Modular folder architecture.
- MongoDB connection.
- Centralized error handling.
- Shared response utilities.
- Reusable validation middleware.
- Logging and security infrastructure.
- Reusable shared utilities.
- Successful server startup and production build.

## 15. Final Tracking Rules

These rules apply to the entire progress tracker.

This tracker must always represent the actual implementation state of the Jus Buy backend.

Planned features must never be represented as completed features.

Update phase status whenever implementation state changes.

Keep the detailed phase tracker and overall summary synchronized.

Update database model progress independently.

Record significant architecture decisions.

Record unresolved business and technical questions.

Document blockers accurately.

Keep session notes updated with meaningful implementation progress.

Update relevant documentation when implementation decisions change.

Never mark a feature completed without required verification.

Never automatically proceed to another phase without user authorization.

**Final Rule:** A feature is COMPLETED only after its required implementation, validation, security checks, and relevant tests have been successfully verified.

**End of Jus Buy — Backend Progress Tracker**
