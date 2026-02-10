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
    // Derive password key
    const passwordDerivedKey: CryptoKey =
      await Encryption.getPasswordDerivedKey(
        password,
        userInfo.passwordKeySalt
      );

    // Derive AES KEY
    const aesKey: CryptoKey = await Encryption.decryptEncryptedAESKey(
      userInfo.encryptedAESKey,
      passwordDerivedKey
    );

    // generate refesh token
    const aesRefreshToken: string = Encryption.generateRefreshToken();

    const encryptedAesKeyWithRefreshToken: string =
      await Encryption.encryptAESKeyWithRefreshToken(aesKey, aesRefreshToken);

    localStorage.setItem(LocalStorageConstants.JWT_TOKEN, jwtToken || "");
    localStorage.setItem(LocalStorageConstants.REFRESH_TOKEN, refreshToken || "");

    localStorage.setItem(
      LocalStorageConstants.AES_REFRESH_TOKEN,
      aesRefreshToken
    );

    localStorage.setItem(
      LocalStorageConstants.ENCRYPTED_AES_KEY_WITH_REFRESH_TOKEN,
      encryptedAesKeyWithRefreshToken
    );
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
