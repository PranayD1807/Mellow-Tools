class Encryption {
  private static SALT_LENGTH = 16;
  private static IV_LENGTH = 16;

  // Generate a random AES key (256-bit)
  static async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256, // AES-256
      },
      true, // Can be exported
      ["encrypt", "decrypt"]
    );
  }

  // Generate a random salt for password key derivation
  static generatePasswordKeySalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
  }

  // Derive a 256-bit key from password and salt using PBKDF2
  static async getPasswordDerivedKey(
    password: string,
    passwordKeySalt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

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
        salt: passwordKeySalt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      {
        name: "AES-CBC",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encryptAESKey(
    aesKey: CryptoKey,
    passwordDerivedKey: CryptoKey
  ): Promise<string> {
    // Step 1: Generate a random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH)); // IV length is 16 bytes

    // Step 2: Export the AES key to an ArrayBuffer
    const aesKeyBuffer = await crypto.subtle.exportKey("raw", aesKey); // Export the AES key to ArrayBuffer

    // Step 3: Encrypt the AES key using the password-derived key (AES-CBC)
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-CBC", // AES algorithm in CBC mode
        iv: iv, // IV used in the encryption
      },
      passwordDerivedKey, // The password-derived key used for encryption
      aesKeyBuffer // The exported AES key as ArrayBuffer
    );

    // Step 4: Combine the IV and encrypted data into one buffer
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv); // Place the IV at the start
    combined.set(new Uint8Array(encrypted), iv.byteLength); // Append the encrypted AES key after the IV

    // Step 5: Return the result as a Base64 string for easy storage
    return this.arrayBufferToBase64(combined.buffer); // Convert to Base64 string
  }

  // Decrypt the AES key using the password-derived key
  static async decryptEncryptedAESKey(
    encryptedAESKey: string,
    passwordDerivedKey: CryptoKey
  ): Promise<CryptoKey> {
    const dataBuffer = this.base64ToArrayBuffer(encryptedAESKey);

    // Extract IV from the start of the data
    const iv = new Uint8Array(dataBuffer.slice(0, this.IV_LENGTH));
    const encryptedBuffer = dataBuffer.slice(this.IV_LENGTH);

    // Decrypt the AES key using the password-derived key
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      passwordDerivedKey,
      encryptedBuffer
    );

    // Import the decrypted buffer as a CryptoKey
    const decryptedKey = await crypto.subtle.importKey(
      "raw", // Import raw key material
      decryptedBuffer,
      { name: "AES-CBC", length: 256 }, // Algorithm info for the key
      false, // The key is not extractable
      ["encrypt", "decrypt"] // Allowed operations
    );

    return decryptedKey; // Return the decrypted AES key as CryptoKey
  }

  // Encrypt string data using the AES key (AES)
  static async encryptStringData(
    data: string,
    aesKey: CryptoKey
  ): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH)); // Generate random IV for each encryption

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      aesKey,
      dataBuffer
    );

    // Combine IV and encrypted data for easy storage (Base64)
    const combined = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.byteLength);

    // Return Base64 string for storage
    return this.arrayBufferToBase64(combined.buffer);
  }

  // Decrypt data using the AES key (AES)
  static async decryptData(
    encryptedData: string,
    aesKey: CryptoKey
  ): Promise<string> {
    const dataBuffer = this.base64ToArrayBuffer(encryptedData);

    // Extract IV from the start of the data
    const iv = new Uint8Array(dataBuffer.slice(0, this.IV_LENGTH));
    const encryptedBuffer = dataBuffer.slice(this.IV_LENGTH);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      aesKey,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }

  // Helper method to convert ArrayBuffer to Base64 string
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Helper method to convert Base64 string to ArrayBuffer
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Test Encryption Methods
  static async testEncryptionMethods(content: string, password: string) {
    try {
      // Step 1: Generate AES Key
      const aesKey: CryptoKey = await Encryption.generateAESKey();
      console.log("Generated AES Key: ", aesKey); // Log the AES key in Base64 format for better visibility

      // Step 2: Generate a salt for the password-based key derivation
      const passwordKeySalt = Encryption.generatePasswordKeySalt();
      console.log("Generated Password Key Salt: ", passwordKeySalt); // Log salt

      // Step 3: Derive the password-derived key from the password and salt
      const passwordDerivedKey = await Encryption.getPasswordDerivedKey(
        password,
        passwordKeySalt
      );
      console.log(
        "Derived Password Key (Base64): ",
        passwordDerivedKey.toString()
      ); // Log the derived key

      // Step 4: Encrypt the AES key using the password-derived key
      const encryptedAESKey = await Encryption.encryptAESKey(
        aesKey,
        passwordDerivedKey
      );
      console.log("Encrypted AES Key (Base64): ", encryptedAESKey); // Log encrypted AES key in Base64 format

      // Step 5: Decrypt the AES key using the password-derived key
      const decryptedAESKey = await Encryption.decryptEncryptedAESKey(
        encryptedAESKey,
        passwordDerivedKey
      );
      console.log("Decrypted AES Key (Base64): ", decryptedAESKey.toString()); // Log decrypted AES key

      // Step 7: Encrypt the content using the AES key
      const encryptedData = await Encryption.encryptStringData(content, aesKey);
      console.log("Encrypted Data (Base64): ", encryptedData); // Log the encrypted content

      // Step 8: Decrypt the content using the AES key
      const decryptedData = await Encryption.decryptData(
        encryptedData,
        decryptedAESKey
      );
      console.log("Decrypted Data: ", decryptedData); // Log decrypted content
    } catch (error) {
      console.error("Error during encryption/decryption: ", error);
    }
  }
}

export default Encryption;
