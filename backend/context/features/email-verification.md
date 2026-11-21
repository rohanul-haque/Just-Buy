# Feature 2: Email Verification System

## 1. Overview

The Email Verification System manages user email verification through a secure 5-digit OTP (One-Time Password).

The system allows users to:

- Request an email verification OTP.
- Verify their email using the OTP.
- Request a new OTP if the previous OTP expires or becomes invalid.
- Track failed OTP verification attempts.
- Prevent OTP brute-force attacks.
- Prevent repeated OTP requests through resend cooldown.
- Ensure each OTP can only be used once.

The verification system must follow secure, scalable, and production-ready practices.

### Technologies

- **MongoDB + Mongoose:** Store verification records and OTP hashes.
- **Redis:** Manage OTP resend cooldown and temporary rate-limiting data.
- **bcrypt or HMAC:** Secure OTP hashing.
- **Nodemailer:** Send verification emails.
- **Gmail SMTP:** Email delivery.
- **Zod:** Request validation.
- **MongoDB Transactions:** Ensure consistent verification updates.
- **Rate Limiting:** Prevent OTP abuse.

## 2. Verification Model

Create a separate Verification model to manage email verification information.

### Schema Structure

```typescript
const verificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    otp: {
      type: String,
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### Verification Fields

| Field           | Description                                |
| --------------- | ------------------------------------------ |
| user            | Reference to the associated User document  |
| otp             | Hashed OTP, excluded from default queries  |
| isEmailVerified | Indicates whether the email is verified    |
| emailVerifiedAt | Date when email verification was completed |
| attempts        | Tracks failed OTP verification attempts    |
| expiresAt       | OTP expiration timestamp                   |
| createdAt       | Record creation timestamp                  |
| updatedAt       | Last update timestamp                      |

### Verification Model Rules

- Create a Verification document during user registration.
- Associate it with the corresponding User.
- Maintain one Verification document per user.
- Enforce a unique index on the `user` field.
- Default `isEmailVerified` to false.
- Default `emailVerifiedAt` to null.
- Default `attempts` to zero.
- Store only hashed or keyed-hash OTP values.
- Keep OTP excluded from default Mongoose queries.
- Remove OTP after successful verification.
- Clear `expiresAt` after successful verification.
- Never delete verified Verification documents automatically.
- Enforce OTP expiration through application-level validation.

## 3. Verification APIs

| Method | Endpoint                   | Access | Description                    |
| ------ | -------------------------- | ------ | ------------------------------ |
| POST   | `/verification/send-otp`   | Public | Send an email verification OTP |
| POST   | `/verification/verify-otp` | Public | Verify email using OTP         |
| POST   | `/verification/resend-otp` | Public | Resend verification OTP        |

## 4. Send Verification OTP

**Endpoint:** `POST /verification/send-otp`

**Access:** Public

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Features

- Validate email address using Zod.
- Normalize email by trimming whitespace and converting it to lowercase.
- Find the registered user by email.
- Find the associated Verification document.
- Check whether the email is already verified.
- Reject OTP generation for already verified accounts.
- Check whether an active OTP already exists and is still valid.
- Prevent unnecessary OTP regeneration when an active OTP is available.
- Generate a cryptographically secure 5-digit numeric OTP.
- Hash the generated OTP before storing it in MongoDB.
- Update the Verification document with the new OTP hash.
- Set OTP expiration to 5 minutes.
- Reset verification attempts to zero when issuing a new OTP.
- Send the OTP email using Nodemailer and Gmail SMTP.
- Apply IP-based rate limiting to prevent excessive OTP requests.
- Return an appropriate response without unnecessarily exposing account existence.

### OTP Configuration

| Rule                          | Configuration |
| ----------------------------- | ------------- |
| OTP Length                    | 5 digits      |
| OTP Expiration                | 5 minutes     |
| Maximum Verification Attempts | 5             |
| OTP Storage                   | MongoDB       |
| OTP Format                    | Numeric       |

### Business Rules

- Only registered users can request email verification.
- Already verified users cannot request another verification OTP.
- A new OTP must invalidate any previous OTP.
- OTP must be stored as a hash.
- OTP must never be returned in the API response.
- Send the email after the database update succeeds.
- Handle email delivery failures through retry or outbox processing.

## 5. Verify Email OTP

**Endpoint:** `POST /verification/verify-otp`

**Access:** Public

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "12345"
}
```

