# Feature 1: Authentication System

## 1. Overview

The Authentication System handles user registration, login, logout, token management, email verification, and password reset functionality.

The system must provide secure authentication using:

- **bcrypt:** Password hashing.
- **JWT:** Access and refresh token generation.
- **HTTP-only Cookies:** Secure token storage.
- **Redis:** OTP management, login attempt tracking, and temporary authentication data.
- **MongoDB Transactions:** Multi-document database operations.
- **Nodemailer:** Email sending and delivery management.
- **Gmail SMTP:** Gmail-based email delivery service.
- **Zod:** Request data validation.
- **Rate Limiting:** Protection against authentication abuse.

The authentication system must follow secure, scalable, and production-ready practices.

## 2. User Model

Create a centralized User model to manage authentication and user account information.

### Schema Structure

```typescript
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },

    verification: {
      type: Schema.Types.ObjectId,
      ref: "Verification",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
```

### User Fields

| Field        | Description                      |
| ------------ | -------------------------------- |
| name         | User's full name                 |
| email        | Unique email address             |
| password     | Hashed user password             |
| status       | Account status                   |
| verification | Reference to Verification model  |
| role         | User role (BUYER, VENDOR, ADMIN) |
| createdAt    | Account creation timestamp       |
| updatedAt    | Last update timestamp            |

### User Model Rules

- Email addresses must be unique.
- Store email addresses in lowercase.
- Hash passwords using bcrypt.
- Never return passwords in API responses.
- Keep password excluded from default Mongoose queries.
- Assign BUYER as the default registration role.
- Public registration must never allow users to assign ADMIN privileges.
- Manage email verification through a separate Verification model.

## 3. Verification Model

Create a separate Verification model.

### Required Fields

- `user`: Reference to the User model.
- `isEmailVerified`: Boolean indicating email verification status.
- `emailVerifiedAt`: Date when email verification was completed.
- `createdAt`: Record creation timestamp.
- `updatedAt`: Last update timestamp.

### Verification Rules

- Create a Verification document during user registration.
- Associate it with the corresponding User.
- Default `isEmailVerified` to false.
- Update verification status after successful OTP verification.
- Never store OTP values in the Verification document.
- Store temporary OTP data in Redis.

