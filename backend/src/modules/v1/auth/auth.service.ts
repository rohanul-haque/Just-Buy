import config from "@/config";
import Admin from "@/modules/v1/admin/admin.model";
import { RoleRedirectPath } from "@/modules/v1/auth/auth.constant";
import type {
  IAuthResponse,
  IForgotPasswordInput,
  ILoginInput,
  IRegisterInput,
  IRegisterResponse,
  IResetPasswordInput,
} from "@/modules/v1/auth/auth.interface";
import {
  generateNumericOtp,
  generateResetToken,
  hashString,
} from "@/modules/v1/auth/auth.utils";
import emailService from "@/modules/v1/auth/email/email.service";
import {
  deletePasswordResetToken,
  getPasswordResetToken,
  getRefreshToken,
  getUserIdByResetToken,
  isLoginLocked,
  recordFailedLogin,
  resetEmailLoginAttempts,
  revokeRefreshToken,
  setOtpCooldown,
  setVerificationOtpCooldown,
  storeOtp,
  storePasswordResetToken,
  storeRefreshToken,
} from "@/modules/v1/auth/redis/redis.service";
import Buyer from "@/modules/v1/buyer/buyer.model";
import type { TUserRole } from "@/modules/v1/user/user.constant";
import { AccountStatus, UserRole } from "@/modules/v1/user/user.constant";
import User from "@/modules/v1/user/user.model";
import Vendor from "@/modules/v1/vendor/vendor.model";
import type { IVerification } from "@/modules/v1/verification/verification.interface";
import Verification from "@/modules/v1/verification/verification.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { comparePassword, hashPassword } from "@/utils/password";
import { status } from "http-status";
import mongoose from "mongoose";

const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const register = async (
  payload: IRegisterInput,
): Promise<IRegisterResponse> => {
  const normalizedEmail = normalizeEmail(payload.email);

  // 1. Check if email already exists
  const existingUser = await User.findOne({ email: normalizedEmail }).exec();
  if (existingUser) {
    throw new AppError(
      status.CONFLICT,
      ERROR_CODE.AUTH_EMAIL_EXISTS,
      MESSAGES.EMAIL_ALREADY_EXISTS,
    );
  }

  // 2. Reject public ADMIN registration
  if (
    payload.role === UserRole.ADMIN &&
    !config.WHITELISTED_ADMIN_MAILS.includes(normalizedEmail)
  ) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.FORBIDDEN,
      MESSAGES.ADMIN_CANNOT_REGISTER,
    );
  }

  const isWhitelistedAdmin =
    payload.role === UserRole.ADMIN &&
    config.WHITELISTED_ADMIN_MAILS.includes(normalizedEmail);

  const assignedRole: TUserRole = isWhitelistedAdmin
    ? UserRole.ADMIN
    : payload.role === UserRole.VENDOR
      ? UserRole.VENDOR
      : UserRole.BUYER;

  // 3. Hash password
  const hashedPassword = await hashPassword(payload.password);

  // 4. Generate 5-digit numeric OTP
  const otp = generateNumericOtp(config.OTP_LENGTH);
  const hashedOtp = hashString(otp);

  // 5. MongoDB Transaction for User & Verification documents
  const session = await mongoose.startSession();
  session.startTransaction();

  let createdUserDoc: InstanceType<typeof User>;

  try {
    const userObjectId = new mongoose.Types.ObjectId();
    const verificationObjectId = new mongoose.Types.ObjectId();

    const [verificationDoc] = await Verification.create(
      [
        {
          _id: verificationObjectId,
          user: userObjectId,
          otp: hashedOtp,
          isEmailVerified: false,
          emailVerifiedAt: null,
          attempts: 0,
          expiresAt: new Date(Date.now() + config.OTP_EXPIRES_IN * 1000),
        },
      ],
      { session },
    );

    const [createdUser] = await User.create(
      [
        {
          _id: userObjectId,
          name: payload.name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          status: AccountStatus.ACTIVE,
          verification: verificationDoc._id,
          role: assignedRole,
        },
      ],
      { session },
    );

    createdUserDoc = createdUser;

    // Create role-specific profiles inside transaction
    if (assignedRole === UserRole.BUYER) {
      await Buyer.create(
        [
          {
            buyer: userObjectId,
          },
        ],
        { session },
      );
    } else if (assignedRole === UserRole.ADMIN) {
      await Admin.create(
        [
          {
            admin: userObjectId,
          },
        ],
        { session },
      );
    } else if (assignedRole === UserRole.VENDOR) {
      await Vendor.create(
        [
          {
            vendor: userObjectId,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // 6. Store hashed OTP in Redis
  await storeOtp(normalizedEmail, hashedOtp, config.OTP_EXPIRES_IN);
  await setOtpCooldown(normalizedEmail, config.OTP_RESEND_COOLDOWN);
  await setVerificationOtpCooldown(normalizedEmail, config.OTP_RESEND_COOLDOWN);

  // 7. Send Emails (after transaction commit)
  emailService
    .sendVerificationEmail(normalizedEmail, createdUserDoc.name, otp)
    .catch(() => {});

  emailService
    .sendWelcomeEmail(normalizedEmail, createdUserDoc.name, createdUserDoc.role)
    .catch(() => {});

  return {
    user: {
      id: createdUserDoc._id.toString(),
      name: createdUserDoc.name,
      email: createdUserDoc.email,
      role: createdUserDoc.role,
      isEmailVerified: false,
    },
    message:
      "Registration successful. Please verify your email using the 5-digit OTP sent to your inbox.",
  };
};

const login = async (
  payload: ILoginInput,
  clientIp: string,
): Promise<IAuthResponse> => {
  const normalizedEmail = normalizeEmail(payload.email);

  // 1. Check IP and Email lockout
  const lockStatus = await isLoginLocked(clientIp, normalizedEmail);
  if (lockStatus.locked) {
    const waitMinutes = Math.ceil((lockStatus.retryAfter || 900) / 60);
    throw new AppError(
      status.TOO_MANY_REQUESTS,
      ERROR_CODE.TOO_MANY_REQUESTS,
      `Too many failed login attempts. Please try again in ${waitMinutes} minute(s).`,
    );
  }

  // 2. Find user including password
  const user = await User.findOne({ email: normalizedEmail })
    .select("+password")
    .populate<{ verification: IVerification }>("verification")
    .exec();

  if (!user || !user.password) {
    await recordFailedLogin(clientIp, normalizedEmail);
    throw new AppError(
      status.UNAUTHORIZED,
      ERROR_CODE.AUTH_INVALID_CREDENTIALS,
      MESSAGES.INVALID_CREDENTIALS,
    );
  }

  // 3. Verify password
  const isPasswordValid = await comparePassword(
    payload.password,
    user.password,
  );
  if (!isPasswordValid) {
    await recordFailedLogin(clientIp, normalizedEmail);
    throw new AppError(
      status.UNAUTHORIZED,
      ERROR_CODE.AUTH_INVALID_CREDENTIALS,
      MESSAGES.INVALID_CREDENTIALS,
    );
  }

  // 4. Check account status
  if (user.status === AccountStatus.BLOCKED) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.AUTH_ACCOUNT_DISABLED,
      MESSAGES.ACCOUNT_DISABLED,
    );
  }

  // 5. Check email verification
  const isEmailVerified = user.verification?.isEmailVerified ?? false;
  if (!isEmailVerified) {
    throw new AppError(
      status.FORBIDDEN,
      "AUTH_EMAIL_NOT_VERIFIED",
      "Please verify your email address before logging in.",
    );
  }

  // 6. Reset email login attempts upon success
  await resetEmailLoginAttempts(normalizedEmail);

  // 7. Generate JWT access and refresh tokens
  const tokenPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 8. Store hashed refresh token session in Redis
  await storeRefreshToken(user._id.toString(), hashString(refreshToken));

  const redirectUrl = RoleRedirectPath[user.role] || "/";

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
    },
    accessToken,
    refreshToken,
    redirectUrl,
  };
};

