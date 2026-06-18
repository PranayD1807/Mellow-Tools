import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { handleApiError } from "@/helper/error.helper";

const feedbackEndpoints = {
  feedbacks: "feedbacks",
};

export interface Feedback {
  _id: string;
  text: string;
  images: string[];
  user: {
    _id: string;
    displayName: string;
    email: string;
  };
  createdAt: string;
}

const feedbackApi = {
  submitFeedback: async (formData: FormData): Promise<ApiResponse<Feedback>> => {
    try {
      const response = await privateClient.post<ApiResponse<Feedback>>(
        feedbackEndpoints.feedbacks,
        formData
      );
      return {
        status: response.data.status,
        data: response.data.data,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  getAll: async (): Promise<ApiResponse<Feedback[]>> => {
    try {
      const response = await privateClient.get<ApiResponse<Feedback[]>>(
        feedbackEndpoints.feedbacks
      );
      return {
        status: response.data.status,
        data: response.data.data,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },
};

export default feedbackApi;
