class Encryption {
  private static SALT_LENGTH = 16; // Length for password key derivation salt
  private static IV_LENGTH = 16; // Initialization vector length for AES-CBC
  private static REFRESH_TOKEN_LENGTH = 32; // 256-bit refresh token length

  /**
   * Generates a new AES-256 key for encrypting/decrypting data
   * Use this when initially setting up encryption for a user or when rotating keys
   * @returns {Promise<CryptoKey>} A new AES-256 key
   * @example
   * const aesKey = await Encryption.generateAESKey();
   */
  static async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Generates a random salt for password key derivation
   * Use this when initially setting up a user's password or during password changes
   * @returns {string} Base64 encoded salt string
   * @example
   * const salt = Encryption.generatePasswordKeySalt();
   */
  static generatePasswordKeySalt(): string {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    return this.arrayBufferToBase64(salt.buffer);
  }

  /**
   * Converts a Base64 encoded salt string back to Uint8Array for internal use
   * @param {string} saltBase64 - The Base64 encoded salt string
   * @returns {Uint8Array} The salt as a Uint8Array
   */
  private static passwordKeySaltToUint8Array(saltBase64: string): Uint8Array {
    return new Uint8Array(this.base64ToArrayBuffer(saltBase64));
  }

  /**
   * Derives an encryption key from a password and salt using PBKDF2
   * Use this during login or when the user needs to access their encrypted data
   * @param {string} userPassword - The user's password
   * @param {string} storedSalt - The Base64 encoded salt used for key derivation
   * @returns {Promise<CryptoKey>} The derived key for encryption/decryption
   * @example
   * const derivedKey = await Encryption.getPasswordDerivedKey(userPassword, storedSalt);
   */
  static async getPasswordDerivedKey(
    userPassword: string,
    storedSalt: string
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(userPassword);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: this.passwordKeySaltToUint8Array(storedSalt),
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      {
        name: "AES-CBC",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts an AES key using another key (password-derived or refresh token)
   * Use this to secure the AES key for storage
   * @param {CryptoKey} keyToEncrypt - The AES key to be encrypted
   * @param {CryptoKey} encryptionKey - The key used for encryption
   * @returns {Promise<string>} Base64 encoded encrypted key with IV
   * @example
   * const encryptedKey = await Encryption.encryptAESKey(aesKey, derivedKey);
   */
  static async encryptAESKey(
    keyToEncrypt: CryptoKey,
    encryptionKey: CryptoKey
  ): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const keyBuffer = await crypto.subtle.exportKey("raw", keyToEncrypt);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      encryptionKey,
      keyBuffer
    );

    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.byteLength);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * Decrypts an encrypted AES key using another key (password-derived or refresh token)
   * Use this to recover the AES key for use in data encryption/decryption
   * @param {string} encryptedKeyString - Base64 encoded encrypted AES key with IV
   * @param {CryptoKey} decryptionKey - The key used for decryption
   * @returns {Promise<CryptoKey>} The decrypted AES key
   * @example
   * const decryptedKey = await Encryption.decryptEncryptedAESKey(encryptedKey, derivedKey);
   */
  static async decryptEncryptedAESKey(
    encryptedKeyString: string,
    decryptionKey: CryptoKey
  ): Promise<CryptoKey> {
    const dataBuffer = this.base64ToArrayBuffer(encryptedKeyString);
    const iv = new Uint8Array(dataBuffer.slice(0, this.IV_LENGTH));
    const encryptedBuffer = dataBuffer.slice(this.IV_LENGTH);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      decryptionKey,
      encryptedBuffer
    );

    return await crypto.subtle.importKey(
      "raw",
      decryptedBuffer,
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts string data using an AES key
   * Use this for encrypting user data before storage
   * @param {string} plaintext - The data to encrypt
   * @param {CryptoKey} encryptionKey - The AES key for encryption
   * @returns {Promise<string>} Base64 encoded encrypted data with IV
   * @example
   * const encryptedData = await Encryption.encryptStringData("sensitive data", aesKey);
   */
  static async encryptStringData(
    plaintext: string,
    encryptionKey: CryptoKey
  ): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(plaintext);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      encryptionKey,
      dataBuffer
    );

