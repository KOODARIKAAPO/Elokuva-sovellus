import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

/**
 * Creates a salted scrypt hash that is stored as `${salt}:${hash}`.
 */
export async function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("Password must be a non-empty string");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${Buffer.from(derivedKey).toString("hex")}`;
}

/**
 * Verifies that the provided password matches the stored salted hash.
 */
export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  try {
    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
    const hashBuffer = Buffer.from(key, "hex");
    const derivedBuffer = Buffer.from(derivedKey);

    if (hashBuffer.length !== derivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, derivedBuffer);
  } catch {
    return false;
  }
}
