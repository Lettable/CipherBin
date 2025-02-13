/*
* Copyright 2025 Mirza
*
* All Rights Reserved.
*
* This code is proprietary and confidential. No part of this code may be used, copied, modified, or distributed without the express written permission of Mirza.
*
* For inquiries, please contact: t.me/mirzyave
*/

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
      this.content = Buffer.from(content, 'utf8').toString('base64');
      this._hmacKey = Buffer.from("public-secret", 'utf8');
    } else {
      this.content = this.encryptContent(content, password);
      this._hmacKey = crypto.createHash('sha256').update(password).digest();
    }

    this.pasteObject = {
      content: this.content,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isPublic: this.isPublic,
      syntax: this.syntax
    };

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

  static encodeObject(pasteObj) {
    return Buffer.from(JSON.stringify(pasteObj), 'utf8').toString('base64');
  }

  static decodeObject(encodedStr) {
    return JSON.parse(Buffer.from(encodedStr, 'base64').toString('utf8'));
  }

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
