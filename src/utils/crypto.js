/**
 * Cryptographic utilities for Josephest Quiz Platform
 * Uses Web Crypto API (SHA-256) for secure password hashing.
 */

const SALT = 'josephest2026_expressions_quiz_salt_v1';

/**
 * Hash a password using SHA-256 with a fixed application salt.
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a stored hash.
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - The stored SHA-256 hex hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash) {
  const inputHash = await hashPassword(password);
  // Constant-time comparison to prevent timing attacks
  if (inputHash.length !== storedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < inputHash.length; i++) {
    mismatch |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return mismatch === 0;
}
