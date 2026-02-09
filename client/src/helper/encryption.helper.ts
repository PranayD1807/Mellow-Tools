class Encryption {
  private static SALT_LENGTH = 16;
  private static IV_LENGTH_GCM = 12;
  private static REFRESH_TOKEN_LENGTH = 32;
  public static ITERATIONS = 600000;

  /**
   * Helpers to import keys in specific modes.
   */
  static async importAESKey(
    raw: ArrayBuffer,
    mode: "AES-GCM" = "AES-GCM"
  ): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      "raw",
      raw,
      { name: mode },
      true,
      ["encrypt", "decrypt"]
    );
  }

  static async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  static generatePasswordKeySalt(): string {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    return this.arrayBufferToBase64(salt.buffer as ArrayBuffer);
  }

  private static passwordKeySaltToUint8Array(saltBase64: string): Uint8Array {
    return new Uint8Array(this.base64ToArrayBuffer(saltBase64));
  }

  static async getPasswordDerivedKey(
    userPassword: string,
    storedSalt: string,
    iterations: number = this.ITERATIONS
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
        salt: this.passwordKeySaltToUint8Array(storedSalt) as BufferSource,
        iterations: iterations,
        hash: "SHA-256",
      },
      baseKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts an AES key using another key (password-derived or refresh token)
   */
  static async encryptAESKey(
    keyToEncrypt: CryptoKey,
    encryptionKey: CryptoKey
  ): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH_GCM));
    const keyBuffer = await crypto.subtle.exportKey("raw", keyToEncrypt);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
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

  static async decryptEncryptedAESKey(
    encryptedKeyString: string,
    decryptionKey: CryptoKey
  ): Promise<CryptoKey> {
    const dataBuffer = this.base64ToArrayBuffer(encryptedKeyString);
    const iv = new Uint8Array(dataBuffer.slice(0, this.IV_LENGTH_GCM));
    const encryptedBuffer = dataBuffer.slice(this.IV_LENGTH_GCM);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      decryptionKey,
      encryptedBuffer
    );

    // Import as AES-GCM
    return await crypto.subtle.importKey(
      "raw",
      decryptedBuffer,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts string data
   */
  static async encryptStringData(
    plaintext: string,
    encryptionKey: CryptoKey
  ): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH_GCM));
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(plaintext);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
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
   * Decrypts string data
   * Returns the original string if decryption fails (handles legacy plaintext data)
   */
  static async decryptData(
    encryptedString: string,
    key: CryptoKey,
    silent: boolean = false,
    throwOnError: boolean = false
  ): Promise<string> {
    try {
      const dataBuffer = this.base64ToArrayBuffer(encryptedString);
      const iv = new Uint8Array(dataBuffer.slice(0, this.IV_LENGTH_GCM));
      const encryptedBuffer = dataBuffer.slice(this.IV_LENGTH_GCM);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encryptedBuffer
      );
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      // If decryption fails (invalid base64, wrong format, or plaintext data),
      // return the original string as-is (legacy/unencrypted data)
      if (!silent) {
        console.warn("Decryption failed, returning original value:", error);
      }
      return encryptedString;
    }
  }

  /**
   * Checks if string data is already encrypted with the given key
   */
  static async isEncrypted(
    value: string,
    key: CryptoKey
  ): Promise<boolean> {
    try {
      await this.decryptData(value, key, true, true);
      return true;
    } catch {
      return false;
    }
  }

  static generateRefreshToken(): string {
    const tokenBytes = crypto.getRandomValues(
      new Uint8Array(this.REFRESH_TOKEN_LENGTH)
    );
    return this.arrayBufferToBase64(tokenBytes.buffer);
  }

  private static async getRefreshTokenKey(
    refreshToken: string
  ): Promise<CryptoKey> {
    const tokenBuffer = this.base64ToArrayBuffer(refreshToken);
    return await crypto.subtle.importKey(
      "raw",
      tokenBuffer,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  static async encryptAESKeyWithRefreshToken(
    aesKey: CryptoKey,
    refreshToken: string
  ): Promise<string> {
    const refreshTokenKey = await this.getRefreshTokenKey(refreshToken);
    return await this.encryptAESKey(aesKey, refreshTokenKey);
  }

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

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

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
