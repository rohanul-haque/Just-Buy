# Jus Buy — Admin Module Implementation Requirements

## 1. Admin Model

Create the Admin model using the following schema:

```typescript
const adminSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    profile: {
      type: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### Model Requirements

- `admin` references the User model.
- Each User can have only one Admin profile.
- `phoneNumber` is optional.
- `profile.type` stores the image MIME type.
- `profile.url` stores the Cloudinary secure URL.
- `profile.publicId` stores the Cloudinary public ID.
- Follow existing Mongoose model and TypeScript interface conventions.

## 2. Automatic Admin Profile Creation

Whenever a User is created with the `ADMIN` role, automatically create an Admin profile.

### Requirements

- Check the User role during User creation.
- If `role === UserRole.ADMIN`, create the corresponding Admin document automatically.
- Store the created User `_id` in `Admin.admin`.
- Create User and Admin documents within the same MongoDB transaction.
- If Admin profile creation fails, the User creation must also roll back.
- Prevent duplicate Admin profiles.
- Do not create an Admin profile for BUYER or VENDOR roles.
- Keep role-based profile creation extensible.

### Registration / User Creation Integration

Inspect all existing User creation flows and identify the appropriate centralized service or registration workflow.

Integrate Admin profile creation into the existing User creation process without duplicating logic.

Important:

- Do not create a separate User creation flow just for Admin.
- Do not modify unrelated authentication behavior.
- Reuse the existing MongoDB session and transaction.
- Pass the same session to both User and Admin database operations.
- Ensure all related database writes participate in the same transaction.

Example conceptual workflow:

```typescript
const session = await mongoose.startSession();

try {
  await session.withTransaction(async () => {
    const [createdUser] = await User.create(
      [
        {
          name,
          email,
          password,
          role: UserRole.ADMIN,
        },
      ],
      { session },
    );

    if (createdUser.role === UserRole.ADMIN) {
      await Admin.create(
        [
          {
            admin: createdUser._id,
          },
        ],
        { session },
      );
    }
  });
} finally {
  await session.endSession();
}
```

This is an architectural example. Adapt it to the existing User and Auth service implementation instead of blindly replacing existing code.

## 3. Admin Profile APIs

| Method | Endpoint     | Access              | Description              |
| ------ | ------------ | ------------------- | ------------------------ |
| GET    | `/admins/me` | Authenticated Admin | Get own Admin profile    |
| PATCH  | `/admins/me` | Authenticated Admin | Update own Admin profile |

### GET `/admins/me`

Requirements:

- Only authenticated Admin users can access this endpoint.
- Get the authenticated User ID from the existing authentication middleware.
- Find the Admin profile using the `admin` field.
- Populate necessary public User information.
- Never expose password, refresh tokens, or sensitive fields.
- Return NOT_FOUND if the Admin profile does not exist.
- Follow existing API response conventions.

### PATCH `/admins/me`

Allow updating:

- `phoneNumber`
- `profile` image

Requirements:

- Only authenticated Admin users can update their own profile.
- Identify the Admin using the authenticated User ID.
- Use Zod validation.
- Update only the supplied fields.
- Support `multipart/form-data`.
- Profile image upload must be optional.
- Do not allow clients to update `admin`, User role, account status, `profile.url`, `profile.publicId`, or other protected fields.
- Return the updated Admin profile.

## 4. Existing Multer Integration

Multer utilities already exist in:

```text
src/
└── utils/
    └── multer/
        ├── multer.config.ts
        ├── multer.interface.ts
        └── index.ts
```

Mandatory instructions:

- Inspect and reuse the existing Multer implementation.
- Do not create another Multer configuration.
- Do not duplicate file validation logic.
- Use the existing `memoryStorage()` configuration.
- Use the existing file size limit and accepted MIME types.
- Use `.single("profile")` for Admin profile image upload.
- Access the uploaded image through `req.file`.
- Upload the file buffer directly to Cloudinary.
- Handle Multer errors through the existing centralized error handler.

If any required functionality is missing from the existing Multer utility, extend the existing implementation instead of creating a duplicate.

## 5. Existing Cloudinary Integration

Cloudinary utilities already exist in:

```text
src/
└── lib/
    └── cloudinary/
        ├── cloudinary.config.ts
        ├── cloudinary.upload.ts
        ├── cloudinary.delete.ts
        └── index.ts
