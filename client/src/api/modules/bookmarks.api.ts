import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { handleApiError } from "@/helper/error.helper";
import { Bookmark, CreateBookmarkData } from "@/models/Bookmark";

const bookmarkEndpoints = {

  create: "bookmarks",
  get: "bookmarks/{id}",
  update: "bookmarks/{id}",
  delete: "bookmarks/{id}",
  bulkUpdate: "bookmarks/bulk-update",
};

const bookmarkApi = {
  getAll: async (params: { page?: number; limit?: number; sort?: string } = {}, signal?: AbortSignal): Promise<ApiResponse<Bookmark[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const endpoint = `bookmarks?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<Bookmark[]>>(
        endpoint,
        { signal }
      );

      const decryptedBookmarks = await Promise.all(
        (response.data.data || []).map(async (bookmark) =>
          Object.assign(new Bookmark(), bookmark).decrypt()
        )
      );

      return {
        status: response.data.status,
        data: decryptedBookmarks,
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
  getAllRaw: async (params: { page?: number; limit?: number; sort?: string } = {}): Promise<ApiResponse<Bookmark[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const endpoint = `bookmarks?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<Bookmark[]>>(
        endpoint
      );

      const rawBookmarks = (response.data.data || []).map((bookmark) =>
        Object.assign(new Bookmark(), bookmark)
      );

      return {
        status: response.data.status,
        data: rawBookmarks,
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

  get: async (id: string): Promise<ApiResponse<Bookmark | null>> => {
    try {
      const endpoint = bookmarkEndpoints.get.replace("{id}", id);
      const response = await privateClient.get<ApiResponse<Bookmark>>(endpoint);

      const decryptedItem = response.data.data
        ? await Object.assign(new Bookmark(), response.data.data).decrypt()
        : null;

      return {
        status: response.data.status,
        data: decryptedItem,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  create: async (
    data: Partial<CreateBookmarkData>
  ): Promise<ApiResponse<Bookmark | null>> => {
    try {
      const createItemInstance = Object.assign(new CreateBookmarkData(), data);
      const encryptedData = await createItemInstance.encrypt();

      const response = await privateClient.post<ApiResponse<Bookmark>>(
        bookmarkEndpoints.create,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(new Bookmark(), response.data.data).decrypt()
          : null,
      };
    } catch (err: unknown) {
      return handleApiError(err);
    }
  },

  update: async (
    id: string,
    data: Partial<CreateBookmarkData>
  ): Promise<ApiResponse<Bookmark | null>> => {
    try {
      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
      const updateItemInstance = Object.assign(new CreateBookmarkData(), sanitizedData);
      const encryptedData = await updateItemInstance.encrypt();

      const endpoint = bookmarkEndpoints.update.replace("{id}", id);
      const response = await privateClient.patch<ApiResponse<Bookmark>>(
        endpoint,
        encryptedData
      );

      return {
        status: response.data.status,
        data: response.data.data
          ? await Object.assign(new Bookmark(), response.data.data).decrypt()
          : null,
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

  bulkUpdate: async (updates: Array<{ id: string; data: Partial<CreateBookmarkData> }>): Promise<ApiResponse<{ matchedCount: number; modifiedCount: number }>> => {
    try {
      const encryptedUpdates = await Promise.all(
        updates.map(async (update) => {
          const sanitizedData = Object.fromEntries(
            Object.entries(update.data).filter(([_, value]) => value !== undefined)
          );
          const instance = Object.assign(new CreateBookmarkData(), sanitizedData);
          const encryptedData = await instance.encrypt();
          return { id: update.id, data: encryptedData };
        })
      );

      const response = await privateClient.patch<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(
        bookmarkEndpoints.bulkUpdate,
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

export default bookmarkApi;
