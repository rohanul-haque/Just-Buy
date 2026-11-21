import crypto from "crypto";

/**
 * Generate a cryptographically secure numeric OTP of the specified length.
 * Default is 5 digits.
 */
export const generateVerificationOtp = (length = 5): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * Hash an OTP using SHA-256 for secure database storage.
 */
export const hashOtp = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * Timing-safe comparison of plain OTP against stored hash.
 */
export const compareOtp = (plainOtp: string, hashedOtp: string): boolean => {
  const computedHash = hashOtp(plainOtp);
  if (computedHash.length !== hashedOtp.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "utf-8"),
    Buffer.from(hashedOtp, "utf-8"),
  );
};
