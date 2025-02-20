import { UserInfo } from "@/models/UserInfo";
import LocalStorageConstants from "../constants/localStorage";
import Encryption from "./encryption.helper";

export class LocalStorageHelper {
  // Save user creds to local storage
  static saveUserCreds = async ({
    userInfo,
    password,
    jwtToken,
  }: {
    userInfo: UserInfo;
    password: string;
    jwtToken: string;
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

    // encrypt aes key with refresh token and store it
    const encryptedAesKeyWithRefreshToken: string =
      await Encryption.encryptAESKeyWithRefreshToken(aesKey, aesRefreshToken);

    localStorage.setItem(LocalStorageConstants.JWT_TOKEN, jwtToken);

    localStorage.setItem(
      LocalStorageConstants.AES_REFRESH_TOKEN,
      aesRefreshToken
    );

    localStorage.setItem(
      LocalStorageConstants.ENCRYPTED_AES_KEY_WITH_REFRESH_TOKEN,
      encryptedAesKeyWithRefreshToken
    );
  };

  static setUserInfo = (displayName: string, email: string, userId: string) => {
    localStorage.setItem(
      LocalStorageConstants.USER,
      JSON.stringify({
        displayName: displayName,
        email: email,
        userId: userId,
      })
    );
  };

  static logoutUser = () => {
    localStorage.clear();
  };
}
