import { ApiResponse } from "@/models/ApiResponse";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleApiError = <T>(err: any): ApiResponse<T> => {
  const errorMessage = err?.response?.data?.message || "An error occurred";
  const errorStatus = err?.response?.status || "Unknown";

  return {
    status: "error",
    data: null as any,
    err: {
      message: errorMessage,
      status: errorStatus,
    },
  };
};
