# Jus Buy — Buyer Profile Management with Cloudinary & Multer

## 1. Buyer Model

Create a Buyer model with the following fields:

```typescript
const buyerSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    address: {
      type: String,
      trim: true,
    },
    profile: {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### Profile Image Structure

The `profile` object must contain:

- `publicId`: Cloudinary public ID.
- `url`: Cloudinary secure URL.
- `width`: Image width returned by Cloudinary.
- `height`: Image height returned by Cloudinary.

Do not store MIME type or other unnecessary image metadata in the Buyer profile.

## 2. Automatic Buyer Profile Creation

- Whenever a User is created with the BUYER role, automatically create a Buyer profile.
- Create the User and Buyer documents within the same MongoDB transaction.
- During registration, create User, Verification, and Buyer documents in the same transaction when the role is BUYER.
- Store the created User ID in `Buyer.user`.
- Prevent duplicate Buyer profiles.
- Do not create Buyer profiles for ADMIN or VENDOR users.
- Keep the implementation extensible for future role-based profile creation.

## 3. Buyer APIs

| Method | Endpoint                  | Access              | Description                    |
| ------ | ------------------------- | ------------------- | ------------------------------ |
| GET    | `/buyers/me`              | Authenticated Buyer | Get own profile                |
| PATCH  | `/buyers/me`              | Authenticated Buyer | Update own profile             |
| DELETE | `/buyers/me`              | Authenticated Buyer | Delete own account             |
| GET    | `/buyers`                 | Admin, Vendor       | Get all buyers with pagination |
| GET    | `/buyers/:buyerId`        | Admin, Vendor       | Get buyer by ID                |
| PATCH  | `/buyers/:buyerId/status` | Admin only          | Update buyer account status    |

### GET `/buyers/me`

- Identify the buyer using the authenticated User ID.
- Return the Buyer profile with necessary public User information.
- Never expose password, refresh tokens, or other sensitive fields.

### PATCH `/buyers/me`

Allow updating:

- `phoneNumber`
- `gender`
- `address`
- `profile` image

Requirements:

- Use Zod validation.
- Update only supplied fields.
- Do not allow users to change their role or account status.
- Support `multipart/form-data`.
- Image upload must be optional.
- Return the updated Buyer profile.

### GET `/buyers`

- Admin and Vendor access only.
- Support pagination using `page` and `limit`.
- Return pagination metadata:
  - current page
  - page size
  - total buyers
  - total pages
- Follow existing project filtering and response conventions.

### GET `/buyers/:buyerId`

- Admin and Vendor access only.
- Validate buyer ID.
- Return the Buyer profile with public User information.
- Return NOT_FOUND if the Buyer does not exist.

### PATCH `/buyers/:buyerId/status`

- Admin access only.
- Update `User.status`, not `Buyer`.
- Use the existing AccountStatus enum.
- Follow existing account status business rules.

### DELETE `/buyers/me`

- Identify the buyer using the authenticated User ID.
- Preserve order and payment history.
- Follow the existing account deletion or soft-delete strategy.
- Revoke active sessions and refresh tokens.
- Clear authentication cookies.
- Prevent further account access.
- Use MongoDB transactions for related database operations.
- Delete the Cloudinary profile image only after the database operation succeeds and the image is no longer referenced.

## 4. Multer Configuration

Keep all Multer configuration and reusable utilities inside:

```text
src/
└── utils/
    └── multer/
        ├── multer.config.ts
        ├── multer.interface.ts
        └── index.ts
```

Requirements:

- Use `memoryStorage()`.
- Maximum file size: 5 MB (5242880 bytes).
- Accept only:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
- Reject unsupported MIME types and oversized files.
- Do not trust the original filename or extension.
- Handle Multer errors through the existing centralized error-handling system.
- Provide reusable configuration for `.single()`, `.array()`, and `.fields()` when needed.
- Limit the number of uploaded files where multiple uploads are supported.

## 5. Cloudinary Configuration

Keep Cloudinary configuration and reusable operations inside:

```text
src/
└── lib/
    └── cloudinary/
        ├── cloudinary.config.ts
        ├── cloudinary.upload.ts
        ├── cloudinary.delete.ts
        └── index.ts
```

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
IMAGE_MAX_SIZE=5242880
```

Requirements:

- Read credentials from environment variables.
- Validate environment variables using the existing configuration validation.
- Never hardcode credentials.
- Upload image buffers directly to Cloudinary.
- Use Cloudinary's `secure_url`, `public_id`, `width`, and `height`.
- Delete images using `public_id`, never by URL.
- Do not expose Cloudinary credentials or internal errors to clients.

### Cloudinary Upload Response

Use a reusable TypeScript interface:

```typescript
interface ICloudinaryUploadResponse {
  publicId: string;
  url: string;
  width: number;
  height: number;
}
```

Map Cloudinary's response fields as follows:

