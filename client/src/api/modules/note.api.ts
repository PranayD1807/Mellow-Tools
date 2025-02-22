import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { handleApiError } from "@/helper/error.helper";
import { CreateNoteData, Note } from "@/models/Note";

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
  getAll: async (query?: string): Promise<ApiResponse<Note[]>> => {
    try {
      const endpoint = noteEndpoints.getAll(query);
      const response = await privateClient.get<ApiResponse<Note[]>>(endpoint);

      const decryptedNotes = await Promise.all(
        response.data.data.map(async (note) =>
          Object.assign(new Note(), note).decrypt()
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

  get: async (id: string): Promise<ApiResponse<Note | null>> => {
    try {
      const endpoint = noteEndpoints.get.replace("{id}", id);
      const response = await privateClient.get<ApiResponse<Note>>(endpoint);

      const decryptedNote = response.data.data
        ? await Object.assign(new Note(), response.data.data).decrypt()
        : null;

      return {
        status: response.data.status,
        data: decryptedNote,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (data: CreateNoteData): Promise<ApiResponse<Note | null>> => {
    try {
      const createNoteInstance = Object.assign(new CreateNoteData(), data);
      const encryptedData = await createNoteInstance.encrypt();

      const response = await privateClient.post<ApiResponse<Note>>(
        noteEndpoints.create,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(new Note(), response.data.data).decrypt()
          : null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  update: async (
    id: string,
    data: CreateNoteData
  ): Promise<ApiResponse<Note | null>> => {
    try {
      const updateNoteInstance = Object.assign(new CreateNoteData(), data);
      const encryptedData = await updateNoteInstance.encrypt();

      const endpoint = noteEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<Note>>(
        endpoint,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(new Note(), response.data.data).decrypt()
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
