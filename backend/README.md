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

## Admin Seeder CLI

### Purpose
The Jus Buy public registration endpoint (`/api/v1/auth/register`) strictly permits only two public roles:
- `buyer`
- `vendor`

To maintain platform security, Admin accounts **cannot** be created through public registration. The Admin Seeder provides a secure, dedicated CLI command to provision an initial Admin user and its corresponding Admin Profile directly in the database.

### Command
Run the seeder from the `backend/` directory:
```bash
npm run seed:admin
```

### Providing Admin Credentials
The seeder supports three secure methods for supplying admin credentials:

1. **Interactive CLI Prompts (Default & Recommended)**:
   When running `npm run seed:admin` in an interactive terminal, the CLI will securely prompt for:
   - **Name**: Full name (2–100 characters)
   - **Email**: Valid email address
   - **Password**: Secure password (minimum 6 characters, masked in terminal without plain-text echo)
   - **Phone**: Optional contact phone number

2. **CLI Flags**:
   Useful for automated scripts or command-line shortcuts:
   ```bash
   npm run seed:admin -- --name "Platform Admin" --email "admin@example.com" --password "SecureAdminPassword123!" --phone "+1234567890"
   ```

3. **Environment Variables**:
   Optional environment variables can be provided in `.env` or passed inline:
   - `ADMIN_NAME`: Full name of the admin
   - `ADMIN_EMAIL`: Email address of the admin
   - `ADMIN_PASSWORD`: Plain password (will be hashed with bcrypt; never stored or logged)
   - `ADMIN_PHONE`: Optional phone number

### Database Creation Flow & Atomic Transactions
1. Connects to MongoDB using the existing configuration (`db.connectToMongoDB()`).
2. Checks whether an Admin already exists in either the `Admin` or `User` collection.
3. Collects and validates inputs with Zod against existing platform validation constraints.
4. Starts a MongoDB session and transaction.
5. Creates a pre-verified `Verification` record with `isEmailVerified: true` so the admin can log in immediately.
6. Hashes the password using `bcrypt` (with `BCRYPT_SALT_ROUNDS`).
7. Creates the `User` record with role `ADMIN` and status `ACTIVE`.
8. Creates the `Admin` profile record linked to the newly created User's `ObjectId`.
9. Commits the transaction atomically. If any error occurs, the transaction is automatically aborted, leaving no partial or orphaned records.
10. Closes the database connection cleanly.

### Duplicate Prevention
The seeder enforces strict duplicate prevention:
- Prior to creating an account, the seeder checks for existing Admin records in `Admin` and `User` collections.
- If an Admin already exists, the seeder outputs:
  ```bash
  Admin already exists.
  No new Admin account was created.
  ```
  and safely exits with code `0`.
- If the supplied email is already registered to an existing buyer or vendor, the seeder aborts with a descriptive error message and exits with code `1`.

### Common Errors & Troubleshooting
| Scenario | Cause | Resolution |
| :--- | :--- | :--- |
| `Admin already exists.` | An admin account already exists in the database. | No action needed; duplicate admins are prevented by design. |
| `Failed to connect to the database.` | MongoDB connection URI is invalid or database is unreachable. | Check `MONGO_URI` in `.env` and verify network/database connectivity. |
| `Validation failed: - password: Password must be at least 6 characters` | Provided password is shorter than 6 characters. | Provide a password between 6 and 128 characters. |
| `Error: A user with email "..." already exists.` | The email is already registered to another user role. | Choose a unique email address for the admin account. |
| `Transaction aborted.` | MongoDB transaction failed during creation. | Verify MongoDB deployment supports transactions (replica set or Atlas cluster). |

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

