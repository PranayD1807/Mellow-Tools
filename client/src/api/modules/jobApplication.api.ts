import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "../client/private.client";
import { handleApiError } from "../helper/error.helper";
import { JobApplication, CreateJobApplicationData } from "@/models/JobApplication";

const jobApplicationEndpoints = {
    getAll: (params: { search?: string; status?: string; sort?: string; page?: number; limit?: number } = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("fields", "-user");
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);
        if (params.sort) queryParams.append("sort", params.sort);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        return `job-applications?${queryParams.toString()}`;
    },
    create: "job-applications",
    get: "job-applications/{id}",
    update: "job-applications/{id}",
    delete: "job-applications/{id}",
    getStats: "job-applications/stats",
};

const jobApplicationApi = {
    getStats: async (): Promise<ApiResponse<{ total: number; Applied: number; Interviewing: number; Offer: number; Rejected: number }>> => {
        try {
            const response = await privateClient.get<ApiResponse<{ total: number; Applied: number; Interviewing: number; Offer: number; Rejected: number }>>(jobApplicationEndpoints.getStats);
            return {
                status: response.data.status,
                data: response.data.data || { total: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 },
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },
    getAll: async (params: { search?: string; status?: string; sort?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<JobApplication[]>> => {
        try {
            const endpoint = jobApplicationEndpoints.getAll(params);
            const response = await privateClient.get<ApiResponse<JobApplication[]>>(endpoint);

            return {
                status: response.data.status,
                data: response.data.data || [],
                results: response.data.results || 0,
                totalResults: response.data.totalResults || 0,
                totalPages: response.data.totalPages || 0,
                page: response.data.page || 1,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    get: async (id: string): Promise<ApiResponse<JobApplication | null>> => {
        try {
            const endpoint = jobApplicationEndpoints.get.replace("{id}", id);
            const response = await privateClient.get<ApiResponse<JobApplication>>(endpoint);

            return {
                status: response.data.status,
                data: response.data.data || null,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    create: async (data: CreateJobApplicationData): Promise<ApiResponse<JobApplication | null>> => {
        try {
            const response = await privateClient.post<ApiResponse<JobApplication>>(
                jobApplicationEndpoints.create,
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
        data: CreateJobApplicationData
    ): Promise<ApiResponse<JobApplication | null>> => {
        try {
            const endpoint = jobApplicationEndpoints.update.replace("{id}", id);
            const response = await privateClient.patch<ApiResponse<JobApplication>>(
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
            const endpoint = jobApplicationEndpoints.delete.replace("{id}", id);
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

export default jobApplicationApi;
