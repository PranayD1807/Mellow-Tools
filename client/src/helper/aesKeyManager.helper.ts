import { LocalStorageHelper } from "./localStorage.helper";

export class AESKeyManager {
  private static aesKey: CryptoKey | undefined = undefined;

  static async getAESKey(): Promise<CryptoKey | undefined> {
    if (this.aesKey) return this.aesKey; // Return cached key if available

    this.aesKey = await LocalStorageHelper.getAESKey(); // Fetch from storage if not cached
    return this.aesKey;
  }
}
