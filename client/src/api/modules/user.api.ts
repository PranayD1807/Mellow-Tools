import { UserInfo } from "@/models/UserInfo";
import privateClient from "@/api/client/private.client";
import publicClient from "@/api/client/public.client";
import { handleApiError } from "@/helper/error.helper";
import { ApiResponse } from "@/models/ApiResponse";

const userEndpoints = {
  signin: "auth/signin",
  signup: "auth/signup",
  getInfo: "auth/get-info",
  passwordUpdate: "auth/update-password",
  generate2FA: "auth/2fa/generate",
  verify2FA: "auth/2fa/verify",
  validate2FA: "auth/2fa/validate",
  disable2FA: "auth/2fa/disable",
};

interface SigninData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  encryptedAESKey: string;
  passwordKeySalt: string;
}

interface PasswordUpdateData {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface SigninResponse {
  token?: string;
  refreshToken?: string;
  status: string;
  message: string;
  data?: UserInfo;
  userId?: string; // For 2FA required case
}

interface SignupResponse {
  token: string;
  refreshToken: string;
  status: string;
  message: string;
  data: UserInfo;
}

interface PasswordUpdateResponse {
  message: string;
  status: string;
}

interface GetInfoResponse {
  status: string;
  data: UserInfo;
}

interface Generate2FAResponse {
  status: string;
  data: {
    secret: string;
    qrCode: string;
  };
}

interface Verify2FAResponse {
  status: string;
  message: string;
}

interface Validate2FAResponse {
  status: string;
  message: string;
  token: string;
  refreshToken: string;
  data: UserInfo;
}

interface Disable2FAResponse {
  status: string;
  message: string;
}

const userApi = {
  signin: async ({
    email,
    password,
  }: SigninData): Promise<ApiResponse<SigninResponse>> => {
    try {
      const response = await publicClient.post<SigninResponse>(
        userEndpoints.signin,
        { email, password }
      );

      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<SigninResponse>(err);
    }
  },

  signup: async ({
    email,
    password,
    confirmPassword,
    displayName,
    encryptedAESKey,
    passwordKeySalt,
  }: SignupData): Promise<ApiResponse<SignupResponse>> => {
    try {
      const response = await publicClient.post<SignupResponse>(
        userEndpoints.signup,
        {
          email,
          password,
          confirmPassword,
          displayName,
          encryptedAESKey,
          passwordKeySalt,
        }
      );

      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<SignupResponse>(err);
    }
  },

  getInfo: async (): Promise<ApiResponse<GetInfoResponse>> => {
    try {
      const response = await privateClient.post<GetInfoResponse>(
        userEndpoints.getInfo
      );

      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<GetInfoResponse>(err);
    }
  },

  passwordUpdate: async ({
    password,
    newPassword,
    confirmNewPassword,
  }: PasswordUpdateData): Promise<ApiResponse<PasswordUpdateResponse>> => {
    try {
      const response = await privateClient.post<PasswordUpdateResponse>(
        userEndpoints.passwordUpdate,
        {
          password,
          newPassword,
          confirmPassword: confirmNewPassword,
        }
      );

      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<PasswordUpdateResponse>(err);
    }
  },

  generate2FA: async (): Promise<ApiResponse<Generate2FAResponse>> => {
    try {
      const response = await privateClient.post<Generate2FAResponse>(
        userEndpoints.generate2FA
      );
      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<Generate2FAResponse>(err);
    }
  },

  verify2FA: async (token: string): Promise<ApiResponse<Verify2FAResponse>> => {
    try {
      const response = await privateClient.post<Verify2FAResponse>(
        userEndpoints.verify2FA,
        { token }
      );
      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<Verify2FAResponse>(err);
    }
  },

  validate2FA: async (
    userId: string,
    token: string
  ): Promise<ApiResponse<Validate2FAResponse>> => {
    try {
      const response = await publicClient.post<Validate2FAResponse>(
        userEndpoints.validate2FA,
        { userId, token }
      );
      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<Validate2FAResponse>(err);
    }
  },

  disable2FA: async (): Promise<ApiResponse<Disable2FAResponse>> => {
    try {
      const response = await privateClient.post<Disable2FAResponse>(
        userEndpoints.disable2FA
      );
      return {
        status: response.data.status,
        data: response.data,
      };
    } catch (err: unknown) {
      return handleApiError<Disable2FAResponse>(err);
    }
  },
};

export default userApi;