```typescript
{
  publicId: result.public_id,
  url: result.secure_url,
  width: result.width,
  height: result.height,
}
```

## 6. Image Upload and Update Workflow

### New Image Upload

1. Multer receives and validates the uploaded file.
2. Get the image buffer.
3. Upload the buffer to Cloudinary.
4. Retrieve `publicId`, `url`, `width`, and `height`.
5. Save those values in the Buyer `profile` object.
6. If the database operation fails, delete the newly uploaded Cloudinary image as cleanup.

### Profile Image Update

1. Receive the new image through Multer.
2. Validate the uploaded image.
3. Retrieve the existing profile image's `publicId`.
4. Upload the new image to Cloudinary first.
5. Update the Buyer profile with the new image information.
6. After successful database update, delete the old image from Cloudinary.
7. If uploading the new image fails, keep the old image unchanged.
8. If the database update fails, delete the newly uploaded image and preserve the old image.
9. If deleting the old image fails, do not roll back the successful database update. Log the cleanup failure and support retry/cleanup where available.

### Profile Image Removal

- Retrieve the existing `publicId`.
- Update the database profile image fields to their defaults.
- Delete the Cloudinary image only after the database update succeeds and the image is no longer referenced.
- If Cloudinary deletion fails, log the failure and support cleanup retry.

Never call Cloudinary operations inside a MongoDB transaction. Cloudinary is an external service and cannot participate in MongoDB transactions.

## 7. Upload Middleware

Keep reusable upload middleware inside:

```text
src/
└── middlewares/
    └── upload.middleware.ts
```

- Reuse the Multer configuration from `utils/multer/`.
- Use `.single("profile")` for Buyer profile image upload.
- Apply upload middleware only to routes that accept files.
- Ensure Multer errors are compatible with centralized error handling.

Example route flow:

```typescript
router.patch(
  "/me",
  authenticate,
  authorize(UserRole.BUYER),
  upload.single("profile"),
  validateRequest(updateBuyerProfileSchema),
  updateBuyerProfileController,
);
```

Adapt the middleware and validation order to the existing validation implementation so multipart fields are validated correctly.

## 8. Zod Validation

Create validation schemas for:

- Buyer profile update.
- Buyer ID parameters.
- Buyer status update.
- Pagination and filtering.

Requirements:

- Validate all supported fields.
- Reject unsupported fields.
- Validate gender using the existing Gender enum.
- Validate phone number and address according to existing project conventions.
- Validate multipart text fields appropriately.
- Do not allow clients to submit arbitrary Cloudinary metadata such as `publicId` or `url`.
- Image metadata must come from the Cloudinary upload response, not client input.

## 9. Expected Module Structure

```text
src/
├── lib/
│   └── cloudinary/
│       ├── cloudinary.config.ts
│       ├── cloudinary.upload.ts
│       ├── cloudinary.delete.ts
│       └── index.ts
│
├── utils/
│   └── multer/
│       ├── multer.config.ts
│       ├── multer.interface.ts
│       └── index.ts
│
├── middlewares/
│   └── upload.middleware.ts
│
└── modules/
    └── v1/
        └── buyer/
            ├── buyer.model.ts
            ├── buyer.interface.ts
            ├── buyer.validation.ts
            ├── buyer.constant.ts
            ├── buyer.service.ts
            ├── buyer.controller.ts
            └── buyer.route.ts
```

## 10. Architecture and Coding Requirements

- Follow the existing `project-overview.md`.
- Follow `architecture-context.md`.
- Follow `code-standards.md`.
- Follow `ai-workflow-rules.md`.
- Use the existing Modular Architecture.
- Use function-based implementations, not classes.
- Maintain separation of concerns.
- Keep controllers thin.
- Put business logic in services.
- Reuse existing authentication, authorization, validation, error-handling, and response utilities.
- Use MongoDB transactions for related database operations.
- Do not duplicate existing shared functionality.
- Do not introduce unnecessary dependencies or abstractions.
- Preserve existing API conventions and naming patterns.

## 11. Acceptance Criteria

- Buyer profile is automatically created when a BUYER account is registered.
- User, Verification, and Buyer creation are atomic in the registration transaction.
- Buyer profile image supports Cloudinary upload.
- Profile image metadata contains `publicId`, `url`, `width`, and `height`.
- Profile update safely replaces the previous image.
- Failed database operations clean up newly uploaded images.
- Cloudinary operations remain outside MongoDB transactions.
- Buyer APIs enforce correct authentication and authorization.
- Sensitive User information is never exposed.
- Account deletion preserves required business history.
- All validation and errors follow existing project conventions.

## Final Instruction

Before implementing, inspect the existing codebase and project context documents. Reuse existing utilities and conventions. Do not unnecessarily rewrite working authentication or shared infrastructure. Implement the Buyer module and Cloudinary/Multer integration consistently with the existing Jus Buy architecture.
