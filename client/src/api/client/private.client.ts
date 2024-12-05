import axios, { InternalAxiosRequestConfig } from "axios";
import queryString from "query-string";

const hostUrl = "http://127.0.0.1:8080/";

// "http://127.0.0.1:8080/";

const baseURL = `${hostUrl}api/v1/`;

const privateClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

// Request interceptor to add authorization token
privateClient.interceptors.request.use(
  (cfg: InternalAxiosRequestConfig) => {
    cfg.headers = cfg.headers || {};
    cfg.headers["Authorization"] = `Bearer ${
      localStorage.getItem("actkn") || ""
    }`;
    cfg.headers["Content-Type"] = "application/json";
    return cfg;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
privateClient.interceptors.response.use(
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

export default privateClient;
