import { store } from "@/store/store";
import { logout } from "@/store/userSlice";
import axios, { InternalAxiosRequestConfig } from "axios";
import queryString from "query-string";

const prodUrl = "https://mellow-tools-backend.vercel.app/";
const devUrl = "http://127.0.0.1:8080/";
const hostUrl = import.meta.env.VITE_ENV == "PROD" ? prodUrl : devUrl;

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

publicClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Error Occured: ", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("actkn");
      store.dispatch(logout());
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default publicClient;
