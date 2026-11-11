import crypto from "crypto";

export const generateNumericOtp = (length = 5): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashString = (val: string): string => {
  return crypto.createHash("sha256").update(val).digest("hex");
};
