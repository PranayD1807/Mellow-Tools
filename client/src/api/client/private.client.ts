import { store } from "@/store/store";
import { logout } from "@/store/userSlice";
import axios, { InternalAxiosRequestConfig } from "axios";
import queryString from "query-string";
import LocalStorageConstants from "@/constants/localStorage.constants";

const prodUrl = "https://mellow-tools-backend.vercel.app/";
const devUrl = "http://127.0.0.1:8080/";
const hostUrl = import.meta.env.VITE_ENV == "PROD" ? prodUrl : devUrl;

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
      localStorage.getItem(LocalStorageConstants.JWT_TOKEN) || ""
    }`;
    cfg.headers["Content-Type"] = "application/json";
    return cfg;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

privateClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Error Occured: ", error);
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default privateClient;
