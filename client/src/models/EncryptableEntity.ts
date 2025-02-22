/* eslint-disable @typescript-eslint/no-explicit-any */
import { AESKeyManager } from "@/helper/aesKeyManager.helper";
import Encryption from "@/helper/encryption.helper";

export abstract class EncryptableEntity {
  abstract encryptFields(): (keyof this)[];

  private async encryptValue(value: any, aesKey: CryptoKey): Promise<any> {
    if (typeof value === "string") {
      return await Encryption.encryptStringData(value, aesKey);
    } else if (Array.isArray(value)) {
      return await Promise.all(
        value.map((item) => this.encryptValue(item, aesKey))
      );
    } else if (typeof value === "object" && value !== null) {
      const encryptedObject: any = {};
      for (const key in value) {
        encryptedObject[key] = await this.encryptValue(value[key], aesKey);
      }
      return encryptedObject;
    }
    return value;
  }

  private async decryptValue(value: any, aesKey: CryptoKey): Promise<any> {
    if (typeof value === "string") {
      return await Encryption.decryptData(value, aesKey);
    } else if (Array.isArray(value)) {
      return await Promise.all(
        value.map((item) => this.decryptValue(item, aesKey))
      );
    } else if (typeof value === "object" && value !== null) {
      const decryptedObject: any = {};
      for (const key in value) {
        decryptedObject[key] = await this.decryptValue(value[key], aesKey);
      }
      return decryptedObject;
    }
    return value;
  }

  async encrypt(): Promise<this> {
    const encryptedData = { ...this } as this;
    const aesKey = await AESKeyManager.getAESKey();

    if (aesKey) {
      for (const field of this.encryptFields()) {
        if (this[field] !== undefined) {
          encryptedData[field] = await this.encryptValue(this[field], aesKey);
        }
      }
    }

    return encryptedData;
  }

  async decrypt(): Promise<this> {
    const decryptedData = { ...this } as this;
    const aesKey = await AESKeyManager.getAESKey();

    if (aesKey) {
      for (const field of this.encryptFields()) {
        if (this[field] !== undefined) {
          decryptedData[field] = await this.decryptValue(this[field], aesKey);
        }
      }
    }

    return decryptedData;
  }
}
