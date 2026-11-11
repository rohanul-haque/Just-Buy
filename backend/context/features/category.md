# Jus Buy — Category Module Feature Requirements

## 1. Overview

Implement a complete Category management module for the Jus Buy multi-vendor e-commerce platform.

Categories will be managed by Admins and publicly accessible to Guests, Buyers, and Vendors.

The module must follow the existing modular architecture, coding conventions, validation patterns, error handling, and reusable utilities of the project.

## 2. Category Model

Use the following Mongoose schema structure:

```ts
const categorySchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      publicId: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### Model Rules

- `admin` references the User who created the category.
- `name` is required, trimmed, and has a maximum length of 100 characters.
- Category names must be unique.
- Handle category name uniqueness consistently, including case-insensitive duplicates.
- `image` stores Cloudinary image metadata.
- `isActive` defaults to `true`.
- Use timestamps and disable the version key.
- Add appropriate indexes for frequently queried fields.
- Avoid unnecessary indexes and duplicate constraints.

## 3. API Endpoints

| Method | Endpoint                  | Access |
| ------ | ------------------------- | ------ |
| POST   | `/categories`             | Admin  |
| GET    | `/categories`             | Public |
| GET    | `/categories/:categoryId` | Public |
| PATCH  | `/categories/:categoryId`        | Admin  |
| PATCH  | `/categories/:categoryId/status` | Admin  |
| DELETE | `/categories/:categoryId` | Admin  |

All routes must use the existing authentication and authorization middleware.

Public means Guests, Buyers, Vendors, and Admins can access these endpoints without requiring a specific role.

## 4. Create Category

**Endpoint:** `POST /categories`

**Access:** Admin only.

### Request

Use `multipart/form-data`.

Fields:

- `name` — required string.
- `image` — optional image file.

### Requirements

1. Get the authenticated Admin's User ID from the existing authentication context.
2. Save that ID in the `admin` field.
3. Validate the category name using Zod.
4. Check for an existing category with the same name, ignoring case.
5. Reject duplicate category names with an appropriate conflict error.
6. Upload the image to Cloudinary if provided.
7. Save the Cloudinary metadata:
   - `publicId`
   - `url`
   - `width`
   - `height`
8. Set `isActive` to `true` by default.
9. Return the created category with a consistent API response.

Do not allow clients to submit `admin`, `isActive`, or Cloudinary metadata directly.

## 5. Get All Categories

**Endpoint:** `GET /categories`

**Access:** Public.

### Query Parameters

- `page` — optional pagination page.
- `limit` — optional number of results per page.
- `search` — optional category name search.
- `isActive` — optional boolean filter.
- `sort` — optional sorting according to existing project conventions.

### Requirements

1. Return active categories by default.
2. If `isActive` is explicitly provided, filter according to its value.
3. Support case-insensitive category name search.
4. Non-paginated: Return all matching categories directly without page, limit, or pagination metadata.
5. Support sorting according to existing project conventions.
7. Do not expose unnecessary internal information.

### Important

- Default behavior: only return categories where `isActive: true`.
- `GET /categories?isActive=false` must return inactive categories.
- `GET /categories?isActive=true` must return active categories.

## 6. Get Single Category

**Endpoint:** `GET /categories/:categoryId`

**Access:** Public.

### Requirements

1. Validate `categoryId` using the existing Zod params validation pattern.
2. Find the category by its MongoDB ObjectId.
3. Return the category if it exists and is active.
4. Return an appropriate `NOT_FOUND` error if the category does not exist or is inactive.
5. Do not expose unnecessary internal information.

## 7. Update Category

**Endpoint:** `PATCH /categories/:categoryId`

**Access:** Admin only.

### Request

Use `multipart/form-data`.

Supported fields:

- `name` — optional string.
- `image` — optional image file.
- `isActive` — optional boolean.

### Requirements

1. Validate the category ID and request body.
2. Allow partial updates.
3. Update only the fields provided by the Admin.
4. Check category name uniqueness if the name is changed.
5. Reject duplicate names using case-insensitive comparison.
6. Allow the Admin to update the category image.
7. Allow the Admin to activate or deactivate a category.
8. Do not allow updates to `admin`, `_id`, or timestamps.
9. Return the updated category.

### Image Update Handling

Use the existing Multer and Cloudinary utilities.

Follow this safe image update sequence:

1. Upload the new image to Cloudinary.
2. Update the category document with the new image metadata.
3. After a successful database update, delete the previous Cloudinary image using its `publicId`.
4. If the database update fails, delete the newly uploaded image and preserve the old image.
5. If deleting the old image fails, log the failure or use the existing cleanup/retry mechanism. Do not roll back the successful database update.

Do not use MongoDB transactions for Cloudinary operations.

If no new image is provided, preserve the existing image.


## 7.1 Update Category Status

**Endpoint:** PATCH /categories/:categoryId/status\r

**Access:** Admin only.

### Requirements

1. Validate category ID and required boolean isActive using Zod.
2. Update the category status in MongoDB.
3. Return the updated category.
4. Return an appropriate NOT_FOUND error if the category does not exist.

## 8. Delete Category

**Endpoint:** `DELETE /categories/:categoryId`

**Access:** Admin only.

### Requirements

1. Validate the category ID.
2. Check whether the category exists.
3. Check whether the category is referenced by existing products.
4. Do not permanently delete a category that is referenced by existing products.
5. Return an appropriate error if deletion is blocked by product references.
6. If deletion is allowed, delete the category from MongoDB.
7. Delete its Cloudinary image using the stored `publicId` after successful database deletion.
8. If Cloudinary deletion fails, log the failure or use the existing cleanup/retry mechanism.
9. Return a consistent success response.

Do not silently delete or modify products when deleting a category.

## 9. Image Upload Requirements

Reuse the existing utilities:

- Multer: `src/utils/multer.ts`
- Cloudinary: `src/lib/cloudinary.ts`
- Upload middleware: `src/middlewares/upload.middleware.ts`

### Image Validation

- Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
- Maximum file size: 5 MB.
- Use memory storage.
- Reject unsupported file types and oversized files.
- Do not create duplicate Multer or Cloudinary configurations.

## 10. Validation Requirements

Use Zod for:

- Create category body.
- Update category body.
- Category ID params.
- Get all categories query parameters.

Follow the project's standardized validation pattern:

```ts
validateRequest(createCategorySchema, "body");
validateRequest(categoryParamsSchema, "params");
validateRequest(categoryQuerySchema, "query");
validateRequest(updateCategorySchema, "body");
```

Use the existing object-based validation only when multiple request sources genuinely need validation together.

Ensure:

- Category name is trimmed and non-empty.
- Maximum name length is 100 characters.
- `isActive` accepts a valid boolean representation according to existing query/body conventions.
- Unknown or unsupported fields are rejected according to existing validation standards.
- Clients cannot submit protected fields or Cloudinary metadata.

## 11. Error Handling

Use the existing centralized error-handling system.

Handle appropriate cases, including:

- `CATEGORY_NOT_FOUND`
- `CATEGORY_ALREADY_EXISTS`
- `CATEGORY_IN_USE`
- `INVALID_CATEGORY_ID`
- `INVALID_IMAGE_TYPE`
- `FILE_TOO_LARGE`

Follow the project's existing `AppError`, error code, HTTP status, and API response conventions. Do not introduce a separate error-handling system.

## 12. Module Structure

Follow the existing module structure:

```text
src/
└── modules/
    └── v1/
        └── category/
            ├── category.model.ts
            ├── category.interface.ts
            ├── category.validation.ts
            ├── category.constant.ts
            ├── category.service.ts
            ├── category.controller.ts
            └── category.route.ts