### Features

- Validate email and OTP using Zod.
- Normalize the email address.
- Find the registered User document.
- Find the associated Verification document.
- Retrieve OTP using `.select("+otp")`.
- Check whether the email is already verified.
- Check whether an OTP exists.
- Check whether the OTP has expired.
- Check whether the maximum verification attempts have been reached.
- Compare the submitted OTP against the stored hash.
- Increment failed attempts when the OTP is incorrect.
- Block verification after reaching the maximum failed attempt limit.
- Mark `isEmailVerified` as true after successful verification.
- Set `emailVerifiedAt` to the current date.
- Remove the used OTP from the Verification document.
- Clear the OTP expiration timestamp.
- Perform verification updates atomically.
- Use a MongoDB transaction when multiple database records require coordinated updates.
- Ensure the same OTP cannot be used more than once.

### Verification Rules

- OTP must contain exactly 5 numeric digits.
- OTP expires after 5 minutes.
- Maximum failed attempts: 5.
- Expired OTPs must be rejected.
- Invalid OTP attempts must be tracked.
- Verification must be blocked after 5 failed attempts.
- Successfully verified OTPs cannot be reused.
- Already verified email addresses cannot be verified again.
- OTP must be removed after successful verification.

### Failed Attempt Handling

- Increment `attempts` only when OTP comparison fails.
- Use an atomic conditional database update to prevent concurrent requests from bypassing the attempt limit.
- Do not increment attempts for malformed request data.
- Reject further attempts once the maximum limit is reached.
- A newly issued OTP resets the attempt counter to zero.

## 6. Resend Verification OTP

**Endpoint:** `POST /verification/resend-otp`

**Access:** Public

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Features

- Validate email address using Zod.
- Normalize the email address.
- Find the registered User document.
- Find the associated Verification document.
- Check whether the email is already verified.
- Prevent OTP resend requests for verified accounts.
- Check resend cooldown using Redis.
- Generate a new cryptographically secure 5-digit OTP.
- Hash the newly generated OTP.
- Replace the previous OTP hash in MongoDB.
- Reset verification attempts to zero.
- Set the new OTP expiration to 5 minutes.
- Invalidate the previous OTP immediately after the new OTP is persisted.
- Send the new OTP email using Nodemailer and Gmail SMTP.
- Apply IP-based rate limiting to prevent OTP spam.

### Resend Rules

| Rule                          | Configuration              |
| ----------------------------- | -------------------------- |
| Resend Cooldown               | 60 seconds                 |
| OTP Length                    | 5 digits                   |
| OTP Expiration                | 5 minutes                  |
| Maximum Verification Attempts | 5                          |
| Attempt Reset                 | On successful OTP issuance |

### Additional Rules

- A new OTP must replace the previous OTP.
- Previous OTPs must become invalid after successful resend.
- Resend cooldown must be enforced through Redis.
- Use atomic Redis operations to prevent concurrent resend requests from bypassing cooldown.
- Do not resend OTP to verified users.
- Do not reset attempts if OTP issuance fails.
- Send email only after the new OTP has been successfully persisted.
- Handle email delivery failures through retry or outbox processing.

## 7. Redis Integration

Use Redis inside the Verification or Auth integration layer to manage temporary verification-related data.

### Responsibilities

- Manage OTP resend cooldown.
- Apply IP-based OTP request rate limiting.
- Apply IP-based verification endpoint rate limiting where configured.
- Prevent repeated OTP requests within the cooldown period.
- Manage temporary verification rate-limit counters.
- Automatically expire temporary keys using TTL.

### Redis Key Structure

```text
verification:otp-cooldown:{email}
verification:send-attempts:ip:{ip}
verification:verify-attempts:ip:{ip}
```

### Redis Security Rules

- Never store plain-text OTPs.
- Do not use Redis as the primary OTP storage.
- Store OTP hashes in MongoDB Verification documents.
- Set TTL for every temporary Redis key.
- Use atomic Redis operations for cooldown and rate-limit counters.
- Normalize email addresses before generating Redis keys.
- Use a consistent IP extraction strategy behind trusted proxies.
- Handle Redis connection failures gracefully.

