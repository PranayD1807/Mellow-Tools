import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "../client/private.client";
import { handleApiError } from "../helper/error.helper";
import { Bookmark } from "@/models/Bookmark";

const bookmarkEndpoints = {
  getAll: (query?: string) =>
    query
      ? `bookmarks?fields=-user&query=${encodeURIComponent(query)}`
      : "bookmarks?fields=-user",
  create: "bookmarks",
  get: "bookmarks/{id}",
  update: "bookmarks/{id}",
  delete: "bookmarks/{id}",
};

export interface CreateBookmarkData {
  label: string;
  note?: string;
  url: string;
  logoUrl?: string;
}

const bookmarkApi = {
  getAll: async (query?: string): Promise<ApiResponse<Bookmark[]>> => {
    try {
      const endpoint = bookmarkEndpoints.getAll(query);
      const response = await privateClient.get<ApiResponse<Bookmark[]>>(
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

  get: async (id: string): Promise<ApiResponse<Bookmark | null>> => {
    try {
      const endpoint = bookmarkEndpoints.get.replace("{id}", id);
      const response = await privateClient.get<ApiResponse<Bookmark>>(endpoint);

      return {
        status: response.data.status,
        data: response.data.data || null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (
    data: CreateBookmarkData
  ): Promise<ApiResponse<Bookmark | null>> => {
    try {
      const response = await privateClient.post<ApiResponse<Bookmark>>(
        bookmarkEndpoints.create,
        data
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
    data: CreateBookmarkData
  ): Promise<ApiResponse<Bookmark | null>> => {
    try {
      const endpoint = bookmarkEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<Bookmark>>(
        endpoint,
        data
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
      const endpoint = bookmarkEndpoints.delete.replace("{id}", id);
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

export default bookmarkApi;
