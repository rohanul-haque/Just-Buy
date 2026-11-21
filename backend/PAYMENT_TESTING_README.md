# Jus Buy — Payment & Order API Testing Guide

This guide provides end-to-end instructions, sample demo payloads, cURL commands, and explanations for testing the **Order & Payment Module** (supporting **Cash on Delivery** and **Stripe Online Payment**).

---

## 1. Overview of Payment Architecture

The Jus Buy platform supports two payment methods:

| Payment Method | Provider | Initial Payment Status | Initial Order Status | Stock Behavior | Cart Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cash on Delivery (`COD`)** *(Default)* | `COD` | `UNPAID` | `PENDING` | Stock deducted immediately | Cart cleared immediately |
| **Stripe Online (`ONLINE`)** | `STRIPE` | `PENDING` | `PENDING` | Stock reserved immediately | Cart kept until webhook confirms payment |

### Key Security & Consistency Rules:
1. **Separation of Concerns**: `OrderStatus` (`PENDING`, `CANCELLED`) is completely decoupled from `PaymentStatus` (`UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED`).
2. **Never Trust Client Financials**: Prices, subtotals, commissions (15%), shipping charges (50 BDT/USD), and total amounts are strictly calculated on the backend.
3. **Webhook as Source of Truth**: Frontend redirects to the success URL do **not** mark an order as paid. Payment is confirmed **only** after receiving and verifying a cryptographically signed Stripe webhook event (`checkout.session.completed`).
4. **Automatic Stock Rollback**: If an online checkout session expires or payment fails, reserved stock is restored and the order is marked `CANCELLED`.

---

## 2. Environment Variables & Stripe Setup

Ensure your `.env` contains the required Stripe test keys:

```env
# Server
PORT=8080
NODE_ENV=development

# Frontend URLs
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

> [!TIP]
> You can obtain test keys (`sk_test_...`) from your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). For testing without real keys, placeholder keys allow validation and schema checks to pass, while real Stripe API keys allow full end-to-end checkout.

---

## 3. Stripe Test Cards

When redirected to the Stripe Checkout page, use Stripe's official test credentials:

| Field | Demo / Test Value |
| :--- | :--- |
| **Card Number** | `4242 4242 4242 4242` |
| **Expiration Date** | Any future date (e.g. `12/32`) |
| **CVC** | Any 3 digits (e.g. `123`) |
| **ZIP / Postal Code** | Any 5 digits (e.g. `90210` or `1205`) |

---

## 4. Step-by-Step API Testing Flow

Base URL: `http://localhost:8080/api/v1`

---

### Step 1: Login as Buyer to Obtain Access Token

All cart, order, and buyer payment APIs require an authenticated user with the `BUYER` role.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "Password123!"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Buyer login successful",
  "data": {
    "user": {
      "id": "672ba1d8e192a001a1e00001",
      "email": "buyer@example.com",
      "role": "BUYER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

> [!NOTE]
> Save the `accessToken`. Include it as `Authorization: Bearer <accessToken>` in all subsequent requests.

---

### Step 2: Add Product to Cart

Before creating an order, items must exist in your shopping cart.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "productId": "672ba1d8e192a001a1e00010",
    "quantity": 2,
    "size": "M"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "672ba1d8e192a001a1e00020",
    "buyer": "672ba1d8e192a001a1e00001",
    "productItems": [
      {
        "_id": "672ba1d8e192a001a1e00030",
        "product": {
          "_id": "672ba1d8e192a001a1e00010",
          "name": "Classic Cotton T-Shirt",
          "price": 25,
          "stock": 100,
          "sizes": ["S", "M", "L", "XL"]
        },
        "quantity": 2,
        "size": "M"
      }
    ]
  }
}
```

---

### Step 3: Test Scenario A — Cash on Delivery (COD) Order

When `orderType` is omitted or explicitly set to `"COD"`, the order uses the Cash on Delivery workflow.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "orderType": "COD",
    "shippingAddress": {
      "fullName": "Jane Doe",
      "phoneNumber": "+8801712345678",
      "address": "House 12, Road 5, Block B",
      "city": "Dhaka",
      "postalCode": "1212",
      "country": "Bangladesh"
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "_id": "672ba1d8e192a001a1e00050",
      "transactionNumber": "TXN-20261106-A1B2C3",
      "buyer": "672ba1d8e192a001a1e00001",
      "orderType": "COD",
      "status": "PENDING",
      "subtotal": 50,
      "shippingCharge": 50,
      "totalAmount": 100,
      "productItems": [
        {
          "product": "672ba1d8e192a001a1e00010",
          "name": "Classic Cotton T-Shirt",
          "unitPrice": 25,
          "quantity": 2,
          "size": "M",
          "itemSubtotal": 50,
          "commissionRate": 15,
          "adminCommission": 7.5,
          "vendorEarning": 42.5,
          "status": "PENDING"
        }
      ],
      "shippingAddress": {
        "fullName": "Jane Doe",
        "phoneNumber": "+8801712345678",
        "address": "House 12, Road 5, Block B",
        "city": "Dhaka",
        "postalCode": "1212",
        "country": "Bangladesh"
      }
    },
    "payment": {
      "_id": "672ba1d8e192a001a1e00060",
      "order": "672ba1d8e192a001a1e00050",
      "buyer": "672ba1d8e192a001a1e00001",
      "paymentMethod": "COD",
      "provider": "COD",
      "amount": 100,
      "currency": "usd",
      "status": "UNPAID"
    }
  }
}
```

