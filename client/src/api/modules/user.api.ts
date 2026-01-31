import privateClient from "../client/private.client";
import publicClient from "../client/public.client";
import { handleApiError } from "../helper/error.helper";
import { ApiResponse } from "@/models/ApiResponse";

const userEndpoints = {
  signin: "auth/signin",
  signup: "auth/signup",
  getInfo: "auth/get-info",
  passwordUpdate: "auth/update-password",
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
}

interface PasswordUpdateData {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface UserInfo {
  id: string;
  email: string;
  displayName: string;
}

interface SigninResponse {
  token: string;
  refreshToken: string;
  status: string;
  message: string;
  data: UserInfo;
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
  }: SignupData): Promise<ApiResponse<SignupResponse>> => {
    try {
      const response = await publicClient.post<SignupResponse>(
        userEndpoints.signup,
        {
          email,
          password,
          confirmPassword,
          displayName,
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
      const response = await privateClient.get<GetInfoResponse>(
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
      const response = await privateClient.put<PasswordUpdateResponse>(
        userEndpoints.passwordUpdate,
        {
          password,
          newPassword,
          confirmNewPassword,
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
};

export default userApi;