## 4. Authentication APIs

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/auth/register`        | Create a new user account          |
| POST   | `/auth/login`           | Authenticate an existing user      |
| POST   | `/auth/logout`          | Log out the authenticated user     |
| POST   | `/auth/refresh-token`   | Generate new authentication tokens |
| POST   | `/auth/verify-email`    | Verify email using OTP             |
| POST   | `/auth/resend-otp`      | Resend verification OTP            |
| POST   | `/auth/forgot-password` | Request password reset             |
| POST   | `/auth/reset-password`  | Reset user password                |

## 5. User Registration

Allow new users to register using:

- Name
- Email
- Password

### Registration Process

1. Validate registration information using Zod.
2. Normalize the email address.
3. Check whether the email already exists.
4. Validate password requirements.
5. Hash the password using bcrypt.
6. Generate a secure 5-digit numeric OTP.
7. Start a MongoDB transaction.
8. Create a Verification document.
9. Create a User document with the Verification reference.
10. Commit the transaction.
11. Store the hashed OTP in Redis.
12. Send the verification OTP email using Nodemailer and Gmail SMTP.
13. Send a role-based welcome email using Nodemailer and Gmail SMTP.

### Registration Rules

- Default role must be BUYER.
- Passwords must never be stored as plain text.
- Every newly registered user must have a Verification reference.
- Email verification must initially remain pending.
- Send OTP to the registered email address.
- Send a welcome email using the assigned user's role.
- Send emails only after successful database commit.
- Handle email delivery failures without corrupting database records.
- Do not accept privileged roles through public registration.

### Registration Rate Limiting

A single IP address can request account registration a maximum of 5 times within the configured time window.

- Maximum requests: 5.
- Apply rate limiting to registration.
- Return HTTP 429 when the limit is exceeded.
- Configure the time window centrally.
- Use Redis-backed rate limiting in production.

## 6. Login

### Login Process

1. Validate login credentials using Zod.
2. Normalize the email address.
3. Check IP-based login rate limits.
4. Check email-based login rate limits.
5. Find the user using normalized email.
6. Retrieve password using Mongoose's `select: false` override.
7. Compare password using bcrypt.
8. If authentication fails, increment failed-attempt counters in Redis.
9. If authentication succeeds, check account status.
10. Check email verification status according to authentication policy.
11. Generate JWT access and refresh tokens.
12. Store tokens in HTTP-only cookies.
13. Return an appropriate authentication response.

### Login Rules

- Reject invalid credentials.
- Reject suspended, blocked, or inactive accounts.
- Prevent unverified users from accessing protected buyer features.
- Never expose passwords or JWT secrets.
- Allow a maximum of 5 failed login attempts per IP within the configured time window.
- Allow a maximum of 5 failed login attempts per normalized email within the configured time window.
- Apply temporary cooldown after reaching the maximum failed attempts.
- Return HTTP 429 when the configured limit is exceeded.
- Use generic authentication error messages to prevent account enumeration.
- Track failed login attempts using Redis.
- Successful authentication must not be used to bypass an active IP-based rate limit.
- Use a rolling time window or equivalent expiration-based strategy for failed attempts.

### Login Rate Limiting

| Rule                              | Configuration |
| --------------------------------- | ------------- |
| Maximum failed attempts per IP    | 5             |
| Maximum failed attempts per email | 5             |
| Rate-limit window                 | 15 minutes    |
| Temporary cooldown                | 15 minutes    |
| Storage                           | Redis         |
| Exceeded response                 | HTTP 429      |

### Login Rate Limiting Rules

- Track failed login attempts separately by IP and normalized email.
- Increment counters only for failed authentication attempts.
- Apply IP-based and email-based limits together.
- When either limit is exceeded, reject further login attempts until the applicable cooldown expires.
- Use Redis TTL to expire attempt counters and temporary lockout keys.
- Do not permanently lock user accounts based only on failed login attempts.
- Avoid exposing whether an email address exists.
- Use atomic Redis operations or Lua scripts to prevent concurrent requests from bypassing attempt limits.
- Reset or expire email-based failed-attempt counters according to the configured policy after successful authentication.
- Keep IP-based protection independent of successful login.

## 7. Logout

- Identify the authenticated user or session.
- Revoke the associated refresh token or session.
- Clear authentication cookies.
- Return a successful logout response.

## 8. JWT Token Management

### Access Token

- Used for protected API authentication.
- Must have a short expiration time.
- Must contain necessary user identification and authorization claims.

### Refresh Token

- Used to generate new access tokens.
- Must have a longer expiration time.
- Must support rotation and revocation.
- Must be managed through a secure session strategy.

### Security Rules

- Use separate secrets for access and refresh tokens.
- Store secrets in environment variables.
- Verify token signatures and expiration.
- Reject expired, invalid, or revoked tokens.
- Implement refresh-token rotation.

## 9. Cookie Management

Store authentication tokens using HTTP-only cookies.

- `httpOnly: true`
- Configure `secure` based on deployment environment.
- Configure `sameSite` appropriately.
- Set cookie expiration according to token expiration.
- Use appropriate cookie paths and domain settings.
- Apply CSRF protection where required.

## 10. Email Verification System

Every newly registered user must verify their email using a 5-digit OTP.

### OTP Generation

- Generate a cryptographically secure random 5-digit numeric OTP.
- Generate OTP during registration.
- Send OTP using Nodemailer and Gmail SMTP.
- Store only the hashed OTP in Redis.
- Set OTP expiration to 5 minutes.
- Never store OTP in the User document.
- Never log OTP values in production.

### OTP Verification Process

1. Receive email and OTP.
2. Retrieve OTP data from Redis.
3. Check OTP existence and expiration.
4. Compare submitted OTP against stored hash.
5. Reject invalid or expired OTPs.
6. Start a MongoDB transaction.
7. Update `isEmailVerified` to true.
8. Set `emailVerifiedAt`.
9. Commit the transaction.
10. Delete OTP and attempt keys from Redis.

### OTP Rules

- OTP must contain exactly 5 numeric digits.
- OTP expires after 5 minutes.
- Maximum verification attempts: 5.
- OTP must be single-use.
- Invalidate OTP after successful verification.

## 11. OTP Resend

### Resend Process

1. Receive user's email address.
2. Check whether the account exists.
3. Check email verification status.
4. Check resend cooldown in Redis.
5. Generate a new 5-digit OTP.
6. Hash and store the new OTP in Redis.
7. Invalidate previous OTP.
8. Send a new OTP email using Nodemailer and Gmail SMTP.
9. Return an appropriate response.

### Resend Rules

- Apply a 60-second cooldown.
- Generate a new OTP for every accepted request.
- Previous OTP must become invalid.
- Do not resend OTP to verified accounts.
- Apply rate limiting to prevent abuse.

## 12. Redis Integration

Use Redis inside the Auth module for temporary authentication data management.

### Responsibilities

- Store hashed verification OTPs.
- Manage OTP expiration.
- Manage OTP resend cooldown.
- Track OTP verification attempts.
- Track failed login attempts by IP.
- Track failed login attempts by email.
- Manage temporary login cooldowns.
- Store temporary password reset tokens.
- Support authentication-related temporary data.

### Redis Key Structure

```text
auth:otp:{email}
auth:otp-attempts:{email}
auth:otp-cooldown:{email}