```

### Controller Structure

Use named internal functions grouped into one default-exported controller object.

```ts
const createCategory = asyncHandler(async (req, res) => {
  // Controller logic
});

const getAllCategories = asyncHandler(async (req, res) => {
  // Controller logic
});

const categoryController = {
  createCategory,
  getAllCategories,
};

export default categoryController;
```

### Service Structure

Use named internal functions grouped into one default-exported service object.

```ts
const createCategory = async (payload: CreateCategoryPayload) => {
  // Business logic
};

const getAllCategories = async (query: CategoryQuery) => {
  // Business logic
};

const categoryService = {
  createCategory,
  getAllCategories,
};

export default categoryService;
```

### Route Structure

Use the default controller object:

```ts
import categoryController from "./category.controller";

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest(createCategorySchema, "body"),
  categoryController.createCategory,
);

router.get(
  "/",
  validateRequest(categoryQuerySchema, "query"),
  categoryController.getAllCategories,
);
```

Adapt middleware ordering to the existing project's multipart validation implementation. Ensure uploaded files are available when validating multipart requests.

All internal imports must use the existing `@/` path alias instead of relative paths wherever applicable.

## 13. Architecture and Coding Standards

- Follow the existing modular architecture.
- Keep controllers thin.
- Keep business logic inside services.
- Use function-based implementations.
- Maintain strict TypeScript types.
- Reuse existing middleware, utilities, and error handling.
- Avoid duplicated business logic.
- Do not introduce unnecessary dependencies.
- Follow existing naming and response conventions.
- Keep code readable and easy to maintain.

## 14. Final Verification

After implementation:

1. Verify all five API endpoints.
2. Verify Admin authorization and public access.
3. Verify category name uniqueness, including case-insensitive duplicates.
4. Verify pagination, search, sorting, and `isActive` filtering.
5. Verify image upload, update, and deletion.
6. Verify categories referenced by products cannot be deleted.
7. Verify error handling and response structures.
8. Run TypeScript build and existing tests.
9. Fix all errors introduced by the implementation.

**Important:** Inspect the existing project, models, Product module, authentication middleware, upload utilities, and context documents before implementation. Reuse existing patterns and do not modify unrelated modules or business logic.

**Final Goal:** Implement a production-ready Category module that integrates cleanly with the existing Jus Buy backend architecture.
