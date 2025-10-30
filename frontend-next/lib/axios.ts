import axios from "axios";
import { BASE_URL } from "./constant";

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: `${BASE_URL}`,
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// Interceptor ini untuk menangani error 401 dari authenticate, karena getUserInfo dari levelWrapper.jsx hanya dipanggil jika fullreload atau berada di /login untuk mengurangi beban server, karena authenticate cukup terpercaya dengan decode token di middleware tanpa hit database. jika tidak ada interceptor ini, maka kita masih bisa navigasi kemana mana walau token sudah tidak berlaku atau terhapus karena levelWrapper hanya mengecek userInfo di store, jika tidak ada barulah ia akan refetch getUserInfo seperti misalnya fullreload
// NEW : getUserinfo sekarang sudah melakukan refresh token jika access token kadaluarsa

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error
    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest?.url?.includes(
      "/api/auth/refresh-token"
    );

    if (is401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve) => {
          refreshSubscribers.push(() => {
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/api/user/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200) {
          onRefreshed();
          return axiosInstance(originalRequest); // retry original request
        }
      } catch (refreshError: any) {
        // Jika refresh token gagal, redirect ke login (hindari loop di /login)
        const isOnLogin =
          typeof window !== "undefined" &&
          window.location.pathname === "/login";
        if (refreshError.response?.status === 401 && !isOnLogin) {
          try {
            window.location.href = "/login";
          } catch (_) {}
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