auth:login-attempts:ip:{ip}
auth:login-attempts:email:{email}
auth:login-cooldown:ip:{ip}
auth:login-cooldown:email:{email}

auth:password-reset:{userId}
```

### Security Rules

- Never store plain-text OTPs.
- Set TTL for every temporary authentication key.
- Delete OTP keys after successful verification.
- Apply maximum verification attempt limits.
- Track login attempts separately by IP and email.
- Use atomic Redis operations for rate-limit counters.
- Use centralized Redis key naming conventions.
- Normalize email addresses before generating Redis keys.
- Use a consistent IP extraction strategy behind trusted proxies.
- Handle Redis connection failures gracefully.
- Avoid trusting arbitrary client-provided IP headers.

## 13. Password Reset

### Forgot Password Process

1. Receive registered email.
2. Validate the request using Zod.
3. Generate a cryptographically secure reset token.
4. Store a hashed reset token in Redis with expiration.
5. Send a password reset email using Nodemailer and Gmail SMTP.
6. Return a generic response to prevent account enumeration.

### Reset Password Process

1. Receive reset token and new password.
2. Validate the request using Zod.
3. Retrieve reset-token data from Redis.
4. Verify the token.
5. Hash the new password using bcrypt.
6. Start a MongoDB transaction.
7. Update the User password.
8. Revoke existing refresh-token sessions.
9. Commit the transaction.
10. Delete the reset token from Redis.
11. Send password reset confirmation email using Nodemailer.

### Password Reset Rules

- Reset tokens must be cryptographically secure.
- Store only hashed reset tokens.
- Reset tokens must have limited expiration.
- Reset tokens must be single-use.
- Never store plain-text passwords.
- Invalidate existing sessions after successful reset.
- Do not automatically log in users after password reset.

## 14. Email Service Integration

Use **Nodemailer with Gmail SMTP** as the centralized email delivery solution inside the Auth module.

### Technology

| Technology            | Responsibility                              |
| --------------------- | ------------------------------------------- |
| Nodemailer            | Email sending and transport management      |
| Gmail SMTP            | Gmail-based email delivery                  |
| HTML Templates        | Professional email design                   |
| Environment Variables | Gmail credentials and configuration         |
| BullMQ + Redis        | Optional background email queue and retries |

### Email Service Responsibilities

- Configure Nodemailer transporter.
- Connect to Gmail SMTP.
- Centralize email sending logic.
- Support reusable HTML email templates.
- Support dynamic template variables.
- Handle email delivery errors.
- Support background processing and retries.
- Keep email templates separate from business logic.
- Never expose email credentials.

### Gmail SMTP Configuration

```typescript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});
```

Use a Gmail App Password for SMTP authentication when Gmail 2-Step Verification is enabled.

Never use the regular Gmail account password.

### Email Sending Rules

- Use a centralized reusable email service.
- Use a single configured transporter.
- Verify SMTP configuration during application startup.
- Handle SMTP connection and delivery failures.
- Use configured sender address in the `from` field.
- Do not send emails directly from controllers.
- Send emails after successful database commit.
- Use retry handling for temporary delivery failures.
- Never log OTPs, passwords, reset tokens, or Gmail credentials.

## 15. Email Templates

Create reusable responsive HTML email templates inside the Auth module.

### Supported Email Types

1. Email verification OTP.
2. Welcome email.
3. OTP resend email.
4. Password reset email.
5. Password reset confirmation email.

### Verification Email

Must include:

- Jus Buy logo and branding.
- User's name.
- 5-digit OTP.
- OTP expiration time.
- Email verification instructions.
- Professional responsive HTML layout.

### Role-Based Welcome Email

Send a welcome email according to the assigned user role.

| Role   | Theme Color | Email Content                           |
| ------ | ----------- | --------------------------------------- |
| BUYER  | Blue        | Shopping benefits and product discovery |
| VENDOR | Green       | Shop management, products, and orders   |
| ADMIN  | Purple      | Platform administration and management  |

Every welcome email must include:

- Jus Buy branding.
- Role-specific color theme.
- Personalized greeting.
- Role-specific welcome message.
- Relevant platform information.
- Responsive HTML design.

### Role Security

- Public registration defaults to BUYER.
- Public users cannot assign themselves ADMIN.
- VENDOR and ADMIN roles must be assigned through authorized workflows.
- Welcome email must reflect the actual assigned role.

## 16. Email Delivery Reliability

- Send emails after successful database transaction commit.
- Never send emails inside active MongoDB transactions.
- Email failure must not corrupt committed database records.
- Implement retry handling for temporary delivery failures.
- Consider BullMQ with Redis for background email processing.
- Use a transactional outbox pattern for reliable delivery of critical registration emails.
- Log delivery failures without exposing sensitive information.
- Keep email delivery independent of business logic.

## 17. MongoDB Transactions

Use MongoDB transactions whenever multiple related database writes must succeed or fail together.

### User Registration Transaction

1. Validate registration information using Zod.
2. Check email availability.
3. Hash password.
4. Start MongoDB transaction.
5. Create Verification document.
6. Create User document with Verification reference.
7. Commit transaction.
8. Store hashed OTP in Redis.
9. Send verification email through Nodemailer and Gmail SMTP.
10. Send role-based welcome email through Nodemailer and Gmail SMTP.

If any database operation fails, abort the transaction.

Redis and email operations are external to MongoDB transactions. Use retry handling or a transactional outbox pattern to handle external side effects reliably.

### Email Verification Transaction

1. Validate OTP through Redis.
2. Start MongoDB transaction.
3. Update Verification document.
4. Set verification status and timestamp.
5. Commit transaction.
6. Delete OTP and attempt keys from Redis.

### Password Reset Transaction

1. Validate reset token.
2. Hash new password.
3. Start MongoDB transaction.
4. Update User password.
5. Revoke database-backed sessions where applicable.
6. Commit transaction.
7. Delete reset token from Redis.
8. Send confirmation email.

### General Rules

- Use Mongoose sessions.
- Pass the session to related database operations.
- Commit successful transactions.
- Abort transactions on failure.
- End sessions in a finally block.
- Never perform external SMTP or Redis operations inside a database transaction.

## 18. Zod Validation

Use Zod for validating all incoming authentication request data.

### Validation Responsibilities

- Validate registration data.
- Validate login credentials.
- Validate email addresses.
- Validate password requirements.
- Validate OTP format.
- Validate resend OTP requests.
- Validate forgot password requests.
- Validate reset password requests.
- Validate refresh token-related input when applicable.

### Validation Rules

- Use centralized Zod schemas.
- Normalize email addresses.
- Trim string inputs where appropriate.
- Reject invalid or unexpected input.
- Validate OTP as exactly 5 numeric digits.
- Keep request validation separate from business logic.
- Return consistent validation error responses.
- Use TypeScript types inferred from Zod schemas where appropriate.

### Expected Validation File

```text
modules/
└── auth/
    └── auth.validation.ts