```

Mandatory instructions:

- Inspect and reuse the existing Cloudinary configuration.
- Reuse the existing upload utility.
- Reuse the existing delete utility.
- Do not initialize Cloudinary again inside the Admin module.
- Do not duplicate upload or delete functionality.
- Upload the image buffer directly to Cloudinary.
- Use Cloudinary's `secure_url` and `public_id`.
- Store the returned image information in the Admin profile.

### Profile Image Data

Save the following structure:

```typescript
{
  type: file.mimetype,
  url: cloudinaryResult.url,
  publicId: cloudinaryResult.publicId,
}
```

Adapt property names to the actual response interface of the existing Cloudinary utility.

## 6. Admin Profile Image Update Workflow

This workflow is mandatory.

When an Admin updates their profile image:

1. Receive the uploaded image using the existing Multer middleware.
2. Validate the uploaded image using the existing Multer configuration.
3. Find the Admin profile using the authenticated User ID.
4. Retrieve the existing profile image information.
5. Check whether an existing `profile.publicId` is available.
6. Upload the new image to Cloudinary.
7. Update the Admin document with the new image information.
8. After the database update succeeds, delete the previous Cloudinary image using its old `publicId`.
9. Return the updated Admin profile.

### Important Failure Handling

**If the new Cloudinary upload fails:**

- Do not update the database.
- Keep the existing profile image unchanged.

**If the database update fails after the new image upload:**

- Delete the newly uploaded Cloudinary image as cleanup.
- Keep the old profile image unchanged.
- Return the appropriate application error.

**If the old Cloudinary image deletion fails:**

- Do not roll back the successful database update.
- Keep the new profile image information in the database.
- Log the cleanup failure.
- Support retry or cleanup where the existing infrastructure allows it.

**If no previous `publicId` exists:**

- Upload the new image.
- Update the database.
- Do not attempt to delete a nonexistent old image.

Never delete the old image before the new image has been uploaded and the database update has succeeded.

Never perform Cloudinary operations inside MongoDB transactions.

## 7. Admin Validation

Create Zod validation for:

- Admin profile update.

Requirements:

- Validate `phoneNumber`.
- Allow only supported profile update fields.
- Reject unsupported fields.
- Handle multipart text fields correctly.
- Do not accept `admin`, role, status, `profile.url`, or `profile.publicId` from the client.
- Cloudinary image information must be generated by the backend.

## 8. Admin Routes

Use the existing authentication, authorization, Multer, and validation middleware.

Example:

```typescript
router.get(
  "/me",
  authenticate,
  authorize(UserRole.ADMIN),
  getAdminProfileController,
);

router.patch(
  "/me",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("profile"),
  validateRequest(updateAdminProfileSchema),
  updateAdminProfileController,
);
```

Adapt the route to the existing middleware and validation conventions. Ensure multipart fields are parsed before validation.

## 9. Expected Admin Module Structure

```text
src/
└── modules/
    └── v1/
        └── admin/
            ├── admin.model.ts
            ├── admin.interface.ts
            ├── admin.validation.ts
            ├── admin.constant.ts
            ├── admin.service.ts
            ├── admin.controller.ts
            └── admin.route.ts
```

Reuse existing shared utilities:

```text
src/
├── utils/
│   └── multer/
├── lib/
│   └── cloudinary/
└── middlewares/
    └── upload.middleware.ts
```

## 10. Architecture and Coding Requirements

- Follow `project-overview.md`.
- Follow `architecture-context.md`.
- Follow `code-standards.md`.
- Follow `ai-workflow-rules.md`.
- Follow the existing Modular Architecture.
- Use function-based implementations, not classes.
- Keep controllers thin.
- Keep business logic inside services.
- Reuse existing User creation and registration services.
- Reuse existing Multer and Cloudinary utilities.
- Reuse existing authentication and authorization middleware.
- Use MongoDB transactions for related database operations.
- Do not put external Cloudinary operations inside MongoDB transactions.
- Use centralized error handling.
- Follow existing API response conventions.
- Avoid unnecessary dependencies and abstractions.
- Do not rewrite working authentication functionality.

## 11. Acceptance Criteria

- Creating a User with `UserRole.ADMIN` automatically creates an Admin profile.
- User and Admin documents are created atomically in one MongoDB transaction.
- Creating BUYER or VENDOR users does not create an Admin profile.
- Authenticated Admin can retrieve their own profile.
- Authenticated Admin can update their phone number.
- Authenticated Admin can upload and replace their profile image.
- Existing Multer utilities are reused.
- Existing Cloudinary utilities are reused.
- Old Cloudinary images are deleted only after successful database updates.
- Newly uploaded images are cleaned up if database updates fail.
- Admin cannot update another Admin's profile through these endpoints.
- Admin cannot modify their User role or account status.
- Sensitive User information is never exposed.
- All errors and responses follow existing project conventions.

## Final Implementation Instructions

Before implementation, inspect:

1. Existing User model and User creation service.
2. Existing Auth registration flow and MongoDB transaction implementation.
3. Existing Admin module, if present.
4. Existing Buyer module for implementation patterns.
5. Existing Multer utilities inside `src/utils/multer/`.
6. Existing Cloudinary utilities inside `src/lib/cloudinary/`.
7. Existing authentication and authorization middleware.
8. All project context documents.

Implement the Admin module by extending the existing codebase.

Do not duplicate Multer or Cloudinary functionality. Do not create a second User creation flow. Preserve existing working functionality and follow the established project architecture.
