import config from "@/config";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const compareHashedToken = (
  token: string,
  hashedToken: string,
): boolean => {
  const hashedInput = hashToken(token);
  if (hashedInput.length !== hashedToken.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(hashedInput, "utf-8"),
    Buffer.from(hashedToken, "utf-8"),
  );
};
