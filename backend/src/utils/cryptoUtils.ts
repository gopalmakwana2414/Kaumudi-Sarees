import crypto from "crypto";

/**
 * Perform a timing-safe comparison between two strings.
 * Prevents timing side-channel attacks when verifying signatures.
 * @param a First string
 * @param b Second string
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
};
