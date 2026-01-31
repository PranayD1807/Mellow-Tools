import { store } from "@/store/store";
import { logout } from "@/store/userSlice";
import axios, { InternalAxiosRequestConfig } from "axios";
import queryString from "query-string";

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
    cfg.headers["Authorization"] = `Bearer ${localStorage.getItem("actkn") || ""
      }`;
    cfg.headers["Content-Type"] = "application/json";
    return cfg;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("actkn");
      store.dispatch(logout());
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

privateClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Error Occured: ", error);
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      const actkn = localStorage.getItem("actkn");

      // prevent infinite loop if refresh token is invalid
      if (error.config.__isRetryRequest) {
        localStorage.removeItem("actkn");
        localStorage.removeItem("refreshToken");
        store.dispatch(logout());
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      if (refreshToken && actkn) {
        error.config.__isRetryRequest = true;
        try {
          const { data } = await axios.post(`${baseURL}auth/refresh-token`, { refreshToken });

          if (data.status === "success" && data.token) {
            localStorage.setItem("actkn", data.token);
            error.config.headers["Authorization"] = `Bearer ${data.token}`;
            return privateClient(error.config);
          }
        } catch (refreshError) {
          console.log("Token refresh failed:", refreshError);
          localStorage.removeItem("actkn");
          localStorage.removeItem("refreshToken");
          store.dispatch(logout());
          window.location.href = "/auth";
        }
      } else {
        localStorage.removeItem("actkn");
        localStorage.removeItem("refreshToken");
        store.dispatch(logout());
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default privateClient;
