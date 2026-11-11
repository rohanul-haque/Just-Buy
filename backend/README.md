# Jus Buy — Backend API

Multi-Vendor E-Commerce Backend built with Node.js, Express.js, TypeScript, MongoDB, Mongoose, and Stripe.

---

## Documentation Quick Links

- [Payment & Order API Testing Guide (COD & Stripe)](./PAYMENT_TESTING_README.md)
- [Project Architecture Context](./context/project-architecture.md)
- [Development Progress Tracker](./context/progress-tracker.md)
- [Code Standards & Conventions](./context/code-standards.md)

---

## Features

- **Authentication & Authorization**: JWT Access & Refresh tokens, Role-Based Access Control (`BUYER`, `VENDOR`, `ADMIN`).
- **Product Management**: Multi-vendor products with image uploads, categories, and inventory management.
- **Shopping Cart**: Single cart per buyer, automatic duplicate merging by size, strict stock verification.
- **Order Management**: Multi-vendor orders, historical product and commission snapshots, server-side calculations.
- **Payment Processing**:
  - **Cash on Delivery (COD)**: Instant order creation, stock deduction, and payment record tracking.
  - **Stripe Online Payment**: Secure Stripe Checkout sessions, stock reservation, and cryptographically verified webhook processing.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Testing Payment APIs

For a full step-by-step walkthrough of testing Cash on Delivery (COD) and Stripe Online Payment flows with sample payloads and cURL commands, see:

👉 **[PAYMENT_TESTING_README.md](./PAYMENT_TESTING_README.md)**

---

## Troubleshooting & Common Errors

### Stripe API Error: `Invalid Stripe API version: 2020-08-27;vipps_preview=v1`

#### Error Output:
```json
{
  "error": {
    "message": "Invalid Stripe API version: 2020-08-27;vipps_preview=v1. You do not have permission to pass this beta header: vipps_preview. If you have any questions, we can help at https://support.stripe.com/.",
    "type": "invalid_request_error"
  }
}
```

#### Why did this happen?
1. **Outdated Postman Collection or Request Header**:
   - When importing older Stripe Postman collections (or creating cURL / API client requests based on vintage guides from ~2020–2021), a `Stripe-Version: 2020-08-27;vipps_preview=v1` header was automatically attached to requests or parent collections.
   - `vipps_preview=v1` was an experimental private beta header specifically for the Norwegian Vipps payment method on the legacy `2020-08-27` Stripe API version.
   - Unless a Stripe merchant account was explicitly whitelisted by Stripe Support for this private beta, any request passing this header is immediately rejected by Stripe with HTTP 400.
2. **Stripe Dashboard Legacy Default**:
   - Older test accounts may have had an obsolete preview version configured under **Stripe Dashboard > Developers > API version**.

#### How is this fixed?
1. **In Backend Code (`src/lib/stripe.ts`)**:
   - The backend Stripe client explicitly pins `apiVersion: "2026-10-28.endive"` and enables `typescript: true`. This guarantees that all SDK calls send a modern, officially supported, and clean Stripe API version header on every request.
2. **In Postman / Thunder Client / Insomnia**:
   - Go to the **Headers** tab of your request (or the collection/folder settings).
   - Look for the `Stripe-Version` header.
   - **Uncheck** or **delete** `Stripe-Version: 2020-08-27;vipps_preview=v1`.
3. **In Stripe Dashboard**:
   - Check [Stripe Dashboard > Developers > API version](https://dashboard.stripe.com/test/developers) to ensure your account is set to a stable general-availability version.

For a full testing walkthrough and troubleshooting guide, refer to [PAYMENT_TESTING_README.md](./PAYMENT_TESTING_README.md#6-troubleshooting--common-stripe-errors).

