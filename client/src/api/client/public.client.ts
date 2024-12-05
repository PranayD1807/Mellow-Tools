import axios, { InternalAxiosRequestConfig } from "axios";
import queryString from "query-string";

const hostUrl = "http://127.0.0.1:8080/";

// "http://127.0.0.1:8080/";

const baseURL = `${hostUrl}api/v1/`;

const publicClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

// Request interceptor to set headers
publicClient.interceptors.request.use(
  (cfg: InternalAxiosRequestConfig) => {
    cfg.headers = cfg.headers || {};
    cfg.headers["Content-Type"] = "application/json";
    return cfg;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
publicClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response;
    return response.data;
  },
  (err) => {
    return {
      err: {
        message: err?.response?.data?.message || "Something went wrong",
        status: err?.response?.data.status || "Unknown",
      },
    };
  }
);

export default publicClient;
