import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

/**
 * Password hashing on top of node:crypto's scrypt.
 *
 * scrypt rather than bcrypt or argon2 deliberately: it is memory-hard, it is in
 * the standard library, and it therefore adds no native dependency that has to
 * compile on Vercel's build image. bcrypt's headline advantage — being the
 * default everyone reaches for — is not worth a node-gyp build step here.
 *
 * Stored format is self-describing so the parameters can be raised later
 * without invalidating existing hashes:
 *
 *   scrypt$N$r$p$<salt base64url>$<hash base64url>
 *
 * A hash written under old parameters still verifies, because verification
 * reads its cost from the stored string rather than from the constants below.
 */

// N=2^15 costs roughly 100ms and 32MB per hash on Vercel's runtime — high
// enough to make offline cracking expensive, low enough not to stall a login.
const N = 32_768;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

// scrypt's memory ceiling is derived from the cost, and node's default (32MB)
// sits exactly on the boundary for N=2^15 and intermittently throws. Ask for
// double so the parameters above have room.
const MAX_MEMORY = 128 * 1024 * 1024;

/** Rejects passwords too short to be worth hashing. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Upper bound on password length.
 *
 * Without it, a megabyte-long password is a cheap way to make the server burn
 * scrypt's memory-hard work on an attacker's behalf.
 */
export const MAX_PASSWORD_LENGTH = 200;

/**
 * @param {string} password
 * @returns {Promise<string>} the encoded hash, ready to store
 */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = /** @type {Buffer} */ (
    await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, {
      N,
      r: R,
      p: P,
      maxmem: MAX_MEMORY,
    })
  );

  return [
    "scrypt",
    N,
    R,
    P,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

/**
 * Check a password against a stored hash.
 *
 * Returns false rather than throwing for every failure mode — wrong password,
 * malformed record, unknown algorithm — so a caller cannot accidentally leak
 * which one it was through differing error handling.
 *
 * @param {string} password
 * @param {string | null | undefined} stored
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltB64, hashB64] = parts;

  try {
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(hashB64, "base64url");

    const derived = /** @type {Buffer} */ (
      await scrypt(password.normalize("NFKC"), salt, expected.length, {
        N: Number(n),
        r: Number(r),
        p: Number(p),
        maxmem: MAX_MEMORY,
      })
    );

    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
