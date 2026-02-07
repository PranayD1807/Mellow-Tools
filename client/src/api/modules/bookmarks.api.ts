import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "@/api/client/private.client";
import { handleApiError } from "@/helper/error.helper";
import { Bookmark, CreateBookmarkData } from "@/models/Bookmark";

const bookmarkEndpoints = {

  create: "bookmarks",
  get: "bookmarks/{id}",
  update: "bookmarks/{id}",
  delete: "bookmarks/{id}",
};

const bookmarkApi = {
  getAll: async (params: { page?: number; limit?: number } = {}): Promise<ApiResponse<Bookmark[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fields", "-user");
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = `bookmarks?${queryParams.toString()}`;

      const response = await privateClient.get<ApiResponse<Bookmark[]>>(
        endpoint
      );

      const decryptedBookmarks = await Promise.all(
        response.data.data.map(async (note) =>
          Object.assign(new Bookmark(), note).decrypt()
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
      const updateItemInstance = Object.assign(new CreateBookmarkData(), data);
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
};

export default bookmarkApi;
