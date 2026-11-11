# Backend Code Standards — Jus Buy

**Project:** Jus Buy — Multi-Vendor E-commerce Platform  
**Document:** Backend Code Standards  
**Applies To:** All backend developers and AI coding agents  
**API Version:** `/api/v1`

## 1. Purpose and Authority

This document defines the mandatory coding standards, implementation rules, and development practices for the Jus Buy backend.

Every backend implementation must follow these documents:

- `project-overview.md` — Defines the product, business goals, features, and scope.
- `project-architecture.md` — Defines the backend architecture, module boundaries, and system design.
- `backend-feature-breakdown.md` — Defines the functional requirements, models, APIs, and development phases.
- `code-standards.md` — Defines coding conventions and implementation standards.
- `progress-tracker.md` — Tracks implementation progress and outstanding work.

If requirements appear inconsistent:

- Do not silently change established business rules.
- Do not invent missing requirements.
- Identify the conflicting requirements.
- Explain the technical impact.
- Ask for approval before making architectural or business-rule changes.

The feature requirements define what to build, the architecture document defines how the system is structured, and this document defines how the code must be written.

## 2. General Coding Principles

All backend code must follow these principles:

- Follow Modular Architecture throughout the backend.
- Keep modules focused and single-purpose.
- Follow Separation of Concerns.
- Keep business logic inside the Service Layer.
- Fix root causes instead of introducing temporary workarounds.
- Avoid unnecessary abstractions, dependencies, models, and utilities.
- Reuse existing shared infrastructure.
- Avoid duplicated business logic.
- Prefer readable, predictable, maintainable code.
- Follow the established project architecture.
- Do not change business rules without explicit approval.
- Do not modify unrelated modules while implementing a feature.
- Consider security, performance, and maintainability during implementation.
- Write production-oriented code rather than code that only makes an endpoint work.

## 3. Technology Standards

The backend must use the following technologies:

| Responsibility  | Technology                       |
| --------------- | -------------------------------- |
| Runtime         | Node.js                          |
| Framework       | Express.js                       |
| Language        | TypeScript                       |
| Database        | MongoDB                          |
| ODM             | Mongoose                         |
| Validation      | Zod                              |
| Authentication  | JWT Access Token + Refresh Token |
| File Storage    | Cloudinary                       |
| File Upload     | Multer                           |
| Payment Gateway | Stripe + Cash on Delivery        |
| Logging         | Winston                          |
| API Prefix      | `/api/v1`                        |

**Rules:**

- Use the technologies already established in the project.
- Do not introduce another library for an existing responsibility without reviewing the current implementation.
- Do not install unnecessary dependencies.
- Inspect the existing `package.json` before adding packages.
- Follow the installed framework and library versions.
- Do not assume an API is supported by the installed version without checking its documentation when necessary.

## 4. Modular Architecture

Every business feature must have its own module.

### 4.1 Standard Module Structure

Each applicable feature module should follow this structure:

```text
modules/
└── v1/
    ├── user/
    │   ├── user.model.ts
    │   ├── user.interface.ts
    │   ├── user.validation.ts
    │   ├── user.service.ts
    │   ├── user.controller.ts
    │   └── user.route.ts
    │
    ├── auth/
    │   ├── auth.validation.ts
    │   ├── auth.service.ts
    │   ├── auth.controller.ts
    │   └── auth.route.ts
    │
    ├── product/
    │   ├── product.model.ts
    │   ├── product.interface.ts
    │   ├── product.validation.ts
    │   ├── product.service.ts
    │   ├── product.controller.ts
    │   └── product.route.ts
    │
    └── order/
        ├── order.model.ts
        ├── order.interface.ts
        ├── order.validation.ts
        ├── order.service.ts
        ├── order.controller.ts
        └── order.route.ts
```

Not every module requires all six files. For example, a module without its own database model does not need an artificial model file.

Do not create empty files merely to make every module look identical.

### 4.2 Layer Responsibilities

#### Model

**Responsibilities:**

- Define Mongoose schemas and models.
- Define field types and enums.
- Define defaults and schema-level constraints.
- Define references and embedded schemas.
- Define indexes.
- Configure timestamps where required.

**Restrictions:**

- Do not put business workflows inside models.
- Do not implement controller or HTTP response logic in models.
- Do not duplicate service-level business rules unnecessarily.

#### Interface

**Responsibilities:**

- Define TypeScript object contracts.
- Define model-related types where necessary.
- Define service input and output types.
- Define request and response types when useful.
- Define reusable domain-specific types.

**Rules:**

- Use interfaces for object contracts.
- Use types for unions, intersections, and suitable type compositions.
- Avoid unnecessary duplicate interfaces.
- Do not use an interface simply to rename an existing type without adding value.

#### Validation

**Responsibilities:**

