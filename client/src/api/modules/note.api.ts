import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { handleApiError } from "@/helper/error.helper";
import { CreateTextNoteData, TextNote } from "@/models/TextNote";

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

const noteApi = {
  getAll: async (query?: string): Promise<ApiResponse<TextNote[]>> => {
    try {
      const endpoint = noteEndpoints.getAll(query);
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
    data: CreateTextNoteData
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
    data: CreateTextNoteData
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
};

export default noteApi;
