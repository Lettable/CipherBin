// Define a base62 alphabet (0-9, A-Z, a-z)
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Generate a random 8-character string using the base62 alphabet.
function generateRandomId(length = 8) {
  let id = "";
  for (let i = 0; i < length; i++) {
    // Choose a random character from the alphabet.
    id += BASE62_ALPHABET.charAt(Math.floor(Math.random() * BASE62_ALPHABET.length));
  }
  return id;
}

// In-memory mapping to store long strings by short IDs.
// (For production, you might store this in a database or in browser storage.)
const idMapping = new Map();

/**
 * Encodes a long string into a short unique ID.
 * This function generates a random 8-character ID and stores the mapping.
 * @param {string} longStr - The long string (paste content) to encode.
 * @returns {string} An 8-character unique ID.
 */
function encodeToShortId(longStr) {
  let id = generateRandomId();
  // Ensure uniqueness (regenerate if necessary)
  while (idMapping.has(id)) {
    id = generateRandomId();
  }
  idMapping.set(id, longStr);
  return id;
}

/**
 * Decodes the short ID back into the original long string.
 * @param {string} id - The 8-character short ID.
 * @returns {string|undefined} The original long string or undefined if not found.
 */
function decodeFromShortId(id) {
  return idMapping.get(id);
}

// Example usage:
const longString = "https://cipherbin.vercel.app/eyJjb250ZW50IjoiWjJkbklBPT0iLCJjcmVhdGVkQXQiOiIyMDI1LTAyLTEyVDExOjIyOjAwLjU4M1oiLCJleHBpcmVzQXQiOiI5OTk5LTEyLTMxVDIzOjU5OjU5WiIsImlzUHVibGljIjp0cnVlLCJzeW50YXgiOiJwbGFpbnRleHQiLCJzaWduYXR1cmUiOiJrZm96R3VxY3JSR1NTcytGT2lKc1crL3ZkbmgxRUtDeW5pK3VBd0lJQldnPSJ9";
const shortId = encodeToShortId(longString);
console.log("Short ID:", shortId);

const retrievedString = decodeFromShortId(shortId);
console.log("Retrieved string:", retrievedString);