- Define Zod schemas.
- Validate request bodies.
- Validate query parameters.
- Validate route parameters.
- Infer TypeScript types from Zod schemas where appropriate.

**Restrictions:**

- Do not manually repeat request validation in controllers.
- Do not use frontend data without validation.
- Do not confuse request validation with Mongoose schema validation.

#### Service

The Service Layer owns business logic.

**Responsibilities:**

- Execute database operations.
- Apply business rules.
- Verify ownership and permissions where required.
- Coordinate operations across modules.
- Perform calculations.
- Handle state transitions.
- Enforce stock and financial consistency.
- Return appropriate service results.

**Rules:**

- Keep services independent of Express request and response objects.
- Do not implement HTTP response formatting inside services.
- Do not duplicate business logic across services.
- Use public service methods when communication with another module is necessary.
- Avoid circular dependencies.

#### Controller

**Responsibilities:**

- Extract validated request data.
- Read authenticated user information.
- Call the appropriate service method.
- Set the appropriate HTTP status.
- Return standardized API responses.

**Restrictions:**

- Do not implement database business logic.
- Do not perform financial calculations.
- Do not implement ownership rules independently of the service layer.
- Do not manually repeat Zod validation.
- Do not return uncontrolled database documents.
- Controllers should remain small and focused.

#### Route

**Responsibilities:**

- Define HTTP methods and endpoints.
- Apply authentication middleware.
- Apply role authorization.
- Apply vendor approval middleware where necessary.
- Apply request validation middleware.
- Connect routes to controllers.

**Example:**

```typescript
router.post(
  "/",
  authenticate,
  authorize("VENDOR"),
  requireApprovedVendor,
  validateRequest(createProductSchema),
  ProductController.createProduct,
);
```

Keep route definitions readable and avoid unnecessary route-level business logic.

### 4.3 Shared Infrastructure

Shared functionality must be implemented once and reused.

**Examples:**

- Authentication middleware
- Authorization middleware
- Error handling
- API response formatting
- Pagination
- Currency calculations
- Password hashing
- JWT utilities
- OTP utilities
- Email sending
- Cloudinary operations
- Environment configuration

Do not create duplicate utilities inside individual feature modules.

## 5. TypeScript Standards

TypeScript strict mode is mandatory.

**Rules:**

- Enable `strict: true` in TypeScript configuration.
- Avoid `any`.
- Never use `as any` to bypass TypeScript errors.
- Never use `@ts-ignore` to hide implementation problems.
- Use explicit types for function parameters and return values when beneficial.
- Handle null and undefined explicitly.
- Use appropriate Mongoose document and model types.
- Keep authenticated request information properly typed.
- Avoid unnecessary type assertions.
- Avoid unsafe type conversions.
- Never treat unvalidated request data as trusted application data.

**Bad Practice:**

```typescript
const createProduct = async (data: any) => {
  // Business logic
};
```

**Good Practice:**

```typescript
interface ICreateProduct {
  name: string;
  price: number;
  stock: number;
  category: string;
}

const createProduct = async (data: ICreateProduct) => {
  // Business logic
};
```

Use inferred Zod types when the request contract is defined by a Zod schema.

Do not use TypeScript assertions as a substitute for proper runtime validation.

## 6. Naming Conventions

Use consistent naming throughout the project.

| Item            | Convention               | Example                 |
| --------------- | ------------------------ | ----------------------- |
| Module folder   | lowercase                | `product/`              |
| Model file      | singular                 | `product.model.ts`      |
| Interface file  | singular                 | `product.interface.ts`  |
| Validation file | singular                 | `product.validation.ts` |
| Service file    | singular                 | `product.service.ts`    |
| Controller file | singular                 | `product.controller.ts` |
| Route file      | singular                 | `product.route.ts`      |
| Interface       | PascalCase with I prefix | `IProduct`              |
| Function        | camelCase                | `createProduct`         |
| Variable        | camelCase                | `productData`           |
| Enum value      | UPPER_SNAKE_CASE         | `APPROVED`              |
| Constant        | UPPER_SNAKE_CASE         | `ERROR_CODES`           |
| Class           | PascalCase               | `AppError`              |

**Additional rules:**

- Use descriptive names.
- Avoid unclear abbreviations.
- Keep naming consistent across modules.
- Use names that communicate responsibility.

## 7. Request Validation Standards

Zod is mandatory for external request validation.

**Validate:**

- Request body
- Query parameters
- Route parameters

**Rules:**

- Validate requests before executing business logic.
- Use appropriate Zod schemas for each operation.
- Reject invalid values with meaningful errors.
- Use a shared `validateRequest` middleware.
- Use parsed and validated data inside controllers and services.
- Avoid duplicating validation rules.
- Do not trust frontend-provided values.
- Validate pagination, sorting, identifiers, enums, and numeric values.

