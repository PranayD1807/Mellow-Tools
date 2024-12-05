import privateClient from "../client/private.client";

const contactEndpoints = {
  getAll: (query?: string) =>
    query ? `contacts?query=${encodeURIComponent(query)}` : "contacts",
  get: "contacts/{id}",
  create: "contacts",
  update: "contacts/{id}",
  delete: "contacts/{id}",
};

interface ContactData {
  contactName: string;
  mobileNumber?: string;
  email?: string;
}

interface ContactResponse {
  id: string;
  contactName: string;
  mobileNumber?: string;
  email?: string;
  user: string;
}

interface ApiResponse<T> {
  status: string;
  results?: number;
  data: T;
  err?: {
    message: string;
    status?: string;
  };
}

const contactApi = {
  getAll: async (query?: string): Promise<ApiResponse<ContactResponse[]>> => {
    const endpoint = contactEndpoints.getAll(query);
    const response = await privateClient.get(endpoint);

    return {
      status: response.data.status,
      results: response.data.results,
      data: response.data.data,
    };
  },

  get: async (id: string): Promise<ApiResponse<ContactResponse | null>> => {
    const response = await privateClient.get(
      contactEndpoints.get.replace("{id}", id)
    );

    return {
      status: response.data.status,
      data: response.data.data,
    };
  },

  create: async (
    contactData: ContactData
  ): Promise<ApiResponse<ContactResponse | null>> => {
    const response = await privateClient.post(
      contactEndpoints.create,
      contactData
    );

    return {
      status: response.data.status,
      data: response.data.data,
    };
  },

  update: async (
    id: string,
    contactData: ContactData
  ): Promise<ApiResponse<ContactResponse | null>> => {
    const response = await privateClient.patch(
      contactEndpoints.update.replace("{id}", id),
      contactData
    );

    return {
      status: response.data.status,
      data: response.data.data,
    };
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await privateClient.delete(
      contactEndpoints.delete.replace("{id}", id)
    );

    return {
      status: response?.data?.status || "success",
      data: response?.data,
    };
  },
};

export default contactApi;
