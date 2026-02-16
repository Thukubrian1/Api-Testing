import type { 
  AuthResponse, 
  LoginCredentials, 
  SignupStep1Data,
  VerifyAndCreateAccountData,
  SubmitDetailsResponse,
  ApiResponse,
  AuthTokenData,
  User,
} from '../../types/auth.types';
import apiClient, { getErrorMessage } from '../client';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

interface JwtPayload {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  clientName?: string;
  phone?: string;
  iat?: number;
  exp?: number;
  picture?: string;
  avatar?: string;
  email_verified?: boolean;
  emailVerification?: boolean;
  isEnabled?: boolean;
  status?: string;
}

/**
 * Helper function to decode JWT and extract user info
 */
const decodeToken = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Extract user data from token payload
 */
const extractUserFromToken = (token: string): AuthResponse['user'] => {
  const payload = decodeToken(token);
  if (!payload) {
    throw new Error('Invalid token format');
  }

  console.log('📋 [TOKEN PAYLOAD]', payload);
  
  return {
    id: payload.sub || payload.userId || payload.id || 'unknown',
    email: payload.email || '',
    name: payload.clientName || '',
    phone: payload.phone || undefined,
    avatar: payload.picture || payload.avatar || undefined,
    emailVerification: payload.emailVerification || payload.email_verified || false,
    isEnabled: payload.isEnabled || false,
    status: payload.status || 'INACTIVE',
    createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Get user by ID - Fetch full user details from backend
 * Backend: GET /v1/user/{id}
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    console.log('📡 [API] GET /v1/user/' + userId);
    
    const response = await apiClient.get<ApiResponse<User>>(
      `/v1/user/${userId}`
    );
    
    console.log('✅ [API] User fetched successfully:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get all users (paginated)
 * Backend: GET /v1/user/get-all
 */
export const getAllUsers = async (pageNo: number = 0, pageSize: number = 10): Promise<{
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}> => {
  try {
    console.log(`📡 [API] GET /v1/user/get-all?pageNo=${pageNo}&pageSize=${pageSize}`);
    
    const response = await apiClient.get<ApiResponse<{
      content: User[];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    }>>(
      `/v1/user/get-all?pageNo=${pageNo}&pageSize=${pageSize}`
    );
    
    console.log('✅ [API] Users fetched successfully');
    
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get all users error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Step 1: Submit user details and request verification code
 * Backend: POST /v1/sign-up/customer
 * Body: { email, fullName, phone? }
 * Returns: BaseResponse<UserDTO> (NO tokens)
 */
export const submitUserDetails = async (data: SignupStep1Data): Promise<SubmitDetailsResponse> => {
  try {
    console.log('📡 [API] POST /v1/sign-up/customer');
    
    const normalizedPhone = data.phone ? normalizePhoneNumber(data.phone) : undefined;
    
    const payload = {
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      phone: normalizedPhone,
    };
    
    console.log('📤 [API] Sending payload:', {
      ...payload,
      phone: payload.phone || '(empty)',
    });
    
    const response = await apiClient.post<ApiResponse<User>>(
      '/v1/sign-up/customer',
      payload
    );
    
    console.log('✅ [API] User created (pending verification)');
    console.log('📧 [API] Verification token should be sent to email');
    
    return {
      message: response.data.customerMessage || 'Verification code sent to your email',
      email: data.email,
    };
  } catch (error) {
    console.error('❌ [API] Submit details error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Step 2: Verify code and set password
 * Backend: POST /v1/verification/email
 * Body: { token: string, password: string }
 * Returns: BaseResponse<UserDTO> (NO auth tokens)
 * NOTE: User must login after verification to get JWT tokens
 */
export const verifyAndCreateAccount = async (
  data: VerifyAndCreateAccountData
): Promise<{ message: string; email: string }> => {
  try {
    console.log('📡 [API] POST /v1/verification/email');
    
    const payload = {
      token: data.verificationCode.trim(),
      password: data.password,
    };
    
    console.log('📤 [API] Sending payload:', {
      token: payload.token,
      password: '***',
    });
    
    const response = await apiClient.post<ApiResponse<User>>(
      '/v1/verification/email',
      payload
    );
    
    console.log('✅ [API] Email verified, password set');
    console.log('ℹ️ [API] User must now login to get tokens');
    
    return {
      message: response.data.customerMessage || 'Account verified successfully! Please login.',
      email: data.email,
    };
  } catch (error) {
    console.error('❌ [API] Verify and create error:', error);
    // Throw error to be handled by the component - DO NOT redirect here
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Resend verification code
 * Note: Your backend may not have a dedicated resend endpoint
 * If this fails, you may need to add this endpoint to your backend
 */
export const resendVerificationCode = async (email: string): Promise<{ message: string }> => {
  try {
    console.log('📡 [API] POST /v1/verification/resend-code');
    
    // Try dedicated resend endpoint first
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/v1/verification/resend-code',
      { email: email.trim().toLowerCase() }
    );
    
    console.log('✅ [API] Verification code resent');
    
    return {
      message: response.data.customerMessage || 'Verification code sent',
    };
  } catch (error) {
    console.error('❌ [API] Resend code error:', error);
    console.warn('⚠️ [API] If endpoint does not exist, you may need to add it to your backend');
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Login - Returns auth tokens
 * Backend: POST /v1/auth/login
 * Headers: x-role (required)
 * Body: { email, password }
 * Returns: BaseResponse<AuthResponseDTO> with { accessToken, refreshToken, clientName, expireIn }
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('📡 [API] POST /v1/auth/login');
    
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };
    
    console.log('📤 [API] Login payload:', { 
      email: payload.email, 
      password: '***',
      role: credentials.role 
    });
    
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      '/v1/auth/login',
      payload,
      {
        headers: {
          'x-role': credentials.role,
        }
      }
    );
    
    const { data } = response.data;
    
    console.log('✅ [API] Login successful');
    console.log('🎫 [API] Received tokens:', {
      accessToken: data.accessToken.substring(0, 20) + '...',
      refreshToken: data.refreshToken.substring(0, 20) + '...',
      clientName: data.clientName,
      expireIn: data.expireIn,
    });
    
    const user = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    // Fetch full user details from backend to get the actual name
    try {
      console.log('📡 [API] Fetching full user details for personalized welcome...');
      const fullUser = await getUserById(user.id);
      
      console.log('✅ [API] Full user details fetched:', {
        name: fullUser.name,
        email: fullUser.email,
      });
      
      // Merge token user with fetched user details
      const completeUser: AuthResponse['user'] = {
        ...user,
        name: fullUser.name || user.name,
        phone: fullUser.phone || user.phone,
        avatar: fullUser.avatar || user.avatar,
      };
      
      return {
        user: completeUser,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn,
        clientName: data.clientName,
      };
    } catch (userFetchError) {
      // If fetching user details fails, use token data
      console.warn('⚠️ [API] Failed to fetch user details, using token data:', userFetchError);
      return {
        user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn,
        clientName: data.clientName,
      };
    }
  } catch (error) {
    console.error('❌ [API] Login error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Logout - Blacklists both tokens on backend
 * Backend: POST /v1/logout
 * Headers: Authorization: Bearer <accessToken>
 * Body: { refreshToken }
 * 
 * IMPORTANT: Uses direct axios call to avoid interceptor conflicts
 */
export const logout = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    console.log('📡 [AUTH API] POST /v1/logout');
    console.log('🔐 [AUTH API] Access token (first 30 chars):', accessToken.substring(0, 30) + '...');
    console.log('🔄 [AUTH API] Refresh token (first 30 chars):', refreshToken.substring(0, 30) + '...');
    
    // Decode tokens to verify they're valid before sending
    const accessPayload = decodeToken(accessToken);
    const refreshPayload = decodeToken(refreshToken);
    
    console.log('🔍 [AUTH API] Access Token Payload:', {
      sub: accessPayload?.sub,
      exp: accessPayload?.exp,
      expDate: accessPayload?.exp ? new Date(accessPayload.exp * 1000).toISOString() : 'unknown',
      isExpired: accessPayload?.exp ? accessPayload.exp < Date.now() / 1000 : 'unknown',
    });
    
    console.log('🔍 [AUTH API] Refresh Token Payload:', {
      sub: refreshPayload?.sub,
      exp: refreshPayload?.exp,
      expDate: refreshPayload?.exp ? new Date(refreshPayload.exp * 1000).toISOString() : 'unknown',
      isExpired: refreshPayload?.exp ? refreshPayload.exp < Date.now() / 1000 : 'unknown',
    });
    
    // Prepare request config
    const requestConfig = {
      method: 'POST',
      url: '/v1/logout',
      data: { refreshToken },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    
    console.log('📋 [AUTH API] Request Config:', {
      method: requestConfig.method,
      url: requestConfig.url,
      headers: {
        Authorization: requestConfig.headers.Authorization.substring(0, 40) + '...',
        ContentType: requestConfig.headers['Content-Type'],
      },
      body: {
        refreshToken: refreshToken.substring(0, 30) + '...',
      },
    });
    
    const response = await apiClient.post(
      '/v1/logout',
      { refreshToken },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        // Flag to skip auth injection in interceptor
        skipAuthInjection: true,
      } as any
    );
    
    console.log('✅ [AUTH API] Logout successful');
    console.log('📊 [AUTH API] Response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [AUTH API] Logout error:', error);
    console.error('📋 [AUTH API] Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    });
    
    // Log the full error response for debugging
    if (error.response) {
      console.error('🔴 [AUTH API] Full error response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
    }
    
    throw error;
  }
};

/**
 * Google OAuth callback
 * Backend: GET /v1/auth/google-callback
 */
export const googleCallback = async (
  code: string,
  state?: string
): Promise<AuthResponse> => {
  try {
    console.log('📡 [API] POST /v1/auth/google-callback');
    
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      '/v1/auth/google-callback',
      {
        code,
        ...(state && { state }),
      }
    );
    
    const { data } = response.data;
    const user = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    return {
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn,
      clientName: data.clientName,
    };
  } catch (error) {
    console.error('❌ [API] Google callback error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Refresh access token
 * Backend: POST /v1/auth/refresh
 * Headers: Authorization: Bearer <refreshToken>
 */
export const refreshTokenApi = async (
  refreshToken: string
): Promise<AuthResponse> => {
  try {
    console.log('📡 [AUTH API] POST /v1/auth/refresh');
    
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      '/v1/auth/refresh',
      {},
      {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      }
    );
    
    const { data } = response.data;
    const user = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    console.log('✅ [AUTH API] Token refreshed');
    
    return {
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn,
      clientName: data.clientName,
    };
  } catch (error) {
    console.error('❌ [AUTH API] Refresh error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const authApi = {
  // Two-step signup (RECOMMENDED)
  submitUserDetails,
  verifyAndCreateAccount,
  resendVerificationCode,
  
  // Authentication
  login,
  logout,
  
  // OAuth
  googleCallback,
  
  // Token management
  refreshToken: refreshTokenApi,
  
  // User management
  getUserById,
  getAllUsers,
};