**Example:**

```typescript
const createProductSchema = z.object({
  name: z.string().trim().min(3),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});
```

The validation middleware must pass parsed data forward rather than allowing the controller to rely on the original unvalidated input.

Request validation and database-level constraints serve different purposes. Both should be used where appropriate.

## 8. Authentication Standards

Jus Buy must use:

- One Common User Model.
- One Common Authentication System.
- One role-based authorization system.

**Supported roles:**

```typescript
type UserRole = "BUYER" | "VENDOR" | "ADMIN";
```

**Authentication Rules:**

- BUYER, VENDOR, and ADMIN use the same login system.
- Public registration accepts only BUYER and VENDOR.
- ADMIN must never be created through public registration.
- Email verification is mandatory before login.
- Unverified users must not receive Access or Refresh Tokens.
- BLOCKED users must not receive authentication access.
- Passwords must always be hashed before database storage.
- Never expose password hashes in API responses.
- Use secure cookie configuration for authentication tokens.
- Never expose authentication secrets in logs.

**Prohibited APIs**

Do not create:

- `GET /auth/me`
- `GET /auth/current-user`

Use separate profile APIs:

- `GET /buyer/profile`
- `GET /vendor/profile`
- `GET /admin/profile`

**Registration Flow:**

1. Validate registration data.
2. Check whether the email already exists.
3. Hash the password.
4. Create the User account with `emailVerified: false`.
5. Generate an OTP.
6. Hash the OTP.
7. Save the verification information.
8. Send the OTP through email.
9. Verify the OTP.
10. Mark the email as verified.
11. Allow the user to log in.
12. Issue authentication tokens after successful login.

Do not issue authentication tokens during registration or before successful email verification.

**Important Vendor Rule**

Vendor shop approval must not block common authentication or ordinary dashboard access.

Selling permission must be checked separately through `requireApprovedVendor`.

## 9. Password and OTP Security

### Password Rules

- Never store plaintext passwords.
- Use a secure password hashing algorithm.
- Verify passwords using the corresponding secure comparison method.
- Never return passwords in API responses.
- Revoke applicable existing sessions after password reset or other required security events.

### OTP Rules

- Never store plaintext OTP values.
- Store only hashed OTP values.
- Validate expiration inside the service layer.
- Enforce failed-attempt limits.
- Enforce OTP resend rate limits.
- Invalidate previous active OTPs when issuing a replacement.
- Prevent successful OTPs from being reused.
- Keep email verification and password reset purposes separate.

### Verification Model

Use the existing Verification model for:

```typescript
type VerificationPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";
```

Do not introduce unnecessary verification collections or models.

## 10. JWT and Session Management

### Token Lifetime

| Token         | Default Lifetime | Responsibility            |
| ------------- | ---------------- | ------------------------- |
| Access Token  | 1 hour           | Protected API access      |
| Refresh Token | 30 days          | Obtain a new Access Token |

Token lifetimes must be configurable through environment variables.

### Token Payload

```typescript
interface ITokenPayload {
  userId: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
}
```

Never include:

- Password
- OTP
- NID information
- Sensitive personal information
- Private verification documents

### Refresh Token Rules

- Never store raw Refresh Tokens in the database.
- Hash Refresh Tokens when server-side session storage is enabled.
- Validate token expiration and revocation.
- Verify the associated user's account status and email verification.
- Implement rotation when using a rotation strategy.
- Revoke sessions during logout and applicable security events.
- Prevent revoked sessions from obtaining new Access Tokens.

### Cookie Security

Use:

- HttpOnly
- Secure in production
- Appropriate SameSite configuration
- Correct cookie expiration
- An appropriate CSRF protection strategy

Access Token storage must remain consistent with the approved frontend security architecture.

Do not independently change the token storage strategy or cookie policy without reviewing the frontend and backend architecture together.

## 11. Authentication and Authorization Middleware

Use reusable middleware for access control.

### authenticate

**Responsibilities:**

- Read the Access Token from the configured source.
- Verify JWT signature and expiration.
- Extract the user ID and role.
- Retrieve the current user from the database.
- Verify the current account status.
- Verify email verification.
- Attach properly typed authenticated user information to the request.
- Reject unauthorized, blocked, or unverified users.

Do not rely only on the role stored in the JWT. Current account information must be checked against the database.

### authorize

**Responsibilities:**

- Verify that the authenticated user's role is permitted.
- Reject unauthorized roles.
- Work with the typed authenticated request.

**Examples:**

```typescript
authorize("ADMIN");
authorize("BUYER");
authorize("VENDOR");
```

### requireApprovedVendor

**Responsibilities:**

- Verify the authenticated user is a VENDOR.
- Retrieve the associated VendorProfile.
- Verify that the shop status is APPROVED.
- Reject selling-related operations for other statuses.

