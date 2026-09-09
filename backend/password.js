import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

// Stored as "salt:hash", both hex. scrypt is memory-hard, so no bcrypt dependency.
export const hashPassword = async (plain) => {
  const salt = randomBytes(16);
  const hash = await scryptAsync(plain, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
};

export const verifyPassword = async (plain, stored) => {
  const [saltHex, hashHex] = String(stored).split(":");
  if (!saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;

  const actual = await scryptAsync(plain, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  return timingSafeEqual(actual, expected);
};
