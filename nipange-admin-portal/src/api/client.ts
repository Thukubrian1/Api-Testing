import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAuthState } from "../store/slices/authSlice";
import { config } from "../config/config";
import { getErrorMessage } from "@/utils/errorHandler";

export const apiClient: AxiosInstance = axios.create({
  baseURL: "",
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
    // Removed Access-Control-Allow-* headers — those are server-response-only
    // and are ignored (or rejected) by browsers when set on outgoing requests.
  },
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if this request should skip automatic auth injection
    const skipAuthInjection = (config as any).skipAuthInjection;

    console.log("🔵 [API REQUEST]", {
      url: config.url,
      method: config.method,
      skipAuthInjection: skipAuthInjection || false,
      timestamp: new Date().toISOString(),
    });

    // Skip auth injection if explicitly requested (for logout endpoint)
    if (skipAuthInjection) {
      console.log(
        "⏭️ [SKIP AUTH INJECTION] Authorization header already set explicitly",
      );
      return config;
    }

    const { token } = getAuthState();

    console.log("🔵 [API REQUEST] Auth state:", {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
    });

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ [TOKEN ATTACHED] Token added to request headers");
    } else {
      console.log("⚠️ [NO TOKEN] Request sent without authentication");
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ [REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

// Response interceptor - handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ [API SUCCESS]", {
      url: response.config.url,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    console.log("🔴 [API ERROR]", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timestamp: new Date().toISOString(),
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    // Don't retry if this is the logout endpoint failing
    if (error.config?.url?.includes("/logout")) {
      console.log("🚪 [LOGOUT ERROR] Not retrying logout request");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⚠️ [401 UNAUTHORIZED] Token expired or invalid");
      console.log("🔄 [TOKEN REFRESH] Starting token refresh process...");

      originalRequest._retry = true;
      const { refreshToken, admin } = getAuthState();

      console.log("📋 [REFRESH STATE]", {
        hasRefreshToken: !!refreshToken,
        hasUser: !!admin,
        refreshTokenPreview: refreshToken
          ? `${refreshToken.substring(0, 20)}...`
          : "none",
        userId: admin?.id,
        userEmail: admin?.email,
      });

      if (!refreshToken || !admin) {
        console.error(
          "❌ [REFRESH FAILED] No refresh token or user data available",
        );
        console.log("🚪 [LOGOUT] Forcing user logout...");
        handleLogout();
        return Promise.reject(error);
      }

      try {
        console.log("📡 [CALLING REFRESH ENDPOINT] POST /v1/auth/refresh");
        const startTime = Date.now();

        // Call refresh endpoint with refresh token in Authorization header
        const response = await axios.post(
          `${config.api.baseUrl}/v1/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        const endTime = Date.now();
        console.log(
          `✅ [REFRESH SUCCESS] Completed in ${endTime - startTime}ms`,
        );

        const { data } = response.data;
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;
        const expireIn = data.expireIn;

        console.log("🎫 [NEW TOKENS RECEIVED]", {
          accessTokenPreview: `${newAccessToken.substring(0, 20)}...`,
          refreshTokenPreview: `${newRefreshToken.substring(0, 20)}...`,
          expiresIn: `${expireIn} seconds`,
          expiresAt: new Date(
            Date.now() + parseInt(expireIn) * 1000,
          ).toISOString(),
        });

        // Update auth with new tokens but KEEP existing user data
        const { setAuth } = getAuthState();
        setAuth(admin, newAccessToken, newRefreshToken);

        console.log("💾 [STATE UPDATED] New tokens stored in auth state");
        console.log(
          "🔁 [RETRY REQUEST] Retrying original request with new token...",
        );

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        const retryResult = await apiClient(originalRequest);
        console.log(
          "✅ [RETRY SUCCESS] Original request completed successfully",
        );

        return retryResult;
      } catch (refreshError) {
        console.error("❌ [REFRESH FAILED] Token refresh failed");
        console.error("📋 [REFRESH ERROR DETAILS]", {
          error:
            refreshError instanceof Error
              ? refreshError.message
              : "Unknown error",
          response:
            refreshError instanceof AxiosError
              ? refreshError.response?.data
              : null,
        });
        console.log(
          "🚪 [LOGOUT] Forcing user logout due to refresh failure...",
        );

        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const handleLogout = () => {
  console.log("🚪 [LOGOUT HANDLER] Starting logout process...");

  const { logout } = getAuthState();
  logout();

  console.log("🗑️ [STATE CLEARED] Auth state cleared");

  if (typeof window !== "undefined") {
    console.log("🔀 [REDIRECT] Redirecting to /login...");
    window.location.href = "/login";
  }
};

// Export getErrorMessage from errorHandler for backward compatibility
export { getErrorMessage };

export default apiClient;