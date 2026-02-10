import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { CreateTextTemplateData, TextTemplate } from "@/models/TextTemplate";
import { handleApiError } from "@/helper/error.helper";

const textTemplateEndpoints = {

  get: "text-templates/{id}",
  create: "text-templates",
  update: "text-templates/{id}",
  delete: "text-templates/{id}",
  bulkUpdate: "text-templates/bulk-update",
};

const textTemplateApi = {
  getAll: async (params: { page?: number; limit?: number; sort?: string } = {}): Promise<ApiResponse<TextTemplate[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user,-placeholders");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const endpoint = `text-templates?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<TextTemplate[]>>(
        endpoint
      );

      const items = response.data?.data ?? [];
      const decryptedTemplates = await Promise.all(
        items.map(async (template) => {
          const decrypted = await Object.assign(new TextTemplate(), template).decrypt();
          return decrypted;
        })
      );

      return {
        status: response.data.status,
        data: decryptedTemplates,
        results: response.data.results || 0,
        page: response.data.page || 1,
        limit: response.data.limit || params.limit || 10,
        totalPages: response.data.totalPages || 0,
        totalResults: response.data.totalResults || 0,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  // Raw version for migration - returns data without auto-decryption
  getAllRaw: async (params: { page?: number; limit?: number; sort?: string } = {}): Promise<ApiResponse<TextTemplate[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const endpoint = `text-templates?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<TextTemplate[]>>(
        endpoint
      );

      const items = response.data?.data ?? [];
      const rawTemplates = items.map((template) =>
        Object.assign(new TextTemplate(), template)
      );

      return {
        status: response.data.status,
        data: rawTemplates,
        results: response.data.results || 0,
        page: response.data.page || 1,
        limit: response.data.limit || params.limit || 10,
        totalPages: response.data.totalPages || 0,
        totalResults: response.data.totalResults || 0,
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

      const decryptedTemplate = response.data.data
        ? await Object.assign(new TextTemplate(), response.data.data).decrypt()
        : null;

      return {
        status: response.data.status,
        data: decryptedTemplate,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (
    data: Partial<CreateTextTemplateData>
  ): Promise<ApiResponse<TextTemplate | null>> => {
    try {
      const createNoteInstance = Object.assign(
        new CreateTextTemplateData(),
        data
      );
      const encryptedData = await createNoteInstance.encrypt();

      const response = await privateClient.post<ApiResponse<TextTemplate>>(
        textTemplateEndpoints.create,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(
            new TextTemplate(),
            response.data.data
          ).decrypt()
          : null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  update: async (
    id: string,
    data: Partial<CreateTextTemplateData>
  ): Promise<ApiResponse<TextTemplate | null>> => {
    try {
      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
      const createNoteInstance = Object.assign(
        new CreateTextTemplateData(),
        sanitizedData
      );
      const encryptedData = await createNoteInstance.encrypt();

      const endpoint = textTemplateEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<TextTemplate>>(
        endpoint,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(
            new TextTemplate(),
            response.data.data
          ).decrypt()
          : null,
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

  bulkUpdate: async (updates: Array<{ id: string; data: Partial<CreateTextTemplateData> }>): Promise<ApiResponse<{ matchedCount: number; modifiedCount: number }>> => {
    try {
      const encryptedUpdates = await Promise.all(
        updates.map(async (update) => {
          const sanitizedData = Object.fromEntries(
            Object.entries(update.data).filter(([_, value]) => value !== undefined)
          );
          const instance = Object.assign(new CreateTextTemplateData(), sanitizedData);
          const encryptedData = await instance.encrypt();
          return { id: update.id, data: encryptedData };
        })
      );

      const response = await privateClient.patch<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(
        textTemplateEndpoints.bulkUpdate,
        { updates: encryptedUpdates }
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

export default textTemplateApi;
