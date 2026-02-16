import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAuthState } from "../store/slices/authSlice";
import { config } from "../config/config";

/**
 * ✅ CRITICAL FOR VITE PROXY:
 * Use empty baseURL to let Vite's proxy handle the requests
 * Vite proxy forwards /v1/* → http://localhost:8082/v1/*
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: "",
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5174",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "content-Type, Authorization",
  },
});

/**
 * Get user-friendly error message from API error
 */
export const getErrorMessage = (error: any): string => {
  // Handle network errors
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "Request timeout. Please check your connection and try again.";
    }
    if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error")
    ) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    return "Unable to connect to the server. Please check your internet connection.";
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // Extract error message from various response formats
  let errorMessage =
    data?.customerMessage ||
    data?.message ||
    data?.error ||
    data?.responseDesc ||
    error.message;

  // Map common backend errors to user-friendly messages
  if (typeof errorMessage === "string") {
    const lowerMessage = errorMessage.toLowerCase();

    // Authentication errors
    if (
      lowerMessage.includes("bad credentials") ||
      lowerMessage.includes("invalid credentials") ||
      lowerMessage.includes("incorrect password")
    ) {
      return "Invalid email or password. Please check your credentials and try again.";
    }

    if (
      lowerMessage.includes("user not found") ||
      lowerMessage.includes("user does not exist") ||
      lowerMessage.includes("no account found")
    ) {
      return "No account found with this email. Please sign up first.";
    }

    if (
      lowerMessage.includes("email already exists") ||
      lowerMessage.includes("email already in use")
    ) {
      return "An account with this email already exists. Please login instead.";
    }

    if (lowerMessage.includes("phone") && lowerMessage.includes("already")) {
      return "This phone number is already registered. Please use a different number.";
    }

    // Verification errors
    if (
      lowerMessage.includes("invalid verification token") ||
      lowerMessage.includes("invalid token")
    ) {
      return "Invalid verification code. Please check the code and try again.";
    }

    if (
      lowerMessage.includes("verification token expired") ||
      lowerMessage.includes("token expired")
    ) {
      return "Verification code has expired. Please request a new code.";
    }

    if (lowerMessage.includes("token already used")) {
      return "This verification code has already been used. Please login or request a new code.";
    }

    // Account status errors
    if (
      lowerMessage.includes("account disabled") ||
      lowerMessage.includes("account locked")
    ) {
      return "Your account has been disabled. Please contact support.";
    }

    if (lowerMessage.includes("email not verified")) {
      return "Please verify your email before logging in.";
    }

    // If we have a customerMessage, use it as-is
    if (data?.customerMessage) {
      return data.customerMessage;
    }
  }

  // HTTP status-based messages
  switch (status) {
    case 400:
      return (
        errorMessage ||
        "Invalid request. Please check your information and try again."
      );
    case 401:
      return errorMessage || "Your session has expired. Please login again.";
    case 403:
      return "Access denied. You do not have permission to perform this action.";
    case 404:
      return errorMessage || "Service not found. Please try again later.";
    case 409:
      return (
        errorMessage ||
        "This information is already registered. Please use different details."
      );
    case 422:
      return (
        errorMessage || "Invalid data provided. Please check your information."
      );
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return errorMessage || "An unexpected error occurred. Please try again.";
  }
};

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const skipAuthInjection = (config as any).skipAuthInjection;

    console.log("🔵 [API REQUEST]", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      skipAuthInjection: skipAuthInjection || false,
      timestamp: new Date().toISOString(),
    });

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
      data: error.response?.data,
      code: error.code,
    });

    // CRITICAL: Do NOT intercept errors for public endpoints
    const publicEndpoints = [
      "/v1/auth/login",
      "/v1/sign-up/customer",
      "/v1/sign-up/service-provider",
      "/v1/verification/email",
      "/v1/verification/resend-code",
      "/v1/auth/google-callback",
      "/v1/auth/google",
      "/v1/auth/google-mobile-login",
      "/v1/forgot-password",
      "/v1/reset-password",
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      error.config?.url?.includes(endpoint),
    );

    if (isPublicEndpoint) {
      console.log("🔓 [PUBLIC ENDPOINT] Passing error to component");
      return Promise.reject(error);
    }

    // Don't retry if this is the logout endpoint failing
    if (error.config?.url?.includes("/logout")) {
      console.log("🚪 [LOGOUT ERROR] Not retrying logout request");
      return Promise.reject(error);
    }

    // Don't retry if this is already a refresh request failing
    if (error.config?.url?.includes("/v1/auth/refresh")) {
      console.log("🔄 [REFRESH FAILED] Not retrying refresh request");
      // Clear auth and let the user login again
      const { logout } = getAuthState();
      logout();
      return Promise.reject(error);
    }

    // Only handle 401 for protected endpoints with existing auth
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⚠️ [401 UNAUTHORIZED] Token expired or invalid");

      const { refreshToken, serviceProvider } = getAuthState();

      // If no refresh token or service provider, user needs to login
      if (!refreshToken || !serviceProvider) {
        console.log(
          "⚠️ [NO AUTH DATA] No refresh token available - user needs to login",
        );
        return Promise.reject(error);
      }

      console.log("🔄 [TOKEN REFRESH] Starting token refresh process...");
      originalRequest._retry = true;

      console.log("📋 [REFRESH STATE]", {
        hasRefreshToken: !!refreshToken,
        hasServiceProvider: !!serviceProvider,
        refreshTokenPreview: refreshToken
          ? `${refreshToken.substring(0, 20)}...`
          : "none",
        serviceProviderId: serviceProvider?.id,
        serviceProviderEmail: serviceProvider?.email,
      });

      try {
        console.log("📡 [CALLING REFRESH ENDPOINT] POST /v1/auth/refresh");
        const startTime = Date.now();

        // ✅ CRITICAL FIX: Create separate axios instance for refresh
        // This avoids interceptor loops and uses the same proxy configuration
        const refreshClient = axios.create({
          baseURL: "", // ✅ Empty to use Vite proxy
          timeout: config.api.timeout,
        });

        const response = await refreshClient.post(
          "/v1/auth/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              "Content-Type": "application/json",
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

        // Update auth with new tokens but KEEP existing service provider data
        const { setAuth } = getAuthState();
        setAuth(serviceProvider, newAccessToken, newRefreshToken);

        console.log("💾 [STATE UPDATED] New tokens stored in auth state");
        console.log(
          "🔁 [RETRY REQUEST] Retrying original request with new token...",
        );

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

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
          code: refreshError instanceof AxiosError ? refreshError.code : null,
        });
        console.log("🚪 [LOGOUT] Session expired - clearing auth state");

        // Clear auth state
        const { logout } = getAuthState();
        logout();

        // Reject with a user-friendly error message
        const userError = new Error(
          "Your session has expired. Please login again.",
        );
        return Promise.reject(userError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