### Ownership Authorization

Always verify resource ownership.

**Examples:**

- Buyers can manage only their own Cart and Wishlist.
- Buyers can access only their own Orders and Payments.
- Vendors can manage only their own Products.
- Vendors can access only their own Order Items.
- Admins can manage platform resources according to the defined permissions.

Never trust a user ID, vendor ID, buyer ID, or ownership reference supplied by the frontend without verification.

## 12. User and Profile Standards

### Common User Model

The User model manages:

- Name
- Email
- Password
- Role
- Email verification status
- Account status
- Timestamps

### Profile Separation

- Buyer personal information belongs in Profile.
- Vendor shop information belongs in VendorProfile.
- Admin does not need a separate profile model in the current scope.

**Rules:**

- Do not duplicate User name or email unnecessarily.
- Do not duplicate information already managed by another model without a clear requirement.
- Use unique references where specified.
- Users can view and update their own profiles.
- Admins can view authorized Buyer and Vendor details.
- Vendor identifiers in APIs must use the Common User Model's User ID as vendorId.
- Never expose password hashes, OTP hashes, or Refresh Token data.

## 13. Vendor Verification Standards

Vendor email verification and shop verification are separate processes.

**Vendor Status:**

```typescript
type VendorStatus =
  "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
```

**Rules:**

- A verified and active Vendor can access the dashboard.
- Vendor shop management must follow the defined status restrictions.
- Only APPROVED vendors can perform selling operations.
- Only ADMIN can approve, reject, or suspend vendor shops.
- Rejection must save a meaningful rejection reason.
- Review information must record the reviewing Admin and review time where applicable.
- Suspending a shop must stop selling access.
- Blocking a User and suspending a Vendor Shop are separate operations.
- NID documents must remain private and accessible only to authorized Admin users.
- Never combine email verification and shop approval into one status.
- Vendor dashboard access and selling permissions must remain separate concerns.

## 14. Mongoose and Database Standards

Define database structures through Mongoose schemas.

**Rules:**

- Use appropriate field types.
- Define references and embedded schemas explicitly.
- Use defaults and schema-level validation where appropriate.
- Use `timestamps: true` where created and updated timestamps are required.
- Use unique indexes for fields that must be unique.
- Use compound indexes according to query patterns.
- Use TTL indexes for expiring records where appropriate.
- Use projections to exclude sensitive fields.
- Populate only the data required by the response.
- Avoid unnecessary database queries.
- Handle duplicate key errors consistently.
- Do not return complete database documents when a controlled response object is more appropriate.

### Current Model Scope

Use only the models defined in the current requirements:

- User
- Verification
- RefreshToken — if server-side session storage is used
- Profile
- VendorProfile
- Category
- Product
- Wishlist
- Cart
- Order
- Payment
- Review

Do not introduce these models without explicit approval:

- Buyer
- Vendor
- Admin
- Commission
- Banner
- Notification
- OrderItem
- Payout
- Checkout

Order Items must remain embedded inside the Order document.

Do not create a new model merely to simplify a single query or service function.

MongoDB TTL deletion is asynchronous. Always perform explicit expiration checks in services.

Database uniqueness does not replace business-rule validation. Validate business requirements in the service layer and enforce database constraints where appropriate.

## 15. Product Management Standards

### Product Rules

- Only approved vendors can create and perform selling-related product operations.
- Vendors can manage only their own products.
- Admins can manage platform products.
- Product main image is required during creation.
- Product category must reference an existing category.
- New products cannot use inactive categories.
- Validate price and stock on the backend.
- Validate product size variants.
- Prevent duplicate sizes inside the same variants array.
- Keep total product stock consistent with variant stock.
- Upload product images through Cloudinary.
- Do not trust frontend-provided sales count, ownership, or privileged product status.

### Product Size Enum

```typescript
type ProductSize = "S" | "M" | "L" | "XL" | "XXL";
```

### Vendor Reference Consistency

The current architecture defines Product vendor ownership through VendorProfile, while public and administrative API identifiers use the Common User Model's User ID.

Therefore:

- Treat vendorId in API requests as a User ID.
- Resolve the corresponding VendorProfile before querying or modifying vendor-owned products.
- Do not mix User IDs and VendorProfile IDs.
- Keep the reference strategy consistent across Product, Order, and Vendor services.
- Do not silently change the established Product schema.

### Listing Standards

Support:

- `page`
- `limit`
- `search`
- `category`
- `sort`

Default product listing:

- 15 products per page.
- Newest sorting when applicable.
- Search filtering.
- Category filtering.
- Proper pagination metadata.

Validate pagination and sorting values before using them in database queries.

## 16. Wishlist and Cart Standards

### Wishlist

