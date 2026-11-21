# Jus Buy — Cart Module Feature Requirements

## 1. Overview

Implement a Cart module for the Jus Buy multi-vendor e-commerce platform.

The Cart allows authenticated Buyers to add products, view cart items, update quantities, and remove items.

Each Buyer must have only one Cart document.

Only authenticated users with the `BUYER` role can access Cart APIs.

## 2. Cart Model

Use the following Mongoose schema structure:

```ts
const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    size: {
      type: String,
      enum: Object.values(ProductSize),
    },
  },
  {
    _id: true,
  },
);

const cartSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    productItems: {
      type: [cartItemSchema],
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

- Each Buyer can have only one Cart.
- Each Cart can contain multiple product items.
- Every item references a Product.
- Each item stores its own quantity and optional size.
- Use the generated cart item `_id` to identify individual cart items.
- Do not accept `buyer` from client input.
- Reuse the existing `ProductSize` enum.

## 3. API Endpoints

| Method | Endpoint              | Access              |
| ------ | --------------------- | ------------------- |
| POST   | `/cart/items`         | Authenticated Buyer |
| GET    | `/cart`               | Authenticated Buyer |
| PATCH  | `/cart/items/:itemId` | Authenticated Buyer |
| DELETE | `/cart/items/:itemId` | Authenticated Buyer |

All four endpoints must be protected.

## 4. Add Product to Cart

**Endpoint:** `POST /cart/items`

**Access:** Authenticated Buyer only.

### Request Body

```json
{
  "productId": "PRODUCT_OBJECT_ID",
  "quantity": 2,
  "size": "M"
}
```

`size` is optional.

### Requirements

1. Authenticate the user.
2. Verify that the authenticated user has the `BUYER` role.
3. Validate the request body using Zod.
4. Verify that the Product exists and is active.
5. Validate that the requested quantity is a positive integer.
6. Check available Product stock before adding the item.
7. If the product has size options, validate the requested size against the Product's available sizes.
8. If the product has no size options, do not require a size.
9. Find the Buyer's existing Cart.
10. If no Cart exists, create one using the authenticated User ID.
11. If the same Product and size already exist in the Cart, increase its existing quantity instead of creating a duplicate item.
12. Before increasing quantity, verify that the combined quantity does not exceed available Product stock.
13. If the Product and size combination is different, create a separate Cart item.
14. Return the updated Cart using the existing API response structure.

### Important Rules

- Never accept `buyer` from the request body.
- Always derive Buyer identity from the authenticated User.
- Do not add nonexistent or inactive products.
- Prevent duplicate Product and size combinations.
- Do not allow quantity greater than available stock.

## 5. Get My Cart

**Endpoint:** `GET /cart`

**Access:** Authenticated Buyer only.

### Requirements

1. Authenticate the user.
2. Verify the `BUYER` role.
3. Find the Cart using the authenticated User ID.
4. Populate `productItems.product` with relevant Product information.
5. Populate safe Category and Vendor information where appropriate.
6. Return only the authenticated Buyer's Cart.
7. Do not expose sensitive Vendor or User information.
8. If the Buyer has no Cart, return an appropriate empty Cart response according to existing project conventions.

### Product Information

Populate necessary fields:

- `name`
- `description`
- `brand`
- `price`
- `stock`
- `featureImage`
- `images`
- `sizes`
- `isActive`
- `category`
- `vendor`

### Cart Response Considerations

- Include each item's `_id`, quantity, and size.
- Ensure populated Product information is returned safely.
- Do not modify stored Cart quantities during retrieval.
- Do not silently remove cart items during GET requests.

## 6. Update Cart Item Quantity

**Endpoint:** `PATCH /cart/items/:itemId`

**Access:** Authenticated Buyer only.

### Request Body

```json
{
  "quantity": 3
}
```

### Requirements

1. Authenticate the user.
2. Verify the `BUYER` role.
3. Validate `itemId` using Zod.
4. Validate that quantity is a positive integer.
5. Find the Cart using the authenticated User ID.
6. Find the specific Cart item using its `_id`.
7. Return an appropriate error if the Cart or item does not exist.
8. Retrieve the associated Product.
9. Verify that the Product exists and is active.
10. Check the Product's current available stock.
11. Reject the update if the requested quantity exceeds available stock.
12. Update only the specified Cart item's quantity.
13. Return the updated Cart.

### Critical Stock Validation

Always compare the requested quantity with the Product's current stock.

```ts
if (quantity > product.stock) {
  throw new AppError(
    HttpStatus.BAD_REQUEST,
    "INSUFFICIENT_STOCK",
    "Requested quantity exceeds available stock",
  );
}
```

Use the existing project error-handling conventions if the error constructor has a different signature.

### Important Rules

- Never allow quantity less than `1`.
- Never allow decimal quantities.
- Never allow quantity greater than available Product stock.
- Do not modify another Cart item's quantity.
- Do not trust Product stock values supplied by the client.
- Do not change Product stock when updating Cart quantity.
- Cart operations must not reserve or deduct actual inventory.

## 7. Remove Cart Item

**Endpoint:** `DELETE /cart/items/:itemId`

**Access:** Authenticated Buyer only.

### Requirements

1. Authenticate the user.
2. Verify the `BUYER` role.
3. Validate `itemId` using Zod.
4. Find the Cart using the authenticated User ID.
5. Remove only the specified Cart item.
6. Return an appropriate error if the Cart does not exist.
7. Return an appropriate error if the item does not exist in the Buyer's Cart.
8. Return the updated Cart or a success response according to existing API conventions.

### Important Rules

- Never allow a Buyer to remove another Buyer's Cart item.
- Do not delete the entire Cart when removing one item.
- Do not modify Product stock.

## 8. Stock and Product Validation Rules

Apply these rules consistently across Cart operations:

- Product must exist.
- Product must be active.
- Requested quantity must be a positive integer.
- Requested quantity must not exceed available Product stock.
- Requested size must be valid when the Product has size options.
- Products without size options must not require a size.
- If a Product becomes inactive or is deleted after being added to a Cart, handle it appropriately without silently modifying the Cart during GET requests.

**Important:** Cart operations only manage intended purchase quantities. Actual inventory deduction must happen during the order placement or checkout process, not when adding or updating Cart items.

## 9. Route Protection

Protect all Cart routes using existing middleware.

Use:

```ts
authenticate,
authorize(UserRole.BUYER),
```

Apply appropriate Zod validation middleware:

```ts
validateRequest(addToCartSchema, "body");
validateRequest(updateCartItemSchema, "body");
validateRequest(cartItemParamsSchema, "params");
```

Do not duplicate authentication or authorization logic inside controllers or services.

## 10. Validation Requirements

Use Zod for:

- Add Cart item request body.
- Update Cart item request body.
- Cart item route params.

Validate:

- Valid MongoDB ObjectIds.
- Required Product ID.
- Positive integer quantity.
- Valid `ProductSize` values.
- Optional size according to Product requirements.
- Reject unsupported fields using `.strict()`.

## 11. Module Structure

Follow the existing modular architecture:

```text
src/
└── modules/
    └── v1/
        └── cart/
            ├── cart.model.ts
            ├── cart.interface.ts
            ├── cart.validation.ts
            ├── cart.service.ts
            ├── cart.controller.ts
            └── cart.route.ts
