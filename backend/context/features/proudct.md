# Jus Buy — Vendor Product Management Implementation

Implement complete Vendor Product Management functionality in the existing Jus Buy backend.

## 1. Vendor Product Management Features

Implement the following features:

- Create new products.
- View all products created by the authenticated Vendor.
- View a single product owned by the Vendor.
- Update existing products.
- Delete products.
- Manage product feature images and additional images.
- Maintain strict product ownership and access control.

## 2. API Endpoints

| Method | Endpoint                           | Access          |
| ------ | ---------------------------------- | --------------- |
| POST   | `/products`                        | Approved Vendor |
| GET    | `/products/my-products`            | Approved Vendor |
| GET    | `/products/my-products/:productId` | Approved Vendor |
| PATCH  | `/products/my-products/:productId` | Approved Vendor |
| DELETE | `/products/my-products/:productId` | Approved Vendor |

## 3. Create Product

- Only authenticated Vendors with an `APPROVED` Vendor profile can create products.
- Find the Vendor profile using the authenticated User ID.
- Verify that the Vendor profile exists and is approved.
- Verify that the selected Category exists and is active.
- Automatically assign the authenticated Vendor's profile ID.
- Never accept `vendor` from the request body.
- Set `salesCount` to `0` and `isActive` to `true` by default.
- Validate product data using Zod.
- Reuse existing Multer and Cloudinary utilities.

## 4. Get My Products

- Return only products belonging to the authenticated Vendor.
- Support search, filtering, sorting, and pagination according to existing project conventions.
- Return pagination metadata.
- Populate relevant Category information.
- Do not expose sensitive Vendor or User information.

## 5. Get My Single Product

- Return only products owned by the authenticated Vendor.
- Validate `productId` using Zod.
- Return `PRODUCT_NOT_FOUND` if the product does not exist or belongs to another Vendor.

## 6. Update My Product

- Allow Vendors to update only their own products.
- Verify ownership before updating.
- Allow updates to:
  - `category`
  - `name`
  - `description`
  - `brand`
  - `price`
  - `stock`
  - `sizes`
  - `featureImage`
  - `images`
- If the category changes, verify that the new Category exists and is active.
- Never allow modification of `vendor`, `salesCount`, or other protected fields.
- Handle image replacement safely using existing Cloudinary utilities.

## 7. Delete My Product

- Allow Vendors to delete only their own products.
- Verify ownership before deletion.
- Return `PRODUCT_NOT_FOUND` if the product does not exist or belongs to another Vendor.
- Delete associated Cloudinary images only after successful database deletion.
- Handle Cloudinary deletion failures using existing logging or cleanup mechanisms.

## 8. Route Protection and Authorization

Protect all Vendor product management endpoints using existing middleware.

Apply:

- Authentication middleware.
- `VENDOR` role authorization.
- Approved Vendor status verification.

Do not duplicate authorization logic.

Keep the following public endpoints accessible without authentication:

- `GET /products`
- `GET /products/:productId`
- `GET /products/new-arrivals`
- `GET /products/:productId/related`

Ensure `/products/my-products` routes are registered before dynamic `/:productId` routes to prevent route conflicts.

## 9. Security and Ownership

- Always derive Vendor identity from the authenticated User.
- Never trust Vendor ID from client input.
- Every Vendor-specific product query must verify both Product ID and authenticated Vendor profile ID.
- Prevent Vendors from viewing, updating, or deleting another Vendor's products.
- Use centralized error handling and existing API response conventions.

## 10. Architecture and Coding Standards

Follow the existing project documentation:

- `project-overview.md`
- `architecture-context.md`
- `code-standards.md`
- `ai-workflow-rules.md`

Maintain:

- Modular architecture.
- Function-based implementations.
- Object-based default exports for controllers and services.
- `@/` aliases for internal imports.
- Zod validation.
- Existing middleware and shared utilities.
- Centralized error handling.
- Strict TypeScript types.

Avoid unnecessary dependencies, duplicate logic, and unrelated refactoring.

## 11. Final Verification

- Verify all Vendor product management endpoints.
- Verify authentication, Vendor role, and approved status.
- Verify product ownership restrictions.
- Verify Category validation.
- Verify protected fields cannot be modified.
- Verify image upload, replacement, and deletion.
- Verify all existing public Product APIs remain functional.
- Verify route ordering.
- Run TypeScript build and existing tests.
- Fix all errors introduced by the implementation.

**Important:** First inspect the existing codebase. Reuse the existing Product model, Vendor model, authentication middleware, Cloudinary utilities, Multer middleware, validation patterns, and error handling. Preserve existing functionality and avoid unrelated changes.

**Final Goal:** Build a secure, maintainable Vendor Product Management system where each approved Vendor can create, view, update, and delete only their own products while public users retain access to product discovery features.