const logout = async (userId?: string): Promise<{ message: string }> => {
  if (userId) {
    await revokeRefreshToken(userId);
  }
  return { message: MESSAGES.LOGOUT_SUCCESS };
};

const refreshToken = async (
  token: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError(
      status.UNAUTHORIZED,
      ERROR_CODE.AUTH_REFRESH_TOKEN_INVALID,
      MESSAGES.REFRESH_TOKEN_INVALID,
    );
  }

  const storedHashedToken = await getRefreshToken(decoded.userId);
  if (!storedHashedToken || storedHashedToken !== hashString(token)) {
    throw new AppError(
      status.UNAUTHORIZED,
      ERROR_CODE.AUTH_REFRESH_TOKEN_INVALID,
      "Session has expired or was revoked. Please log in again.",
    );
  }

  const user = await User.findById(decoded.userId).exec();
  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      ERROR_CODE.USER_NOT_FOUND,
      MESSAGES.USER_NOT_FOUND,
    );
  }

  if (user.status === AccountStatus.BLOCKED) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.AUTH_ACCOUNT_DISABLED,
      MESSAGES.ACCOUNT_DISABLED,
    );
  }

  const tokenPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  await storeRefreshToken(user._id.toString(), hashString(newRefreshToken));

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const forgotPassword = async (
  payload: IForgotPasswordInput,
): Promise<{ message: string }> => {
  const normalizedEmail = normalizeEmail(payload.email);
  const user = await User.findOne({ email: normalizedEmail }).exec();

  // Prevent account enumeration by always returning the same success message
  if (user) {
    const resetToken = generateResetToken();
    const hashedToken = hashString(resetToken);

    await storePasswordResetToken(
      user._id.toString(),
      hashedToken,
      config.PASSWORD_RESET_EXPIRES_IN,
    );

    emailService
      .sendPasswordResetEmail(normalizedEmail, user.name, resetToken)
      .catch(() => {});
  }

  return {
    message:
      "If an account with that email exists, we have sent a password reset link to it.",
  };
};

const resetPassword = async (
  payload: IResetPasswordInput,
): Promise<{ message: string }> => {
  const submittedHashedToken = hashString(payload.token);

  // 1. Find userId associated with reset token
  const userId = await getUserIdByResetToken(submittedHashedToken);

  if (!userId) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      MESSAGES.PASSWORD_RESET_TOKEN_INVALID,
    );
  }

  // 2. Verify stored token matches
  const storedHashedToken = await getPasswordResetToken(userId);

  if (!storedHashedToken || storedHashedToken !== submittedHashedToken) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      MESSAGES.PASSWORD_RESET_TOKEN_INVALID,
    );
  }

  // 3. Hash new password
  const hashedPassword = await hashPassword(payload.newPassword);

  // 4. Update user password in MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  let updatedUserDoc: InstanceType<typeof User> | null = null;

  try {
    updatedUserDoc = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true, session },
    ).exec();

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // 5. Invalidate reset token and revoke active sessions in Redis
  await deletePasswordResetToken(userId, submittedHashedToken);
  await revokeRefreshToken(userId);

  // 6. Send confirmation email
  if (updatedUserDoc) {
    emailService
      .sendPasswordResetSuccessEmail(updatedUserDoc.email, updatedUserDoc.name)
      .catch(() => {});
  }

  return {
    message: MESSAGES.PASSWORD_RESET_SUCCESS,
  };
};

const authService = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};

export default authService;
