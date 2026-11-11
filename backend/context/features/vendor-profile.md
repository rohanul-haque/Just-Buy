# Jus Buy — Vendor Profile Management with Cloudinary & Multer

## 1. Vendor Model

Create the Vendor model with the following schema structure:

```typescript
const vendorProfileSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    licenceNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    profile: {
      publicId: { type: String, default: "" },
      url: { type: String, default: "" },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    nidFrontImage: {
      publicId: { type: String, default: "" },
      url: { type: String, default: "" },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    nidBackImage: {
      publicId: { type: String, default: "" },
      url: { type: String, default: "" },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    status: {
      type: String,
      enum: Object.values(VendorStatus),
      default: VendorStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### Image Structure

The following image fields must exist in all three image objects:

- `publicId`: Cloudinary public ID.
- `url`: Cloudinary secure URL.
- `width`: Image width.
- `height`: Image height.

Apply the same image structure to `profile`, `nidFrontImage`, and `nidBackImage`.

Do not store MIME type or unnecessary image metadata.

## 2. Automatic Vendor Profile Creation

- Whenever a User is created with the VENDOR role, automatically create a Vendor profile.
- Create User, Verification, and Vendor documents within the same MongoDB transaction.
- Store the created User ID in `Vendor.vendor`.
- Prevent duplicate Vendor profiles.
- Do not create Vendor profiles for BUYER or ADMIN users.
- Follow the existing authentication and registration workflow.
- Use the required Vendor registration fields and image uploads according to the existing project requirements.

## 3. Vendor APIs

| Method | Endpoint                    | Access               | Description                     |
| ------ | --------------------------- | -------------------- | ------------------------------- |
| GET    | `/vendors/me`               | Authenticated Vendor | Get own vendor profile          |
| PATCH  | `/vendors/me`               | Authenticated Vendor | Update own vendor profile       |
| GET    | `/vendors`                  | Admin only           | Get all vendors with pagination |
| GET    | `/vendors/:vendorId`        | Admin only           | Get vendor by ID                |
| PATCH  | `/vendors/:vendorId/status` | Admin only           | Update vendor status            |

### GET `/vendors/me`

- Identify the vendor using the authenticated User ID.
- Return the current Vendor profile with necessary public User information.
- Never expose password, refresh tokens, or sensitive User information.
- Return `NOT_FOUND` if the Vendor profile does not exist.

### PATCH `/vendors/me`

Allow vendors to update:

- `shopName`
- `location`
- `licenceNumber`
- `profile` image
- `nidFrontImage`
- `nidBackImage`

Requirements:

- Use Zod validation.
- Update only supplied fields.
- Support `multipart/form-data`.
- Image uploads must be optional during updates.
- Allow updating each image independently.
- Do not allow vendors to update their `vendor` reference or `status`.
- Check `licenceNumber` uniqueness.
- Return the updated Vendor profile.

### GET `/vendors`

- Admin access only.
- Return all vendors.
- Support pagination using `page` and `limit`.
- Return pagination metadata:
  - Current page.
  - Page size.
  - Total vendors.
  - Total pages.
- Follow existing filtering and response conventions.

### GET `/vendors/:vendorId`

- Admin access only.
- Validate Vendor ID.
- Return Vendor profile with necessary public User information.
- Never expose sensitive User information.
- Return `NOT_FOUND` if the Vendor does not exist.

### PATCH `/vendors/:vendorId/status`

- Admin access only.
- Update the Vendor `status` field.
- Use the existing `VendorStatus` enum.
- Follow existing Vendor status business rules.
- Do not change the associated User role.
- Vendor cannot update their own status.
- Do not send an update when the status is unchanged.

## 4. Multer Configuration

Reuse the existing Multer configuration from:

```text
src/
└── utils/
    └── multer/
```

Requirements:

- Use existing `memoryStorage()`.
- Maximum file size: 5 MB.
- Accept only supported image MIME types:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
- Reject unsupported MIME types and oversized files.
- Handle Multer errors through existing centralized error handling.
- Do not create duplicate Multer configurations.

### Upload Middleware

Reuse the existing middleware:

```text
src/middlewares/upload.middleware.ts
```

Use `upload.fields()` for Vendor image uploads:

```typescript
upload.fields([
  { name: "profile", maxCount: 1 },
  { name: "nidFrontImage", maxCount: 1 },
  { name: "nidBackImage", maxCount: 1 },
]);
```

Apply upload middleware only to routes that accept image uploads.

## 5. Cloudinary Configuration

Reuse the existing Cloudinary utilities from:

```text
src/
└── lib/
    └── cloudinary/
