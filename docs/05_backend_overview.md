# 05. Backend Architecture & Core Services

## 1. Architectural Pattern: Modular Monolith

The backend is architected as a **Modular Monolith** organized under `backend/src/modules/v1/`. Each domain module encapsulates its own:
- `*.model.ts`: Mongoose schema, validation constraints, and database indexes.
- `*.interface.ts`: TypeScript contracts and domain models.
- `*.constant.ts`: Enums, error messages, and system constants.
- `*.validation.ts`: Zod request schemas.
- `*.controller.ts`: HTTP request parsing, response formatting, and status mapping.
- `*.service.ts`: Core business logic, transaction handling, and third-party integrations.
- `*.route.ts`: Express router declarations and middleware attachments.

---

## 2. Core Modules Breakdown

```text
backend/src/modules/v1/
├── admin/          # Admin profile and credentials
├── auth/           # Authentication, JWT rotation, Redis store, Email notifications
├── buyer/          # Customer profiles, contact details, shipping addresses
├── cart/           # Shopping cart calculation and stock checks
├── category/       # Product categories, hierarchical taxonomies, banner images
├── dashboard/      # Analytical aggregation pipelines (revenue, sales, orders)
├── earnings/       # Vendor payouts, platform commission calculations
├── order/          # Order pipeline, transaction management, item splitting
├── payment/        # Stripe Checkout sessions, webhooks, cash-on-delivery
├── product/        # Product inventory, size variations, Cloudinary multi-image uploads
├── review/         # Customer product reviews and rating aggregations
├── user/           # Common User model, role guards (ADMIN, VENDOR, BUYER)
├── vendor/         # Vendor onboarding, KYC / NID verification, status review
├── verification/   # 5-digit numeric OTP generation, Redis cooldowns, email validation
└── wishlist/       # Customer bookmarking and saved items
```

---

## 3. Deep Dive: Key Business Logic

### 3.1 Multi-Vendor Order Splitting & Commission Deduction
Located in `backend/src/modules/v1/order/order.service.ts`:
1. **Cart Item Valuation:** For every item in the cart, the service verifies active status (`isActive === true`) and live stock quantity.
2. **Fixed Commission Rate:** A platform commission of 10% (`DEFAULT_COMMISSION_RATE = 0.10`) is computed per item:
   $$\text{itemSubtotal} = \text{unitPrice} \times \text{quantity}$$
   $$\text{commissionAmount} = \text{itemSubtotal} \times 0.10$$
   $$\text{vendorEarning} = \text{itemSubtotal} - \text{commissionAmount}$$
3. **Atomic Stock Decrement:** Stock is deducted inside a MongoDB transaction:
   ```typescript
   await Product.updateOne(
     { _id: item.product, stock: { $gte: item.quantity } },
     { $inc: { stock: -item.quantity, salesCount: item.quantity } },
     { session }
   );
   ```
4. **Order Status Progression:**
   State transitions are strictly validated using `VALID_ORDER_STATUS_TRANSITIONS`:
   `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`.
   (Cancellations are only allowed prior to shipping).

---

### 3.2 Payment Gateway Integrations & Webhook Handlers
Located in `backend/src/modules/v1/payment/payment.service.ts`:
1. **Payment Methods Supported:**
   - `CASH_ON_DELIVERY` (Provider: `MANUAL`): Order created in `PENDING` state with `isPaid: false`.
   - `ONLINE` (Provider: `STRIPE`): Creates a Stripe Checkout Session with line items, tax, and order metadata.
2. **Stripe Webhook Processing (`handleStripeWebhook`):**
   - Receives raw buffer payload and verifies cryptographic signature against `STRIPE_WEBHOOK_SECRET`.
   - Listens to `checkout.session.completed`:
     - Extracts `orderId` from `session.metadata`.
     - Updates `Payment` record to `status: "COMPLETED"`, sets `paidAt: new Date()`, and stores `stripePaymentIntentId`.
     - Updates `Order` record to `isPaid: true, status: "CONFIRMED"`.
     - Emits transactional payment confirmation email to buyer.
   - Listens to `checkout.session.expired` or payment failure:
     - Marks `Payment` as `FAILED`.
     - Automatically restores product stock inventory atomically.

---

### 3.3 Email & OTP Verification Flow
Located in `backend/src/modules/v1/auth/email/email.service.ts` and `backend/src/modules/v1/verification/verification.service.ts`:
1. **OTP Generation:** 5-digit numeric code (`OTP_LENGTH = 5`), expires in 5 minutes (`OTP_EXPIRES_IN = 300`).
2. **Dual Store Model:**
   - Stored in MongoDB `Verification` collection (hashed with SHA-256).
   - Stored in Redis with automatic TTL and rate-limited resend cooldown (60 seconds).
3. **Email Delivery:** HTML formatted emails rendered via EJS templates (`verification-email.ejs`, `welcome-email.ejs`, `reset-password-email.ejs`).

---

## 4. Background Processes & Queueing Status

- **Current Implementation:** There is currently **no external task runner (such as BullMQ, Celery, or Temporal)**.
- **Asynchronous Operations:**
  - Email sending is executed asynchronously via un-awaited promises (`emailService.sendVerificationEmail(...).catch(...)`).
  - Cloudinary image deletions on failed updates run as asynchronous detached promises.
- **Risks for v2:** Heavy traffic or SMTP rate limits can drop outgoing emails without a durable retry queue.