- Available only to authenticated BUYER users.
- One Wishlist per Buyer.
- Prevent duplicate products.
- Use atomic operations such as `$addToSet` where appropriate.
- Verify ownership before updating or deleting.
- Handle inactive or deleted products safely.
- Do not implement guest wishlist or localStorage-based backend synchronization in the current scope.

### Cart

- One Cart per Buyer.
- Only authenticated BUYER users can manage their Cart.
- Validate Product existence and active status.
- Validate selected size and available stock.
- Quantity must be at least 1.
- Merge items when Product and Size are identical.
- Do not store Product Name or Price inside Cart Items.
- Populate only necessary Product information when reading the Cart.
- Recalculate the latest price during checkout.
- Validate stock again during checkout and order creation.
- Frontend subtotal calculations are for display only. Backend calculations are authoritative.

## 17. Checkout and Financial Calculation Standards

The backend is the source of truth for all financial calculations.

Never trust frontend-provided:

- Product price
- Product stock
- Shipping charge
- Commission
- Vendor earning
- Order total
- Payment status

### Checkout Responsibilities

The checkout service must:

- Retrieve the authenticated Buyer's Cart.
- Validate Product availability.
- Validate selected variants and stock.
- Retrieve current Product prices.
- Calculate item subtotals.
- Calculate order subtotal.
- Calculate shipping charge.
- Calculate Admin commission.
- Calculate Vendor earnings.
- Return the final checkout summary.

### Commission Rules

```typescript
const adminCommission = itemSubtotal * 0.15;
const vendorEarning = itemSubtotal * 0.85;
```

- Admin commission: 15%.
- Vendor earning: 85%.
- Shipping charge is excluded from commission.
- Shipping charge is not Admin commission income.

**Example:**

For a product item subtotal of 1,000 BDT:

- Admin commission: 150 BDT.
- Vendor earning: 850 BDT.
- Shipping charge: calculated separately.

Use integer minor currency units (Paisa) or another explicitly approved, consistent decimal rounding strategy.

Do not mix rounding strategies across modules.

Never calculate financial values from untrusted client input.

## 18. Order Management Standards

### Order Rules

- One Order can contain products from multiple Vendors.
- Order Items must be embedded inside the Order document.
- Each Order Item must contain its own Vendor reference.
- Each Order Item must have an independent fulfillment status.
- Order creation must use server-side calculations.
- Order snapshots must preserve historical Product information.

### Required Snapshot Data

Each embedded Order Item must preserve:

- Product reference
- Vendor reference
- Product name
- Product image
- Brand
- Unit price
- Quantity
- Size
- Item subtotal
- Commission rate
- Admin commission
- Vendor earning
- Item fulfillment status

Product updates or deletion must not change existing Order snapshots.

### Stock Safety

- Validate stock again during Order creation.
- Prevent overselling during concurrent purchases.
- Use appropriate atomic stock updates.
- Use MongoDB transactions when multi-document consistency requires them.
- Restore stock only through explicitly defined cancellation or refund business logic.
- Do not clear the Cart before successful Order creation.
- Make order creation safe against duplicate submissions where required.

### Ownership

- Buyers can view and manage only their own Orders.
- Vendors can view only Orders containing their own Order Items.
- Vendors can update only their own Order Item status.
- Admins can manage platform Orders according to the defined API scope.
- Never expose another Vendor's private Order Item information to a Vendor.

## 19. Payment Integration Standards

**Supported payment methods:**

```typescript
type PaymentType = "STRIPE" | "COD";
```

**Payment statuses:**

```typescript
type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
```

### Stripe Rules

- Create Stripe Checkout Sessions from the backend.
- Never trust frontend success URLs to mark payments as paid.
- Verify Stripe webhook signatures.
- Use raw request body handling for Stripe signature verification.
- Implement webhook idempotency.
- Prevent duplicate payment processing.
- Validate the related Order and Payment before updating financial records.
- Maintain consistency between Payment and Order states.
- Do not expose Stripe secret keys.

### COD Rules

- COD Payment initially remains PENDING.
- Mark it as PAID only after cash is actually received through the authorized process.
- Never treat order placement as proof of cash collection.

### Payment Model Rules

- One Order may have multiple Payment Attempts.
- Do not add a unique index to the Order reference in Payment.
- Store provider references and transaction IDs safely.
- Do not trust client-submitted Payment Status or amount.
- Payment and Order state transitions must follow the approved business rules.

External Stripe operations cannot be rolled back by a MongoDB transaction. Handle external payment operations with appropriate idempotency and failure recovery rather than assuming database transactions cover them.

## 20. Review and Rating Standards

- Only authenticated BUYER users can create Reviews.
- Rating must be between 1 and 5.
- Comment must not exceed 1,000 characters.
- One Buyer can have one Review per Product.
- Buyers can update and delete only their own Reviews.
- Use an appropriate unique compound index for Buyer and Product.
- Public users can read Product Reviews.
- Calculate average ratings using reliable database data.

