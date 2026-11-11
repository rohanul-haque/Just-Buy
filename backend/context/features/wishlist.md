# Jus Buy — Wishlist Module Feature Requirements

## 1. Overview

Implement a Wishlist module for the Jus Buy multi-vendor e-commerce platform.

The Wishlist allows authenticated Buyers to save products they are interested in and manage their saved products.

Each Buyer must have only one Wishlist document. A Wishlist can contain multiple Product references.

Only authenticated users with the `BUYER` role can access Wishlist APIs.

## 2. Wishlist Model

Use the following Mongoose schema structure:

```ts
const wishlistSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### Model Rules

- One Buyer can have only one Wishlist.
- The `buyer` field references the authenticated User ID.
- The `products` field stores Product ObjectIds.
- Do not store duplicate Product IDs in the same Wishlist.
- Use the existing model and naming conventions.
- Do not introduce unnecessary fields or relationships.

## 3. API Endpoints

| Method | Endpoint                     | Access              |
| ------ | ---------------------------- | ------------------- |
| POST   | `/wishlist/items`            | Authenticated Buyer |
| GET    | `/wishlist`                  | Authenticated Buyer |
| DELETE | `/wishlist/items/:productId` | Authenticated Buyer |

All three endpoints must be protected.

## 4. Add Product to Wishlist

**Endpoint:** `POST /wishlist/items`

**Access:** Authenticated Buyer only.

### Request Body

```json
{
  "productId": "PRODUCT_OBJECT_ID"
}
```

### Requirements

1. Authenticate the user.
2. Verify that the authenticated user has the `BUYER` role.
3. Validate `productId` using Zod.
4. Verify that the Product exists and is active.
5. Find the Buyer's existing Wishlist.
6. If no Wishlist exists, create one using the authenticated User ID.
7. Add the Product ID to the Wishlist.
8. Prevent duplicate Product IDs.
9. Return the updated Wishlist using the existing API response structure.

### Important Rules

- Never accept `buyer` from the request body.
- Always derive the Buyer ID from the authenticated user.
- Do not add nonexistent or inactive products.
- Do not create duplicate Wishlist entries.
- Handle concurrent requests safely to prevent duplicate products.

## 5. Get My Wishlist

**Endpoint:** `GET /wishlist`

**Access:** Authenticated Buyer only.

### Requirements

1. Authenticate the user.
2. Verify the `BUYER` role.
3. Find the Wishlist using the authenticated User ID.
4. Populate the `products` field with relevant Product information.
5. Return only active products.
6. Do not expose sensitive Vendor or User information.
7. If the Buyer has no Wishlist, return an appropriate empty Wishlist response or follow the existing project response convention.
8. Do not return another Buyer's Wishlist.

### Product Population

Populate only necessary Product fields, such as:

- `name`
- `description`
- `brand`
- `price`
- `stock`
- `featureImage`
- `sizes`
- `isActive`
- `category`
- `vendor`

Populate only safe Category and Vendor information where appropriate.

## 6. Remove Product from Wishlist

**Endpoint:** `DELETE /wishlist/items/:productId`

**Access:** Authenticated Buyer only.

### Requirements

1. Authenticate the user.
2. Verify the `BUYER` role.
3. Validate `productId` using Zod.
4. Find the Wishlist using the authenticated User ID.
5. Remove the specified Product ID from the Buyer's Wishlist.
6. Do not modify another Buyer's Wishlist.
7. Return an appropriate response after successful removal.

### Error Handling

- Return an appropriate error if the Wishlist does not exist.
- Return an appropriate error if the Product is not in the Wishlist.
- Return consistent centralized errors.
- Do not expose internal database information.

## 7. Route Protection

Protect every Wishlist route using existing middleware.

Use the existing middleware in the correct order:

```ts
authenticate,
authorize(UserRole.BUYER),
```

Apply the appropriate Zod validation middleware.

Do not duplicate authentication or authorization logic inside controllers or services.

## 8. Validation Requirements

Use Zod for:

- Add Wishlist item request body.
- Product ID route params for removal.

Validate:

- Valid MongoDB ObjectIds.
- Required `productId`.
- Reject unsupported request fields using `.strict()`.

Follow the standardized validation pattern:

```ts
validateRequest(addWishlistItemSchema, "body");
validateRequest(productIdParamsSchema, "params");
```

## 9. Module Structure

Follow the existing modular architecture:

```text
src/
└── modules/
    └── v1/
        └── wishlist/
            ├── wishlist.model.ts
            ├── wishlist.interface.ts
            ├── wishlist.validation.ts
            ├── wishlist.service.ts
            ├── wishlist.controller.ts
            └── wishlist.route.ts
```

### Controller and Service Structure

- Use function-based implementations.
- Group controller functions into a default-exported `wishlistController` object.
- Group service functions into a default-exported `wishlistService` object.
- Routes must use `wishlistController.methodName`.
- Controllers must call `wishlistService.methodName`.
- Keep controllers thin and business logic inside services.

### Import Convention

Use `@/` aliases for all internal project imports.

## 10. Architecture and Coding Standards

Follow all existing project context documents:

- `project-overview.md`
- `architecture-context.md`
- `code-standards.md`
- `ai-workflow-rules.md`

Requirements:

- Follow modular architecture.
- Use strict TypeScript types.
- Reuse existing authentication and authorization middleware.
- Reuse existing centralized error handling.
- Follow existing API response conventions.
- Avoid duplicate business logic.
- Avoid unnecessary dependencies and abstractions.
- Do not introduce unnecessary pagination for Wishlist APIs.

## 11. Final Verification

After implementation:

1. Verify all Wishlist routes require authentication.
2. Verify only Buyers can access Wishlist APIs.
3. Verify each Buyer has only one Wishlist.
4. Verify duplicate products cannot be added.
5. Verify nonexistent and inactive products cannot be added.
6. Verify populated Wishlist products contain only safe information.
7. Verify Buyers cannot access another Buyer's Wishlist.
8. Verify product removal works correctly.
9. Verify empty Wishlist handling.
10. Run TypeScript build and existing tests.
11. Fix all errors introduced by the implementation.

**Important:** Inspect the existing codebase before implementation. Reuse existing User authentication, Product model, validation utilities, response helpers, and error handling. Preserve existing functionality and avoid unrelated changes.

**Final Goal:** Implement a secure and maintainable Wishlist module where each authenticated Buyer can add products, view their Wishlist, and remove products while maintaining strict Buyer ownership and duplicate prevention.
