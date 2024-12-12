import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "../client/private.client";
import { TextTemplate } from "@/models/TextTemplate";
import { handleApiError } from "../helper/error.helper";

const textTemplateEndpoints = {
  getAll: (query?: string) =>
    query
      ? `text-templates?fields=-user,-placeholders,-content&query=${encodeURIComponent(
          query
        )}`
      : "text-templates?fields=-user,-placeholders,-content",
  get: "text-templates/{id}",
  create: "text-templates",
  update: "text-templates/{id}",
  delete: "text-templates/{id}",
};

export interface CreateTextTemplateData {
  title: string;
  content: string;
  placeholders: Array<{
    tag: string;
    defaultValue?: string;
  }>;
}

const textTemplateApi = {
  getAll: async (query?: string): Promise<ApiResponse<TextTemplate[]>> => {
    try {
      const endpoint = textTemplateEndpoints.getAll(query);
      const response = await privateClient.get<ApiResponse<TextTemplate[]>>(
        endpoint
      );

      return {
        status: response.data.status,
        data: response.data.data || [],
        results: response.data.results || 0,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  get: async (id: string): Promise<ApiResponse<TextTemplate | null>> => {
    try {
      const endpoint = textTemplateEndpoints.get.replace("{id}", id);
      const response = await privateClient.get<ApiResponse<TextTemplate>>(
        endpoint
      );

      return {
        status: response.data.status,
        data: response.data.data || null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (
    contactData: CreateTextTemplateData
  ): Promise<ApiResponse<TextTemplate | null>> => {
    try {
      const response = await privateClient.post<ApiResponse<TextTemplate>>(
        textTemplateEndpoints.create,
        contactData
      );

      return {
        status: response.data.status,
        data: response.data.data || null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  update: async (
    id: string,
    contactData: CreateTextTemplateData
  ): Promise<ApiResponse<TextTemplate | null>> => {
    try {
      const endpoint = textTemplateEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<TextTemplate>>(
        endpoint,
        contactData
      );

      return {
        status: response.data.status,
        data: response.data.data || null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const endpoint = textTemplateEndpoints.delete.replace("{id}", id);
      const response = await privateClient.delete<ApiResponse<null>>(endpoint);

      return {
        status: response.data.status,
        data: null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },
};

export default textTemplateApi;