## 8. Email Notification

Use the centralized Auth Email Service to send verification OTP emails.

### Verification OTP Email Features

- Include Jus Buy branding and logo.
- Include the user's name.
- Include the 5-digit verification OTP.
- Mention the OTP expiration time.
- Include email verification instructions.
- Inform users not to share their OTP.
- Use a professional responsive HTML email template.
- Support dynamic template variables.

### Email Sending Rules

- Use Nodemailer with Gmail SMTP.
- Do not send emails directly from controllers.
- Use the centralized email service.
- Send emails after successful database updates.
- Implement retry handling for temporary delivery failures.
- Never log OTP values or sensitive email contents.

## 9. Zod Validation

Use centralized Zod validation for all Verification API requests.

### Send OTP Validation

- `email`: Required valid email address.

### Verify OTP Validation

- `email`: Required valid email address.
- `otp`: Required string containing exactly 5 numeric digits.

### Resend OTP Validation

- `email`: Required valid email address.

### Validation Rules

- Normalize email addresses.
- Trim string inputs where appropriate.
- Reject invalid or unexpected input.
- Validate OTP format before business logic execution.
- Keep validation separate from controller and service logic.
- Use TypeScript types inferred from Zod schemas.
- Return consistent validation error responses.

## 10. Rate Limiting

| Endpoint          | Limit                               |
| ----------------- | ----------------------------------- |
| Send OTP          | Configurable requests per IP        |
| Verify OTP        | 5 failed attempts per OTP           |
| Resend OTP        | 60-second cooldown                  |
| Verification APIs | Configurable IP-based rate limiting |

### General Rules

- Return HTTP 429 when rate limits are exceeded.
- Use Redis-backed rate limiting in production.
- Configure rate limits centrally.
- Prevent brute-force attacks.
- Prevent OTP request spam.
- Use atomic Redis operations for concurrent request safety.
- Avoid exposing sensitive account information.

## 11. MongoDB Transaction Rules

Use MongoDB transactions when related database updates must succeed or fail together.

### Send OTP

1. Validate request data.
2. Generate OTP and hash it.
3. Update the Verification document.
4. Set OTP expiration.
5. Reset attempts.
6. Persist the database update.
7. Send verification email after successful persistence.

### Verify OTP

1. Validate request data.
2. Retrieve the Verification document.
3. Check OTP expiration and attempt limit.
4. Compare the submitted OTP.
5. Increment attempts atomically if OTP is incorrect.
6. Start a transaction after successful OTP comparison.
7. Update `isEmailVerified`.
8. Set `emailVerifiedAt`.
9. Remove OTP and clear expiration.
10. Commit the transaction.

### Resend OTP

1. Validate request data.
2. Check user and verification status.
3. Acquire resend cooldown atomically through Redis.
4. Generate and hash a new OTP.
5. Update the Verification document.
6. Reset attempts and set new expiration.
7. Send email after successful database update.

### General Rules

- Use Mongoose sessions for multi-document transactions.
- Pass the session to related database operations.
- Commit successful transactions.
- Abort transactions on failure.
- End sessions in a `finally` block.
- Never perform Redis or SMTP operations inside a MongoDB transaction.
- Use conditional atomic updates to prevent concurrent OTP verification or resend races.
- Use retry handling or a transactional outbox for reliable email delivery.

## 12. Security Requirements

### OTP Security

- Generate OTPs using a cryptographically secure random generator.
- Generate exactly 5 numeric digits.
- Store only hashed or keyed-hash OTP values.
- Keep OTP excluded from default Mongoose queries.
- Set OTP expiration to 5 minutes.
- Limit failed verification attempts to 5.
- Prevent OTP reuse.
- Invalidate previous OTPs after successful resend.
- Never log OTP values.
- Never expose OTP values in API responses.

### Verification Security

- Verify email addresses only through valid OTPs.
- Prevent verification attempts after the maximum failure limit.
- Use atomic updates to prevent concurrent attempt bypass.
- Prevent repeated resend requests through Redis cooldown.
- Reject expired OTPs.
- Prevent already verified users from requesting additional OTPs.