```

## 19. Rate Limiting

| Endpoint        | Limit                                                 |
| --------------- | ----------------------------------------------------- |
| Register        | 5 requests per IP within configured window            |
| Login           | Maximum 5 failed attempts per IP within 15 minutes    |
| Login           | Maximum 5 failed attempts per email within 15 minutes |
| Verify Email    | 5 attempts per OTP                                    |
| Resend OTP      | 60-second cooldown                                    |
| Forgot Password | Configurable request limit                            |
| Reset Password  | Configurable request limit                            |

### General Rules

- Return HTTP 429 when limits are exceeded.
- Use centralized rate-limiting middleware.
- Use Redis-backed rate limiting in production.
- Prevent brute-force attacks.
- Configure limits centrally.
- Avoid exposing sensitive account information.
- Use atomic counter operations where concurrent requests can cause race conditions.

### Login Rate Limiting Rules

- Allow a maximum of 5 failed login attempts per IP within the configured time window.
- Allow a maximum of 5 failed login attempts per normalized email within the configured time window.
- Apply IP-based and email-based limits together.
- Track failed attempts using Redis.
- Increment counters only for failed authentication attempts.
- Apply a temporary cooldown after reaching the maximum attempts.
- Return HTTP 429 when a configured limit is exceeded.
- Do not permanently lock user accounts based only on failed login attempts.
- Use generic authentication errors to prevent account enumeration.
- Use rolling time windows or equivalent expiration-based tracking.
- Do not allow successful login to bypass an active IP-based cooldown.
- Reset or expire email-based failed-attempt counters according to the configured policy after successful authentication.
- Use atomic Redis operations or Lua scripts to prevent concurrent requests from bypassing the limits.
- Configure trusted proxy handling to identify client IP addresses safely.

## 20. Security Requirements

### Password Security

- Use bcrypt for password hashing.
- Never store plain-text passwords.
- Exclude password fields from default queries.
- Validate password strength.

### OTP Security

- Use cryptographically secure random generation.
- Generate exactly 5 numeric digits.
- Store only hashed OTPs.
- Set expiration time.
- Limit verification attempts.
- Prevent OTP reuse.

### JWT Security

- Use separate secrets for access and refresh tokens.
- Use environment variables.
- Configure token expiration.
- Verify token signatures.
- Implement rotation and revocation.

### Email Security

- Use Gmail App Password for SMTP authentication.
- Store Gmail credentials in environment variables.
- Never expose SMTP credentials.
- Never log sensitive email contents or OTPs.
- Validate email addresses before sending.
- Handle SMTP failures safely.

### Cookie Security

- Use HTTP-only cookies.
- Configure secure and sameSite attributes.
- Apply CSRF protection where required.

### Login Security

- Limit login attempts by IP address.
- Limit login attempts by normalized email address.
- Apply temporary cooldown after repeated failed attempts.
- Use Redis-backed attempt tracking.
- Use generic authentication error messages.
- Prevent brute-force attacks.
- Avoid permanent account lockout based only on failed attempts.

### Account Security

- Validate account status.
- Enforce email verification.
- Prevent unauthorized role assignment.
- Revoke sessions after password reset.
- Prevent account enumeration.

## 21. Environment Variables

```env
# Application
NODE_ENV=
CLIENT_URL=

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