**Backend Actions Executed:**
1. Order created with `status: "PENDING"`.
2. Payment record created with `status: "UNPAID"`, `provider: "COD"`.
3. Product inventory decremented from `100` to `98`.
4. Buyer's cart emptied automatically.

---

### Step 4: Test Scenario B — Stripe Online Payment (`ONLINE`)

Add items to the cart again, then create an order with `"orderType": "ONLINE"`.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "orderType": "ONLINE",
    "shippingAddress": {
      "fullName": "Jane Doe",
      "phoneNumber": "+8801712345678",
      "address": "House 12, Road 5, Block B",
      "city": "Dhaka",
      "postalCode": "1212",
      "country": "Bangladesh"
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "_id": "672ba1d8e192a001a1e00070",
      "transactionNumber": "TXN-20261106-D4E5F6",
      "buyer": "672ba1d8e192a001a1e00001",
      "orderType": "ONLINE",
      "status": "PENDING",
      "subtotal": 50,
      "shippingCharge": 50,
      "totalAmount": 100
    },
    "payment": {
      "_id": "672ba1d8e192a001a1e00080",
      "order": "672ba1d8e192a001a1e00070",
      "paymentMethod": "ONLINE",
      "provider": "STRIPE",
      "amount": 100,
      "currency": "usd",
      "status": "PENDING"
    },
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6...",
    "sessionId": "cs_test_a1b2c3d4e5f6..."
  }
}
```

**Backend Actions Executed:**
1. Order created with `status: "PENDING"`.
2. Payment record created with `status: "PENDING"`, `provider: "STRIPE"`.
3. Stock temporarily reserved (decremented atomically).
4. Buyer's cart is **preserved** (not deleted until payment succeeds).
5. Stripe Checkout Session created with server-calculated order total.
6. `checkoutUrl` returned to redirect the buyer.

---

### Step 5: Complete Payment on Stripe Checkout

1. Copy the `checkoutUrl` from the response in Step 4.
2. Open it in a web browser.
3. Enter test card details (`4242 4242 4242 4242`, any future date, CVC `123`).
4. Click **Pay**.
5. Stripe redirects to `http://localhost:3000/payment/success?session_id=cs_test_...&order_id=...`.

---

### Step 6: Testing the Stripe Webhook Locally

Because local servers cannot receive internet webhooks directly, use the official **Stripe CLI** to forward events to your running backend:

