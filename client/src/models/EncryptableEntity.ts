import { AESKeyManager } from "@/helper/aesKeyManager.helper";
import Encryption from "@/helper/encryption.helper";

export abstract class EncryptableEntity {
  abstract encryptFields(): (keyof this)[];

  async encrypt(): Promise<this> {
    const encryptedData = { ...this } as this;
    const aesKey = await AESKeyManager.getAESKey();

    if (aesKey) {
      for (const field of this.encryptFields()) {
        if (this[field] && typeof this[field] === "string") {
          encryptedData[field] = (await Encryption.encryptStringData(
            this[field] as string,
            aesKey
          )) as this[typeof field];
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
        if (this[field] && typeof this[field] === "string") {
          decryptedData[field] = (await Encryption.decryptData(
            this[field] as string,
            aesKey
          )) as this[typeof field];
        }
      }
    }

    return decryptedData;
  }
}
