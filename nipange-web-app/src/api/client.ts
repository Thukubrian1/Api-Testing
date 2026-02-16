import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getAuthState } from '../store/slices/authSlice';
import { config } from '../config/config';
import { getErrorMessage } from '../utils/errorHandler';

export const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin' : 'http://localhost:5175',
    'Access-Control-Allow-Methods' : 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers' : 'content-Type, Authorization',
  },
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if this request should skip automatic auth injection
    const skipAuthInjection = (config as any).skipAuthInjection;
    
    console.log('🔵 [API REQUEST]', {
      url: config.url,
      method: config.method,
      skipAuthInjection: skipAuthInjection || false,
      timestamp: new Date().toISOString(),
    });

    // Skip auth injection if explicitly requested (for logout endpoint)
    if (skipAuthInjection) {
      console.log('⏭️ [SKIP AUTH INJECTION] Authorization header already set explicitly');
      return config;
    }

    const { token } = getAuthState();
    
    console.log('🔵 [API REQUEST] Auth state:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [TOKEN ATTACHED] Token added to request headers');
    } else {
      console.log('⚠️ [NO TOKEN] Request sent without authentication');
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API SUCCESS]', {
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    console.log('🔴 [API ERROR]', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timestamp: new Date().toISOString(),
      method: error.config?.method,
      data: error.response?.data,
    });

    // CRITICAL FIX: Do NOT intercept errors for public endpoints (login, signup, verification)
    // These endpoints should return errors to the component for proper handling
    const publicEndpoints = [
      '/v1/auth/login',
      '/v1/sign-up/customer',
      '/v1/sign-up/service-provider',
      '/v1/verification/email',
      '/v1/verification/resend-code',
      '/v1/auth/google-callback',
      '/v1/auth/google',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );

    if (isPublicEndpoint) {
      console.log('🔓 [PUBLIC ENDPOINT] Passing error to component for handling');
      console.log('⚠️ [NO INTERCEPTOR ACTION] Component will handle this error');
      // Pass error directly to component without any interceptor action
      return Promise.reject(error);
    }

    // Don't retry if this is the logout endpoint failing
    if (error.config?.url?.includes('/logout')) {
      console.log('🚪 [LOGOUT ERROR] Not retrying logout request');
      return Promise.reject(error);
    }

    // Only handle 401 for protected endpoints with existing auth
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('⚠️ [401 UNAUTHORIZED] Token expired or invalid');
      
      const { refreshToken, user } = getAuthState();

      // If no refresh token or user, this is likely a login failure
      // Let the component handle it
      if (!refreshToken || !user) {
        console.log('⚠️ [NO AUTH DATA] Likely login failure - passing to component');
        return Promise.reject(error);
      }

      console.log('🔄 [TOKEN REFRESH] Starting token refresh process...');
      originalRequest._retry = true;

      console.log('📋 [REFRESH STATE]', {
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'none',
        userId: user?.id,
        userEmail: user?.email,
      });

      try {
        console.log('📡 [CALLING REFRESH ENDPOINT] POST /v1/auth/refresh');
        const startTime = Date.now();
        
        // Call refresh endpoint with refresh token in Authorization header
        const response = await axios.post(
          `${config.api.baseUrl}/v1/auth/refresh`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
            }
          }
        );
        
        const endTime = Date.now();
        console.log(`✅ [REFRESH SUCCESS] Completed in ${endTime - startTime}ms`);
        
        const { data } = response.data;
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;
        const expireIn = data.expireIn;
        
        console.log('🎫 [NEW TOKENS RECEIVED]', {
          accessTokenPreview: `${newAccessToken.substring(0, 20)}...`,
          refreshTokenPreview: `${newRefreshToken.substring(0, 20)}...`,
          expiresIn: `${expireIn} seconds`,
          expiresAt: new Date(Date.now() + parseInt(expireIn) * 1000).toISOString(),
        });

        // Update auth with new tokens but KEEP existing user data
        const { setAuth } = getAuthState();
        setAuth(user, newAccessToken, newRefreshToken);
        
        console.log('💾 [STATE UPDATED] New tokens stored in auth state');
        console.log('🔁 [RETRY REQUEST] Retrying original request with new token...');
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        const retryResult = await apiClient(originalRequest);
        console.log('✅ [RETRY SUCCESS] Original request completed successfully');
        
        return retryResult;
      } catch (refreshError) {
        console.error('❌ [REFRESH FAILED] Token refresh failed');
        console.error('📋 [REFRESH ERROR DETAILS]', {
          error: refreshError instanceof Error ? refreshError.message : 'Unknown error',
          response: refreshError instanceof AxiosError ? refreshError.response?.data : null,
        });
        console.log('🚪 [LOGOUT] Session expired - clearing auth state');
        
        // CRITICAL FIX: Don't use window.location.href - use navigation instead
        const { logout } = getAuthState();
        logout();
        
        // Store a flag to indicate session expired
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sessionExpired', 'true');
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export getErrorMessage from errorHandler for backward compatibility
export { getErrorMessage };

export default apiClient;