import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { handleApiError } from "@/helper/error.helper";
import { CreateTextNoteData, TextNote } from "@/models/TextNote";

const noteEndpoints = {

  create: "notes",
  get: "notes/{id}",
  update: "notes/{id}",
  delete: "notes/{id}",
  bulkUpdate: "notes/bulk-update",
};

const noteApi = {
  getAll: async (params: { page?: number; limit?: number; sort?: string } = {}): Promise<ApiResponse<TextNote[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const endpoint = `notes?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<TextNote[]>>(
        endpoint
      );

      const decryptedNotes = await Promise.all(
        response.data.data.map(async (note) =>
          Object.assign(new TextNote(), note).decrypt()
        )
      );

      return {
        status: response.data.status,
        data: decryptedNotes,
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
  getAllRaw: async (params: { page?: number; limit?: number; sort?: string } = {}): Promise<ApiResponse<TextNote[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const endpoint = `notes?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<TextNote[]>>(
        endpoint
      );

      // Return raw data without decryption, but still create instances
      const rawNotes = response.data.data.map((note) =>
        Object.assign(new TextNote(), note)
      );

      return {
        status: response.data.status,
        data: rawNotes,
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

  get: async (id: string): Promise<ApiResponse<TextNote | null>> => {
    try {
      const endpoint = noteEndpoints.get.replace("{id}", id);
      const response = await privateClient.get<ApiResponse<TextNote>>(endpoint);

      const decryptedNote = response.data.data
        ? await Object.assign(new TextNote(), response.data.data).decrypt()
        : null;

      return {
        status: response.data.status,
        data: decryptedNote,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (
    data: Partial<CreateTextNoteData>
  ): Promise<ApiResponse<TextNote | null>> => {
    try {
      const createNoteInstance = Object.assign(new CreateTextNoteData(), data);
      const encryptedData = await createNoteInstance.encrypt();

      const response = await privateClient.post<ApiResponse<TextNote>>(
        noteEndpoints.create,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(new TextNote(), response.data.data).decrypt()
          : null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  update: async (
    id: string,
    data: Partial<CreateTextNoteData>
  ): Promise<ApiResponse<TextNote | null>> => {
    try {
      const updateNoteInstance = Object.assign(new CreateTextNoteData(), data);
      const encryptedData = await updateNoteInstance.encrypt();

      const endpoint = noteEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<TextNote>>(
        endpoint,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(new TextNote(), response.data.data).decrypt()
          : null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const endpoint = noteEndpoints.delete.replace("{id}", id);
      const response = await privateClient.delete<ApiResponse<null>>(endpoint);

      return {
        status: response.data.status,
        data: null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  bulkUpdate: async (updates: Array<{ id: string; data: Partial<CreateTextNoteData> }>): Promise<ApiResponse<{ matchedCount: number; modifiedCount: number }>> => {
    try {
      const response = await privateClient.patch<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(
        noteEndpoints.bulkUpdate,
        { updates }
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

export default noteApi;