# OTP
OTP_LENGTH=5
OTP_EXPIRES_IN=300
OTP_RESEND_COOLDOWN=60
OTP_MAX_ATTEMPTS=5

# Password Reset
PASSWORD_RESET_EXPIRES_IN=900

# Login Rate Limiting
LOGIN_MAX_ATTEMPTS=5
LOGIN_RATE_LIMIT_WINDOW=900
LOGIN_LOCKOUT_DURATION=900

# Registration Rate Limiting
REGISTER_MAX_ATTEMPTS=5
REGISTER_RATE_LIMIT_WINDOW=900

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

# Bcrypt
BCRYPT_SALT_ROUNDS=12
```

All credentials and secrets must be stored in environment variables and must never be committed to version control.

## 22. Expected Module Structure

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
│   │           ├── verification.template.ts
│   │           ├── welcome-buyer.template.ts
│   │           ├── welcome-vendor.template.ts
│   │           ├── welcome-admin.template.ts
│   │           ├── password-reset.template.ts
│   │           └── password-reset-success.template.ts
│   │
│   ├── user/
│   │   ├── user.model.ts
│   │   ├── user.interface.ts
│   │   ├── user.service.ts
│   │   └── user.constant.ts
│   │
│   └── verification/
│       ├── verification.model.ts
│       ├── verification.interface.ts
│       ├── verification.service.ts
│       └── verification.constant.ts
│
├── middlewares/
│   └── rate-limiter.middleware.ts
│
└── utils/
    ├── jwt.ts
    ├── password.ts
    └── cookie.ts
```