Purchase verification is not mandatory in the current requirements. Do not introduce it as a required rule without approval.

## 21. Cloudinary and File Management Standards

Use Cloudinary for:

- Buyer avatars
- Vendor shop images
- Vendor NID documents
- Category images
- Product images

### Shared Image Structure

```typescript
interface IImage {
  url: string;
  publicId: string;
}
```

### Upload Rules

- Use Multer for receiving files.
- Validate file MIME type and file size.
- Upload files through a shared Cloudinary utility.
- Save url and publicId in MongoDB.
- Delete old Cloudinary assets when replacing files.
- Clean up uploaded assets if database updates fail.
- Avoid leaving orphaned Cloudinary files.
- Never save invalid image references after failed uploads.
- Do not duplicate Cloudinary upload/delete implementations across modules.

### Private Documents

- NID Front and Back must remain private.
- Never expose NID documents in public API responses.
- Only authorized Admin users can access verification documents.
- Do not expose private document URLs through public Shop APIs.
- Use an appropriate private asset access strategy.
- Do not treat an ordinary public image URL as a private document access mechanism.

## 22. API Response Standards

All APIs must use a consistent response structure.

### Success Response

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "PRODUCT_ID"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": [
    {
      "path": "price",
      "message": "Price must be positive"
    }
  ]
}
```

**Rules:**

- Use a shared API response utility.
- Keep success and error response structures consistent.
- Use appropriate HTTP status codes.
- Do not expose stack traces or internal database errors in production responses.
- Return only required fields.
- Never expose sensitive information.
- Include pagination metadata for paginated listing APIs.
- Do not return complete Mongoose documents unnecessarily.
- Use the existing project response contract consistently. Do not independently introduce a different response format in a module.

## 23. Error Handling Standards

Use centralized error handling.

**Responsibilities:**

- Use a shared application error class where appropriate.
- Keep error handling consistent across modules.
- Handle validation errors explicitly.
- Handle authentication and authorization errors explicitly.
- Handle database errors explicitly.
- Handle payment errors explicitly.
- Use the global error handler for unexpected errors.
- Avoid swallowing errors silently.
- Do not return raw internal errors to clients.
- Use meaningful and predictable error messages.

Controllers must not implement their own inconsistent error response systems.

Expected errors should be represented through the established application error mechanism. Unexpected errors should be handled centrally and logged safely.

## 24. Logging Standards

Use Winston as the centralized application logger.

Log relevant events such as:

- Application errors
- Request errors
- Database errors
- Payment failures
- Authentication events
- Security events

### Logging Restrictions

Never log:

- Plaintext passwords
- OTP values
- Raw Access Tokens
- Raw Refresh Tokens
- Private NID document information
- Sensitive personal information
- Stripe secrets or other credentials

Use:

- Appropriate log levels.
- Structured logging.
- Useful contextual information.
- Safe error details.

Do not expose sensitive data through logs, even during development.

## 25. Security Standards

The backend must implement appropriate security controls.

Required security responsibilities include:

- Helmet
- CORS configuration
- Rate limiting
- Secure cookie configuration
- Request validation
- Input sanitization where appropriate
- Password hashing
- OTP hashing
- Authentication middleware
- Role-based authorization
- Resource ownership validation
- Vendor approval checks
- Stripe webhook signature verification
- Secure file upload validation
- Private NID document access
- Environment-based secret management

### Important Security Rules

- Never trust frontend authorization.
- Never trust frontend financial calculations.
- Never expose secrets or sensitive database fields.
- Prevent unauthorized access to other users' resources.
- Validate resource ownership before every protected mutation.
- Protect sensitive public endpoints with appropriate rate limits.
- Use environment variables for secrets and credentials.
- Do not expose private verification documents.
- Do not allow blocked users to continue protected operations through stale JWT claims.

## 26. Shared Infrastructure Standards

Shared infrastructure must be implemented once and reused.

**Recommended structure:**

```text
src/
├── app/
├── config/
├── errors/
├── interfaces/
├── middlewares/
├── modules/
├── routes/
├── utils/
├── constants/
└── server.ts
```

The actual structure must remain consistent with the existing project and `architecture-context.md`.

### Config

**Responsibilities:**

- Environment configuration
- Database connection
- JWT configuration
- Cloudinary configuration
- Stripe configuration
- Email configuration
- CORS configuration

### Middlewares

**Responsibilities:**

- `authenticate`
- `authorize`
- `requireApprovedVendor`
- `validateRequest`
- `globalErrorHandler`
- `notFoundHandler`
- Rate limiting

### Utilities

**Responsibilities:**

- Password hashing
- JWT generation and verification
- OTP generation and hashing
- Email sending
- Cloudinary upload/delete
- API response formatting
- Pagination
- Currency calculation

Do not recreate an existing shared utility inside individual feature modules.

## 27. Environment Variable Standards

Store secrets and credentials in environment variables.

**Rules:**

- Never hardcode API keys, passwords, or private credentials.
- Validate required environment variables during application startup.
- Use a centralized configuration module.
- Keep development and production configurations separate.
- Never commit `.env` files containing secrets.
- Use consistent environment variable names throughout the project.
- Do not read environment variables randomly throughout business modules; use centralized configuration.

**Example configuration responsibilities:**

```env
NODE_ENV=
PORT=
DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