#### Install Stripe CLI
- **Windows (Scoop)**: `scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git && scoop install stripe`
- **Windows (Direct Download)**: [Download stripe_windows_x86_64.zip](https://github.com/stripe/stripe-cli/releases)
- **macOS (Homebrew)**: `brew install stripe/stripe-cli/stripe`

#### Start Webhook Forwarding
```bash
# 1. Login to Stripe
stripe login

# 2. Forward webhooks to local server endpoint
stripe listen --forward-to localhost:8080/api/v1/payments/stripe/webhook
```

The CLI will output your local webhook secret:
```text
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

Add this secret to your `.env` as `STRIPE_WEBHOOK_SECRET`:
```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

#### Triggering Webhook Events Manually
You can test webhook handling without making actual payments:

```bash
# Simulate successful checkout completion
stripe trigger checkout.session.completed

# Simulate expired checkout session
stripe trigger checkout.session.expired
```

**What the Webhook Handler Does Upon `checkout.session.completed`:**
1. Validates the `stripe-signature` header using raw body bytes.
2. Idempotency check: ensures the payment has not already been marked `PAID`.
3. Updates `payment.status` to `"PAID"`.
4. Records `paidAt` timestamp and `stripePaymentIntentId`.
5. Keeps `order.status` as `"PENDING"` (awaiting vendor fulfillment).
6. Clears the buyer's cart.

---

### Step 7: Retrieve Order & Payment Details

**Get My Orders:**
```bash
curl -X GET "http://localhost:8080/api/v1/orders/my-orders?page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Get Specific Order Details (Includes Payment Details):**
```bash
curl -X GET http://localhost:8080/api/v1/orders/672ba1d8e192a001a1e00070 \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Get Payment Record for Order:**
```bash
curl -X GET http://localhost:8080/api/v1/payments/order/672ba1d8e192a001a1e00070 \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment completed successfully",
  "data": {
    "_id": "672ba1d8e192a001a1e00080",
    "order": "672ba1d8e192a001a1e00070",
    "buyer": "672ba1d8e192a001a1e00001",
    "paymentMethod": "ONLINE",
    "provider": "STRIPE",
    "amount": 100,
    "currency": "usd",
    "status": "PAID",
    "stripeSessionId": "cs_test_a1b2c3d4e5f6...",
    "stripePaymentIntentId": "pi_test_1a2b3c4d5e...",
    "paidAt": "2026-11-06T20:30:00.000Z"
  }
}
```

---

### Step 7B: Frontend Payment Success Page Verification

When the buyer completes payment, Stripe redirects to:
`http://localhost:3000/payment/success?session_id=cs_test_a1b2c3d4e5f6...&order_id=672ba1d8e192a001a1e00070`

The frontend must **not** assume the database is already updated based solely on the URL redirect. Instead, call the backend verification endpoint:

**Request (Path Parameter):**

```bash
curl -X GET http://localhost:8080/api/v1/payments/verify-session/cs_test_a1b2c3d4e5f6... \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Alternative Request (Query Parameter):**

```bash
curl -X GET "http://localhost:8080/api/v1/payments/verify-session?session_id=cs_test_a1b2c3d4e5f6..." \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Expected Response (200 OK — Confirmed):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment completed successfully",
  "data": {
    "status": "PAID",
    "payment": {
      "_id": "672ba1d8e192a001a1e00080",
      "order": "672ba1d8e192a001a1e00070",
      "buyer": "672ba1d8e192a001a1e00001",
      "paymentMethod": "ONLINE",
      "provider": "STRIPE",
      "amount": 100,
      "currency": "usd",
      "status": "PAID",
      "stripeSessionId": "cs_test_a1b2c3d4e5f6...",
      "stripePaymentIntentId": "pi_test_1a2b3c4d5e...",
      "paidAt": "2026-11-06T20:30:00.000Z"
    },
    "order": {
      "_id": "672ba1d8e192a001a1e00070",
      "transactionNumber": "TXN-20261106-D4E5F6",
      "status": "PENDING"
    }
  }
}
```

**If Webhook Processing Is Still Pending:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment is pending",
  "data": {
    "status": "PENDING",
    "payment": { ... }
  }
}
```
*(The frontend shows a loading spinner and polls or waits for completion).*

---

### Step 8: Cancel Order & Verify Stock Rollback

Eligible orders (status `PENDING` and payment `UNPAID` or `PENDING`) can be cancelled by their owner.

**Request:**
```bash
curl -X PATCH http://localhost:8080/api/v1/orders/672ba1d8e192a001a1e00050/cancel \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "672ba1d8e192a001a1e00050",
    "status": "CANCELLED",
    "productItems": [
      {
        "product": "672ba1d8e192a001a1e00010",
        "quantity": 2,
        "status": "CANCELLED"
      }
    ]
  }
}
```

**Cancellation Rules Enforced:**
1. If the order was already paid (`payment.status === "PAID"`), cancellation is rejected with `400 Bad Request` ("Paid orders cannot be cancelled directly. Please contact support.").
2. If already cancelled, rejected with `400 Bad Request` ("Order is already cancelled").
3. For unpaid or pending orders, reserved product stock is restored atomically via `$inc: { stock: item.quantity }`.
4. If an active Stripe Checkout Session was open, it is expired via the Stripe API to prevent any late charges.

---

## 5. Summary of Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/orders` | Buyer | Place order (`COD` or `ONLINE` via Stripe) |
| **GET** | `/api/v1/orders/my-orders` | Buyer | Get buyer's orders with pagination & status filters |
| **GET** | `/api/v1/orders/:orderId` | Buyer | Get detailed order snapshot & payment summary |
| **PATCH** | `/api/v1/orders/:orderId/cancel` | Buyer | Cancel eligible pending order & restore stock |
| **POST** | `/api/v1/payments/stripe/webhook` | Public (Stripe) | Handle signed Stripe webhook events |
| **GET** | `/api/v1/payments/verify-session/:sessionId` | Buyer | Verify Stripe session status & reconcile payment |
| **GET** | `/api/v1/payments/verify-session` | Buyer | Verify session via `?session_id=...` query param |
| **GET** | `/api/v1/payments/order/:orderId` | Buyer | Retrieve payment record for an order |
| **PATCH** | `/api/v1/payments/cod/confirm/:orderId` | Vendor, Admin | Confirm cash collection for delivered COD order |
| **PATCH** | `/api/v1/orders/:orderId/confirm-cod-payment` | Vendor, Admin | Confirm cash collection for delivered COD order |