### Module Responsibilities

**Auth Module**

- Handle registration, login, logout and token management.
- Handle OTP generation and verification.
- Handle password reset.
- Coordinate authentication-specific Redis operations.
- Coordinate authentication email delivery.

**Auth Redis Service**

- Manage authentication-related Redis operations.
- Store and retrieve hashed OTPs.
- Manage OTP expiration and resend cooldown.
- Track OTP verification attempts.
- Track failed login attempts by IP and email.
- Manage temporary login cooldowns.
- Manage temporary password reset tokens.
- Handle authentication-specific Redis key management.

**Auth Email Service**

- Use Nodemailer with Gmail SMTP.
- Manage email transporter configuration.
- Send verification OTP emails.
- Send role-based welcome emails.
- Send password reset emails.
- Manage reusable HTML email templates.

**User Module**

- Manage user information and user-related operations.
- Maintain the centralized User model.

**Verification Module**

- Manage email verification records.
- Maintain email verification status and timestamps.

**Middlewares**

- Manage authentication rate limiting and other shared middleware.

**Utils**

- Provide reusable JWT, password and cookie utilities.

### Architecture Rules

- Keep Redis service inside the Auth module.
- Keep Email service inside the Auth module.
- Do not create separate global Redis or email services for authentication.
- Keep Redis and email operations separate from authentication business logic.
- Reuse existing shared infrastructure where available.
- Maintain Modular Architecture and Separation of Concerns.
- Avoid unnecessary abstractions and duplicate services.

## 23. Implementation Standards

- Follow the project's Modular Architecture.
- Maintain Separation of Concerns.
- Keep authentication and user management responsibilities separate.
- Use centralized error handling.
- Validate all incoming requests using Zod.
- Use shared utilities instead of duplicating logic.
- Use database transactions for related multi-document operations.
- Keep Redis and email integrations independent of business logic.
- Keep credentials in environment variables.
- Follow existing code standards and naming conventions.
- Write readable, reusable, maintainable, and production-ready code.
- Avoid unnecessary abstractions and dependencies.

## 24. Acceptance Criteria

### Registration

- [ ] Users can register using name, email, and password.
- [ ] All authentication request inputs are validated using Zod.
- [ ] Passwords are securely hashed using bcrypt.
- [ ] User and Verification documents are created transactionally.
- [ ] Registration sends a 5-digit verification OTP.
- [ ] OTP is stored securely in Redis.
- [ ] OTP expires after the configured time.
- [ ] Registration is limited to 5 requests per IP within the configured window.

### Login and Session Management

- [ ] Users can log in securely.
- [ ] Login allows a maximum of 5 failed attempts per IP within 15 minutes.
- [ ] Login allows a maximum of 5 failed attempts per normalized email within 15 minutes.
- [ ] Redis tracks failed login attempts.
- [ ] Temporary cooldown is applied after reaching the configured limit.
- [ ] Login rate limits cannot be bypassed through concurrent requests.
- [ ] Generic authentication errors prevent account enumeration.
- [ ] JWT access and refresh tokens are generated.
- [ ] Authentication cookies use secure attributes.
- [ ] Users can log out and revoke refresh sessions.
- [ ] Users can refresh access tokens.

### Email Verification

- [ ] Verification email is delivered through Nodemailer and Gmail SMTP.
- [ ] Users can verify their email.
- [ ] Users can resend OTP with cooldown protection.
- [ ] OTP is single-use and has a maximum of 5 verification attempts.

### Password Reset

- [ ] Users can request password resets.
- [ ] Users can securely reset their passwords.
- [ ] Reset tokens are securely stored in Redis.
- [ ] Existing sessions are invalidated after password reset.

### Email Service

- [ ] Role-based welcome emails are sent through Gmail SMTP.
- [ ] BUYER, VENDOR, and ADMIN templates use different color themes.
- [ ] Password reset emails are sent through Nodemailer.
- [ ] Email delivery failures are handled reliably.

### Architecture and Security

- [ ] Redis service is maintained inside the Auth module.
- [ ] Email service is maintained inside the Auth module.
- [ ] Redis and rate-limiting integrations work correctly.
- [ ] Authentication endpoints are protected against abuse.
- [ ] All authentication operations follow project security standards.