```

Requirements:

- Upload image buffers directly to Cloudinary.
- Store `publicId`, `url`, `width`, and `height`.
- Delete images using `publicId`, never by URL.
- Reuse existing upload and delete functions.
- Read credentials from existing environment configuration.
- Do not duplicate Cloudinary configuration.

### Cloudinary Response Mapping

Map Cloudinary response fields as follows:

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

1. Receive and validate images through Multer.
2. Upload image buffers to Cloudinary.
3. Retrieve `publicId`, `url`, `width`, and `height`.
4. Save the image information in the corresponding Vendor image field.
5. If the database operation fails, delete newly uploaded images from Cloudinary.

### Profile Image Update

1. Receive the new profile image through Multer.
2. Retrieve the existing profile image's `publicId`.
3. Upload the new image to Cloudinary.
4. Update the Vendor profile with the new image information.
5. After successful database update, delete the previous image using its `publicId`.
6. If the database update fails, delete the newly uploaded image and preserve the old image.
7. If deleting the old image fails, log the error without rolling back the successful database update.

### NID Image Update

Apply the same workflow independently to `nidFrontImage` and `nidBackImage`.

1. Receive the new NID image through Multer.
2. Retrieve the corresponding existing image's `publicId`.
3. Upload the new image to Cloudinary.
4. Update the corresponding Vendor image field.
5. After successful database update, delete the previous image.
6. If the database update fails, delete the newly uploaded image and preserve the old image.
7. If old image deletion fails, log the cleanup failure.

### Image Removal

- Retrieve the existing image's `publicId`.
- Reset the corresponding database image fields to their default values.
- Delete the Cloudinary image only after the database update succeeds and the image is no longer referenced.
- Log Cloudinary deletion failures for cleanup retry.

**Never perform Cloudinary operations inside MongoDB transactions.**

## 7. Zod Validation

Create validation schemas for:

- Vendor profile update.
- Vendor ID parameters.
- Vendor status update.
- Vendor pagination and filtering.

Requirements:

- Validate all supported fields.
- Reject unsupported fields.
- Validate status using the existing `VendorStatus` enum.
- Validate `licenceNumber` according to existing project conventions.
- Validate multipart text fields appropriately.
- Do not allow clients to submit arbitrary Cloudinary metadata such as `publicId` or `url`.
- Image metadata must come from Cloudinary responses.

## 8. Expected Vendor Module Structure

```text
src/
└── modules/
    └── v1/
        └── vendor/
            ├── vendor.model.ts
            ├── vendor.interface.ts
            ├── vendor.validation.ts
            ├── vendor.constant.ts
            ├── vendor.service.ts
            ├── vendor.controller.ts
            └── vendor.route.ts
```

## 9. Architecture and Coding Requirements

- Follow `project-overview.md`.
- Follow `architecture-context.md`.
- Follow `code-standards.md`.
- Follow `ai-workflow-rules.md`.
- Follow the existing Modular Architecture.
- Use function-based implementations, not classes.
- Maintain separation of concerns.
- Keep controllers thin.
- Put business logic in services.
- Reuse existing authentication, authorization, validation, error-handling, Multer, and Cloudinary utilities.
- Use MongoDB transactions for related database operations.
- Do not duplicate existing shared functionality.
- Do not introduce unnecessary dependencies or abstractions.
- Preserve existing API conventions and naming patterns.

## 10. Acceptance Criteria

- Vendor profile follows the specified schema.
- All three image fields contain `publicId`, `url`, `width`, and `height`.
- Vendor can view their current profile.
- Vendor can update all allowed profile fields.
- Vendor can upload and replace profile and NID images independently.
- Previous Cloudinary images are deleted after successful database updates.
- Failed database operations clean up newly uploaded images.
- Admin can view all vendors with pagination.
- Admin can view an individual Vendor.
- Admin can update Vendor status.
- Vendors cannot update their own status.
- Sensitive User information is never exposed.
- All APIs enforce correct authentication and authorization.
- All validation and errors follow existing project conventions.

## Final Instruction

Before implementation, inspect the existing codebase and project context documents. Reuse existing Multer and Cloudinary utilities. Do not unnecessarily rewrite existing authentication or shared infrastructure. Implement the Vendor module according to the existing Jus Buy architecture and coding standards.