CLIENT_URL=
```

These are examples. Actual variable names must remain consistent with the existing project configuration.

Never print environment secrets in logs or API responses.

## 28. API Route Standards

All APIs must use:

`/api/v1`

**Rules:**

- Keep routes separate from controllers.
- Apply authentication middleware at the route level.
- Apply authorization middleware at the route level.
- Apply request validation before controller execution.
- Apply `requireApprovedVendor` only to selling-related Vendor operations.
- Keep public routes separate from protected routes.
- Never depend on frontend redirects for backend security.
- Avoid duplicate or ambiguous endpoints.
- Follow the route scope defined in the feature requirements.

**Example:**

```typescript
router.post(
  "/",
  authenticate,
  authorize("VENDOR"),
  requireApprovedVendor,
  validateRequest(createProductSchema),
  ProductController.createProduct,
);
```

## 29. Database Transaction and Consistency Standards

Use MongoDB transactions when multiple database operations must succeed or fail together.

**Potential use cases:**

- Order creation with stock updates.
- Multi-product stock adjustments.
- Payment and related Order state updates when atomic consistency is required.
- Other operations involving multiple related documents.

**Rules:**

- Do not introduce transactions without a consistency requirement.
- Do not assume every operation requires a transaction.
- Ensure the MongoDB deployment supports transactions before relying on them.
- Handle transaction rollback correctly.
- Prevent duplicate processing during concurrent requests.
- Use atomic database operations for stock-sensitive operations.
- Do not assume a transaction covers external services such as Stripe or Cloudinary.
- Handle external service failures separately.
- For stock-sensitive operations, prevent overselling through conditional atomic updates or another approved concurrency-safe strategy.

## 30. Testing Standards

Every implemented feature must be tested before being considered complete.

### Functional Testing

Test:

- Successful operations.
- Invalid request data.
- Missing required fields.
- Missing resources.
- Duplicate resources.
- Expected state transitions.

### Authentication Testing

Test:

- Unauthenticated access.
- Invalid token.
- Expired token.
- Unverified account.
- Blocked account.
- Invalid role.

### Authorization Testing

Test:

- Buyer accessing another Buyer's resource.
- Vendor accessing another Vendor's resource.
- Unapproved Vendor attempting selling operations.
- Unauthorized Admin-only access.
- Vendor accessing another Vendor's Order Items.

### Financial Testing

Test:

- Product price calculation.
- Commission calculation.
- Vendor earnings.
- Shipping exclusion.
- Order totals.
- Payment status transitions.
- Refund and commission reversal rules where implemented.

### Security Testing

Test:

- OTP reuse.
- OTP expiration.
- OTP attempt limits.
- Refresh Token revocation.
- Stripe webhook signature verification.
- Duplicate webhook events.
- File type and size validation.
- Private NID access.
- Unauthorized resource access.

Do not mark a feature complete merely because its endpoint responds successfully.

A feature is complete only when its required business logic, validation, authorization, error handling, and relevant tests are implemented and verified.

## 31. Documentation and Progress Tracking

After completing each feature:

- Update relevant API documentation.
- Update the feature progress tracker.
- Document important business-rule decisions.
- Record newly introduced environment variables.
- Record any new shared utilities.
- Add or update tests.
- Document unresolved issues.
- Keep context files consistent with the actual implementation.

Do not claim that a feature is complete if required tests or business logic are still missing.

## 32. AI Coding Agent Rules

AI coding agents must follow a controlled implementation workflow.

### 32.1 Before Writing or Modifying Code

Read these files in order:

1. `project-overview.md`
2. `architecture-context.md`
3. `backend-feature-breakdown.md`
4. `backend-code-standards.md`
5. Relevant `progress-tracker.md`

Then:

- Inspect the existing project structure.
- Inspect the relevant modules.
- Inspect existing shared utilities.
- Inspect related models and interfaces.
- Inspect current dependencies and package versions.
- Identify implementation dependencies.
- Identify authentication and authorization requirements.
- Identify ownership and business-rule requirements.
- Identify potential database consistency issues.
- Prepare an implementation plan before significant changes.

Do not start coding based only on a short feature description when the relevant context files are available.

### 32.2 Before Coding

Understand:

- What feature is requested?
- Which modules are affected?
- Which models are required?
- Which interfaces are required?
- Which validations are required?
- Which services are required?
- Which controllers and routes are required?
- Which shared utilities already exist?
- Which permissions and ownership checks are required?
- Which tests must be added or updated?

Avoid modifying unrelated modules.

### 32.3 During Coding

- Follow existing project conventions.
- Respect defined module boundaries.
- Implement business logic in services.
- Use Zod for request validation.
- Use proper TypeScript types.
- Reuse shared infrastructure.
- Avoid unnecessary dependencies.
- Avoid duplicate utilities.
- Do not introduce features outside approved scope.
- Keep changes focused and reviewable.
- Preserve existing working functionality.

### 32.4 After Coding

- Review all modified files.
- Run relevant tests.
- Run TypeScript checks.
- Run linting when configured.
- Fix implementation-related errors.
- Verify authorization and ownership.
- Verify relevant business rules.
- Update documentation.
- Update progress tracking.
- Report completed work and remaining limitations.

### 32.5 AI Agent Restrictions

AI agents must not:

- Rewrite the entire project without permission.
- Change established architecture without approval.
- Create unnecessary models or collections.
- Create duplicate utilities.
- Silently change business rules.
- Implement multiple unrelated features in one task.
- Delete existing working code without understanding its purpose.
- Add unapproved dependencies.
- Skip relevant validation or authorization.
- Claim tests passed without actually running them.
- Mark incomplete work as complete.
- Invent missing business requirements.

When a requirement is unclear, identify the ambiguity and ask for clarification instead of silently choosing an implementation.

## 33. Current Scope Restrictions

The following features are outside the current approved scope:

- Dynamic Banner Management
- Notification System
- Vendor Withdrawal/Payout System

Do not implement these features or introduce their associated models and APIs unless explicitly requested.

**Also prohibited without approval:**

- Separate Buyer, Vendor, or Admin account models.
- Separate authentication systems.
- Common `/auth/me` endpoint.
- Separate OrderItem model.
- Separate Commission model.
- Separate Checkout model.
- Unapproved financial or payment models.

The current model scope must remain consistent with `architecture-context.md`.

## 34. Unresolved Architectural Decisions

The following decisions must not be silently invented during implementation.

If a feature depends on one of these decisions, document the dependency and request approval where necessary.

- RefreshToken server-side storage and rotation strategy.
- Cookie SameSite and CSRF protection strategy.
- Access Token storage strategy on the frontend.
- Shipping calculation formula and per-order versus per-vendor charging.
- Order creation and Stripe external transaction sequencing.
- Cancellation rules and stock restoration.
- Partial cancellation behavior.
- Review purchase verification.
- Refund and commission reversal calculations.
- COD cash collection confirmation process.
- Money storage and rounding convention.
- SUSPENDED Vendor dashboard restrictions.
- Category deletion behavior.
- Admin account creation process.
- User deletion behavior and historical Order preservation.
- Product stock versus variant stock source of truth.
- Stripe webhook event idempotency storage strategy.
- API response and error format changes.
- Exact Order and Payment state transitions.
- Profile creation strategy.
- Transaction number generation strategy.
- Vendor User ID and VendorProfile ID resolution consistency.

Existing approved requirements must continue to work while these decisions remain unresolved.

## 35. Final Backend Development Principles

Every backend implementation must follow these principles:

- One Common User Model.
- One Common Authentication System.
- Mandatory Email OTP Verification.
- JWT Access Token and Refresh Token.
- Separate Buyer, Vendor, and Admin Profile APIs.
- Separate Buyer Profile and VendorProfile Models.
- Vendor Shop Approval before Selling.
- Vendor Dashboard Access independent of Shop Approval.
- Role-based Authorization.
- Ownership-based Authorization.
- Modular Architecture.
- Separate Model, Interface, Validation, Service, Controller, and Route where applicable.
- Zod Request Validation.
- Strict TypeScript.
- Centralized Error Handling.
- Centralized API Responses.
- Winston Logging.
- Server-side Price, Stock, Commission, and Payment Validation.
- Order Item Snapshot.
- Secure Cloudinary File Management.
- Stripe Webhook Signature Verification and Idempotency.
- MongoDB Transactions where required.
- Feature-level Testing and Documentation.
- No Unapproved Scope Expansion.

## Final Instruction for Developers and AI Agents

These standards are mandatory for all Jus Buy backend implementation work.

Before implementing a feature, understand its requirements, inspect the existing codebase, follow the architecture, and prepare a focused implementation plan.

During implementation, preserve established business rules and reuse existing infrastructure.

After implementation, test the feature, review the changes, update documentation, and report any remaining limitations.

Code should not merely work. It should be secure, properly typed, maintainable, testable, and consistent with the Jus Buy architecture.
