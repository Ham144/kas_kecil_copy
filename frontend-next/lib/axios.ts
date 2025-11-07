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

// Request interceptor to ensure URL is stored in config
axiosInstance.interceptors.request.use(
  (config) => {
    // Store the URL for later use in response interceptor
    if (config.url) {
      (config as any)._requestUrl = config.url;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if originalRequest is not available
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if it's a 401 or 403 error (token expired or missing)
    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403;

    // Get URL from config - handle both relative and absolute URLs
    // Try multiple ways to get the URL since axios may store it differently
    const requestUrl =
      (originalRequest as any)._requestUrl ||
      originalRequest.url ||
      (originalRequest as any)._fullPath ||
      "";
    const isRefreshEndpoint = requestUrl.includes("/api/user/refresh-token");
    const isLoginEndpoint = requestUrl.includes("/api/user/login/ldap");
    const isPublicRoute = isLoginEndpoint || isRefreshEndpoint;

    // Only attempt refresh if it's an auth error, not already retried, and not a public route
    if (isAuthError && !originalRequest._retry && !isPublicRoute) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          refreshSubscribers.push(() => {
            axiosInstance(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use plain axios to avoid interceptor loop
        // Don't copy headers to avoid sending stale authorization headers
        const res = await axios.post(
          `${BASE_URL}/api/user/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        if (res.status === 200) {
          isRefreshing = false;
          onRefreshed();
          // Retry original request with fresh token
          // Keep _retry flag to prevent infinite loop if retry still fails
          // Small delay to ensure cookies are set by browser
          // Browser perlu waktu untuk menyimpan cookie dari response
          await new Promise((resolve) => setTimeout(resolve, 200));
          return axiosInstance(originalRequest);
        }
      } catch (refreshError: any) {
        isRefreshing = false;
        onRefreshed(); // Clear subscribers even on failure

        // Jika refresh token gagal, redirect ke login (hindari loop di /login)
        const isOnLogin =
          typeof window !== "undefined" &&
          window.location.pathname === "/login";
        // Clear any stale cookies and redirect to login
        if (!isOnLogin) {
          try {
            // Clear cookies if refresh failed
            document.cookie = "access_token=; path=/; max-age=0";
            document.cookie = "refresh_token=; path=/; max-age=0";
            window.location.href = "/login";
          } catch (_) {}
        }
        return Promise.reject(refreshError);
      } finally {
        // Ensure isRefreshing is reset even if something unexpected happens
        if (isRefreshing) {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
