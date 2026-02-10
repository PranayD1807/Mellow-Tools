import { UserInfo } from "@/models/UserInfo";
import LocalStorageConstants from "@/constants/localStorage.constants";
import Encryption from "@/helper/encryption.helper";

export class LocalStorageHelper {
  // Save user creds to local storage
  static saveUserCreds = async ({
    userInfo,
    password,
    jwtToken,
    refreshToken,
  }: {
    userInfo: UserInfo;
    password: string;
    jwtToken?: string;
    refreshToken?: string;
  }) => {
    let passwordDerivedKey: CryptoKey | null = null;
    let aesKey: CryptoKey | null = null;
    let aesRefreshToken: string | null = null;

    try {
      // Derive password key
      try {
        passwordDerivedKey = await Encryption.getPasswordDerivedKey(
          password,
          userInfo.passwordKeySalt
        );
      } catch (error) {
        throw new Error(`Failed to derive password key: ${error}`);
      }

      // Derive AES KEY
      try {
        aesKey = await Encryption.decryptEncryptedAESKey(
          userInfo.encryptedAESKey,
          passwordDerivedKey!
        );
      } catch (error) {
        throw new Error(`Failed to decrypt AES key: ${error}`);
      }

      // generate refesh token
      aesRefreshToken = Encryption.generateRefreshToken();

      let encryptedAesKeyWithRefreshToken: string;
      try {
        encryptedAesKeyWithRefreshToken =
          await Encryption.encryptAESKeyWithRefreshToken(
            aesKey!,
            aesRefreshToken
          );
      } catch (error) {
        throw new Error(`Failed to encrypt AES key with refresh token: ${error}`);
      }

      localStorage.setItem(LocalStorageConstants.JWT_TOKEN, jwtToken || "");
      localStorage.setItem(
        LocalStorageConstants.REFRESH_TOKEN,
        refreshToken || ""
      );

      localStorage.setItem(
        LocalStorageConstants.AES_REFRESH_TOKEN,
        aesRefreshToken
      );

      localStorage.setItem(
        LocalStorageConstants.ENCRYPTED_AES_KEY_WITH_REFRESH_TOKEN,
        encryptedAesKeyWithRefreshToken
      );
    } catch (error) {
      console.error("Error during user credentials preservation:", error);
      throw error;
    } finally {
      // Clear sensitive in-memory values
      passwordDerivedKey = null;
      aesKey = null;
      aesRefreshToken = null;
    }
  };

  static getAESKey = async (): Promise<CryptoKey | undefined> => {
    const token = localStorage.getItem(LocalStorageConstants.AES_REFRESH_TOKEN);
    const encryptedAesKey = localStorage.getItem(
      LocalStorageConstants.ENCRYPTED_AES_KEY_WITH_REFRESH_TOKEN
    );

    let aesKey;

    if (token && encryptedAesKey) {
      try {
        aesKey = await Encryption.decryptAESKeyWithRefreshToken(
          encryptedAesKey,
          token
        );
      } catch {
        localStorage.removeItem(LocalStorageConstants.AES_REFRESH_TOKEN);
        localStorage.removeItem(
          LocalStorageConstants.ENCRYPTED_AES_KEY_WITH_REFRESH_TOKEN
        );
        return undefined;
      }
    }

    return aesKey;
  };

  static setUserInfo = (displayName: string, email: string, userId: string, encryptionStatus?: string) => {
    localStorage.setItem(
      LocalStorageConstants.USER,
      JSON.stringify({
        displayName: displayName,
        email: email,
        userId: userId,
        encryptionStatus: encryptionStatus || null,
      })
    );
  };

  static logoutUser = () => {
    localStorage.clear();
  };
}
