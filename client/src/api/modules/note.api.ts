import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "../client/private.client";
import { handleApiError } from "../helper/error.helper";
import { Note } from "@/models/note";

const noteEndpoints = {
  getAll: (query?: string) =>
    query
      ? `notes?fields=-user&query=${encodeURIComponent(query)}`
      : "notes?fields=-user",
  create: "notes",
  get: "notes/{id}",
  update: "notes/{id}",
  delete: "notes/{id}",
};

export interface CreateNoteData {
  title: string;
  text: string;
}

const noteApi = {
  getAll: async (query?: string): Promise<ApiResponse<Note[]>> => {
    try {
      const endpoint = noteEndpoints.getAll(query);
      const response = await privateClient.get<ApiResponse<Note[]>>(endpoint);

      return {
        status: response.data.status,
        data: response.data.data || [],
        results: response.data.results || 0,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  get: async (id: string): Promise<ApiResponse<Note | null>> => {
    try {
      const endpoint = noteEndpoints.get.replace("{id}", id);
      const response = await privateClient.get<ApiResponse<Note>>(endpoint);

      return {
        status: response.data.status,
        data: response.data.data || null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (
    contactData: CreateNoteData
  ): Promise<ApiResponse<Note | null>> => {
    try {
      const response = await privateClient.post<ApiResponse<Note>>(
        noteEndpoints.create,
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
    contactData: CreateNoteData
  ): Promise<ApiResponse<Note | null>> => {
    try {
      const endpoint = noteEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<Note>>(
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
};

export default noteApi;