### API Security

- Validate all incoming requests using Zod.
- Apply IP-based rate limiting.
- Use generic responses where appropriate to prevent account enumeration.
- Never expose internal database details.
- Use centralized error handling.
- Protect against brute-force and OTP spam attacks.

## 13. Environment Variables

```env
# OTP
OTP_LENGTH=5
OTP_EXPIRES_IN=300
OTP_RESEND_COOLDOWN=60
OTP_MAX_ATTEMPTS=5

# Verification Rate Limiting
VERIFICATION_SEND_MAX_ATTEMPTS=
VERIFICATION_SEND_RATE_LIMIT_WINDOW=
VERIFICATION_VERIFY_MAX_REQUESTS=
VERIFICATION_VERIFY_RATE_LIMIT_WINDOW=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# Gmail SMTP / Nodemailer
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

All credentials and secrets must be stored in environment variables and must never be committed to version control.

## 14. Expected Module Structure

```text
src/
├── modules/
│   ├── auth/
│   │   ├── auth.interface.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.constant.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   ├── auth.utils.ts
│   │   │
│   │   ├── redis/
│   │   │   ├── redis.service.ts
│   │   │   └── redis.interface.ts
│   │   │
│   │   └── email/
│   │       ├── email.service.ts
│   │       ├── email.interface.ts
│   │       ├── email.constant.ts
│   │       ├── email.transporter.ts
│   │       └── templates/
│   │           └── verification.template.ts
│   │
│   └── verification/
│       ├── verification.interface.ts
│       ├── verification.validation.ts
│       ├── verification.constant.ts
│       ├── verification.model.ts
│       ├── verification.service.ts
│       ├── verification.controller.ts
│       ├── verification.route.ts
│       └── verification.utils.ts
│
├── middlewares/
│   └── rate-limiter.middleware.ts
│
└── utils/
    └── ...
```

### Module Responsibilities

**Verification Module**

- Manage email verification records.
- Maintain the Verification model.
- Generate and verify OTPs.
- Manage OTP expiration.
- Track failed verification attempts.
- Handle OTP resend operations.
- Coordinate verification-related Redis cooldown operations.
- Coordinate verification email delivery through the Auth Email Service.

**Auth Module**

- Handle registration, login, logout, and token management.
- Handle password reset.
- Maintain authentication-specific business logic.
- Provide centralized email and Redis integrations.

**Auth Redis Service**

- Manage authentication-related Redis operations.
- Manage verification resend cooldown.
- Track login attempts and cooldowns.
- Manage temporary password reset tokens.
- Handle Redis key management.

**Auth Email Service**

- Configure Nodemailer and Gmail SMTP.
- Send verification OTP emails.
- Send role-based welcome emails.
- Send password reset emails.
- Manage reusable HTML email templates.

### Architecture Rules

- Keep Verification model and business logic inside the Verification module.
- Keep authentication-related Redis integration inside the Auth module.
- Keep Email service inside the Auth module.
- Reuse the centralized Auth Email Service from the Verification module.
- Do not duplicate Redis or email functionality.
- Keep controllers responsible for request and response handling.
- Keep business logic inside services.
- Follow Modular Architecture and Separation of Concerns.

## 15. Acceptance Criteria

### Verification Model

- [ ] A Verification document is created during user registration.
- [ ] Every user has one associated Verification document.
- [ ] Verification status defaults to false.
- [ ] OTP is stored as a hash.
- [ ] OTP is excluded from default queries.
- [ ] Verification attempts default to zero.
- [ ] Verified email timestamp is stored correctly.

### Send OTP

- [ ] Users can request a verification OTP.
- [ ] OTP contains exactly 5 numeric digits.
- [ ] OTP is securely hashed before MongoDB storage.
- [ ] OTP expires after 5 minutes.
- [ ] Existing OTP is replaced when a new OTP is issued.
- [ ] Attempts reset to zero after new OTP issuance.
- [ ] Verification email is sent through Nodemailer and Gmail SMTP.
- [ ] Already verified users cannot request another OTP.

### Verify OTP

- [ ] Users can verify their email using
