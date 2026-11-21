# Review Module — Feature Requirements

### 1. Review Model

Create `review.model.ts` using the following exact schema structure:

```ts
const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer",
      },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

- Export the Review model using the existing project conventions.
- Add a unique compound index on `{ product: 1, buyer: 1 }` to prevent duplicate reviews.
- Keep the provided schema fields and validation rules unchanged.

### 2. Review Interface

- Define the Review TypeScript interface based on the provided schema.
- Maintain proper Mongoose and TypeScript types.

### 3. Review Constants

- Define Review-related constants only when necessary.
- Avoid unnecessary enums or abstractions.

### 4. Review Validation

- Create Zod validation schemas for review creation and Product route parameters.
- Validate rating as an integer between 1 and 5.
- Validate comment as a required trimmed string with a maximum of 1000 characters.
- Validate `productId` as a valid MongoDB ObjectId.
- Reject unexpected request fields.

### 5. Create Review

- **POST** `/reviews`
- **Access:** Buyer only.
- Allow Buyers to review only products they have purchased through a `DELIVERED` Order.
- Verify that the Order belongs to the authenticated Buyer and contains the requested Product.
- Allow only one review per Buyer for each Product, even if purchased multiple times.
- Get Buyer ID from the authenticated user, never from the request body.
- Prevent duplicate reviews using service-level validation and the database unique index.
- Return the created Review.

### 6. Get Product Reviews

- **GET** `/products/:productId/reviews`
- **Access:** Public.
- Retrieve reviews belonging to the requested Product.
- Verify that the Product exists.
- Populate only safe Buyer information.
- Sort reviews by newest first (`createdAt: -1`).
- Return an empty array when no reviews exist.

### 7. Review Service

- Implement review creation and product review retrieval.
- Handle delivered Order eligibility checks.
- Handle duplicate review validation.
- Reuse existing Order and Product models.
- Handle MongoDB duplicate key errors properly.

### 8. Review Controller

- Implement controllers for both APIs.
- Follow existing `asyncHandler` and centralized error-handling conventions.
- Keep controllers focused on request and response handling.

### 9. Review Routes

| Method | Endpoint                       | Access |
| ------ | ------------------------------ | ------ |
| POST   | `/reviews`                     | Buyer  |
| GET    | `/products/:productId/reviews` | Public |

- Apply authentication and Buyer authorization to review creation.
- Keep product review retrieval publicly accessible.
- Apply appropriate Zod validation middleware.

### 10. Folder Structure

```text
src/modules/v1/review/
├── review.model.ts
├── review.interface.ts
├── review.constant.ts
├── review.validation.ts
├── review.service.ts
├── review.controller.ts
└── review.route.ts
```

### 11. Implementation Standards

- Follow existing Jus Buy architecture and code standards.
- Use function-based implementation.
- Use object-based default exports for controllers and services.
- Reuse existing middleware, utilities, and shared infrastructure.
- Maintain proper TypeScript types.
- Avoid unnecessary APIs, fields, models, and abstractions.
- Keep implementation limited to the two requested APIs.

### 12. Testing

- Verify review creation for purchased and delivered products.
- Verify reviews are rejected for undelivered or unpurchased products.
- Verify duplicate reviews are prevented.
- Verify public product review retrieval.
- Verify invalid Product IDs and missing Products are handled correctly.
- Run TypeScript build and relevant tests.
