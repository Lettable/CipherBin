// lib/Paste.js
import crypto from 'crypto';

class Paste {
  /**
   * Create a new Paste.
   *
   * @param {string} content - The raw content of the paste.
   * @param {string} expiresAt - Expiration timestamp in ISO format.
   * @param {boolean} isPublic - If true, no encryption is done.
   * @param {string|null} password - Required if isPublic is false.
   * @param {string} syntax - Language or syntax (e.g., "javascript", "python").
   */
  constructor(content, expiresAt, isPublic, password, syntax) {
    this.createdAt = new Date().toISOString();
    this.expiresAt = expiresAt;
    this.isPublic = isPublic;
    this.syntax = syntax;

    if (!isPublic && !password) {
      throw new Error("Password is required for private pastes.");
    }

    if (isPublic) {
      // For public paste: simply Base64‑encode the content.
      this.content = Buffer.from(content, 'utf8').toString('base64');
      // Use a fixed key for public pastes.
      this._hmacKey = Buffer.from("public-secret", 'utf8');
    } else {
      // For private paste: encrypt the content using AES‑256‑CBC.
      this.content = this.encryptContent(content, password);
      // Derive an HMAC key from the password.
      this._hmacKey = crypto.createHash('sha256').update(password).digest();
    }

    // Build the paste object (without signature yet).
    this.pasteObject = {
      content: this.content,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isPublic: this.isPublic,
      syntax: this.syntax
    };

    // Compute a signature (HMAC‑SHA256) over the JSON string of the object.
    this.signature = this.computeSignature(this.pasteObject, this._hmacKey);
    this.pasteObject.signature = this.signature;
  }

  encryptContent(plainText, password) {
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('base64');
  }

  computeSignature(object, key) {
    const jsonStr = JSON.stringify(object);
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(jsonStr);
    return hmac.digest('base64');
  }

  getObject() {
    return this.pasteObject;
  }

  decryptContent(password) {
    if (this.isPublic) {
      return Buffer.from(this.content, 'base64').toString('utf8');
    } else {
      if (!password) {
        throw new Error("Password is required to decrypt this paste.");
      }
      const key = crypto.createHash('sha256').update(password).digest();
      const encryptedData = Buffer.from(this.content, 'base64');
      const iv = encryptedData.slice(0, 16);
      const ciphertext = encryptedData.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    }
  }

  // Static helper to encode a paste object into a Base64 string.
  static encodeObject(pasteObj) {
    return Buffer.from(JSON.stringify(pasteObj), 'utf8').toString('base64');
  }

  // Static helper to decode a Base64 string back to a paste object.
  static decodeObject(encodedStr) {
    return JSON.parse(Buffer.from(encodedStr, 'base64').toString('utf8'));
  }

  // Static helper to decrypt a paste object given a password.
  static decryptPaste(pasteObj, password) {
    if (pasteObj.isPublic) {
      return Buffer.from(pasteObj.content, 'base64').toString('utf8');
    } else {
      const key = crypto.createHash('sha256').update(password).digest();
      const encryptedData = Buffer.from(pasteObj.content, 'base64');
      const iv = encryptedData.slice(0, 16);
      const ciphertext = encryptedData.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    }
  }
}

export default Paste;
