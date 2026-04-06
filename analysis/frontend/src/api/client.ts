import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
});

api.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(e)
);