    const combined = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.byteLength);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * Decrypts encrypted string data using an AES key
   * Use this to recover encrypted user data
   * @param {string} encryptedString - Base64 encoded encrypted data with IV
   * @param {CryptoKey} decryptionKey - The AES key for decryption
   * @returns {Promise<string>} The decrypted string data
   * @example
   * const decryptedData = await Encryption.decryptData(encryptedData, aesKey);
   */
  static async decryptData(
    encryptedString: string,
    decryptionKey: CryptoKey
  ): Promise<string> {
    const dataBuffer = this.base64ToArrayBuffer(encryptedString);
    const iv = new Uint8Array(dataBuffer.slice(0, this.IV_LENGTH));
    const encryptedBuffer = dataBuffer.slice(this.IV_LENGTH);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      decryptionKey,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }

  /**
   * Generates a cryptographically secure refresh token
   * Use this when implementing persistent sessions or token-based authentication
   * @returns {string} Base64 encoded refresh token
   * @example
   * const refreshToken = Encryption.generateRefreshToken();
   */
  static generateRefreshToken(): string {
    const tokenBytes = crypto.getRandomValues(
      new Uint8Array(this.REFRESH_TOKEN_LENGTH)
    );
    return this.arrayBufferToBase64(tokenBytes.buffer);
  }

  /**
   * Converts a refresh token string to a CryptoKey for encryption/decryption
   * @param {string} refreshToken - The Base64 encoded refresh token
   * @returns {Promise<CryptoKey>} The refresh token as a CryptoKey
   */
  private static async getRefreshTokenKey(
    refreshToken: string
  ): Promise<CryptoKey> {
    const tokenBuffer = this.base64ToArrayBuffer(refreshToken);
    return await crypto.subtle.importKey(
      "raw",
      tokenBuffer,
      {
        name: "AES-CBC",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts an AES key using a refresh token
   * Use this when implementing persistent sessions to secure the AES key
   * @param {CryptoKey} aesKey - The AES key to encrypt
   * @param {string} refreshToken - The refresh token for encryption
   * @returns {Promise<string>} Base64 encoded encrypted AES key
   * @example
   * const encryptedKey = await Encryption.encryptAESKeyWithRefreshToken(aesKey, refreshToken);
   */
  static async encryptAESKeyWithRefreshToken(
    aesKey: CryptoKey,
    refreshToken: string
  ): Promise<string> {
    const refreshTokenKey = await this.getRefreshTokenKey(refreshToken);
    return await this.encryptAESKey(aesKey, refreshTokenKey);
  }

  /**
   * Decrypts an AES key using a refresh token
   * Use this to recover the AES key during persistent sessions
   * @param {string} encryptedKeyString - Base64 encoded encrypted AES key
   * @param {string} refreshToken - The refresh token for decryption
   * @returns {Promise<CryptoKey>} The decrypted AES key
   * @example
   * const decryptedKey = await Encryption.decryptAESKeyWithRefreshToken(encryptedKey, refreshToken);
   */
  static async decryptAESKeyWithRefreshToken(
    encryptedKeyString: string,
    refreshToken: string
  ): Promise<CryptoKey> {
    const refreshTokenKey = await this.getRefreshTokenKey(refreshToken);
    return await this.decryptEncryptedAESKey(
      encryptedKeyString,
      refreshTokenKey
    );
  }

  /**
   * Converts an ArrayBuffer to a Base64 string
   * @param {ArrayBuffer} buffer - The buffer to convert
   * @returns {string} Base64 encoded string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Converts a Base64 string to an ArrayBuffer
   * @param {string} base64 - The Base64 string to convert
   * @returns {ArrayBuffer} The resulting ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default Encryption;
