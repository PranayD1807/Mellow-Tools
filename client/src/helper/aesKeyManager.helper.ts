import { LocalStorageHelper } from "./localStorage.helper";

export class AESKeyManager {
  private static aesKey: CryptoKey | undefined = undefined;

  static async getAESKey(): Promise<CryptoKey | undefined> {
    if (this.aesKey) return this.aesKey;

    const key = await LocalStorageHelper.getAESKey();
    if (!key) return undefined;

    this.aesKey = key;
    return this.aesKey;
  }

  static clear() {
    this.aesKey = undefined;
  }
}
