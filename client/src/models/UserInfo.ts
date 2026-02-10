export interface UserInfo {
  id: string;
  email: string;
  displayName: string;
  passwordKeySalt: string;
  encryptedAESKey: string;
  isTwoFactorEnabled?: boolean;
  encryptionStatus?: string;
}