```

### Controller and Service Structure

- Use function-based implementations.
- Group controller functions into a default-exported `cartController` object.
- Group service functions into a default-exported `cartService` object.
- Routes must use `cartController.methodName`.
- Controllers must call `cartService.methodName`.
- Keep controllers thin and business logic inside services.

### Import Convention

Use `@/` aliases for all internal project imports.

## 12. Architecture and Coding Standards

Follow all existing project context documents:

- `project-overview.md`
- `architecture-context.md`
- `code-standards.md`
- `ai-workflow-rules.md`

Requirements:

- Follow modular architecture.
- Use strict TypeScript types.
- Reuse existing authentication and authorization middleware.
- Reuse existing validation utilities.
- Follow centralized error handling.
- Follow existing API response conventions.
- Avoid duplicate business logic.
- Avoid unnecessary dependencies and abstractions.
- Do not introduce unnecessary pagination.

## 13. Final Verification

After implementation:

1. Verify all Cart routes require authentication.
2. Verify only Buyers can access Cart APIs.
3. Verify each Buyer has only one Cart.
4. Verify adding a product works correctly.
5. Verify duplicate Product and size combinations increase existing quantity.
6. Verify different sizes create separate Cart items.
7. Verify nonexistent and inactive products cannot be added.
8. Verify requested sizes are valid.
9. Verify quantity cannot exceed available stock.
10. Verify quantity updates check current Product stock.
11. Verify Cart ownership restrictions.
12. Verify removing one item does not remove the entire Cart.
13. Verify Product stock is not deducted during Cart operations.
14. Verify populated Product information is safe.
15. Run TypeScript build and existing tests.
16. Fix all errors introduced by the implementation.

**Important:** Inspect the existing codebase before implementation. Reuse the existing Product model, ProductSize enum, authentication middleware, validation utilities, response helpers, and centralized error handling. Preserve existing functionality and avoid unrelated changes.

**Final Goal:** Implement a secure and maintainable Cart module where each authenticated Buyer can add products, view their Cart, update item quantities with strict stock validation, and remove individual items without modifying actual Product inventory.
