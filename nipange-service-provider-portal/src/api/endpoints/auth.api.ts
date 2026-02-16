import type { 
  AuthResponse, 
  LoginCredentials, 
  ServiceProviderSignupStep1Data,
  VerifyAndCreateAccountData,
  SubmitDetailsResponse,
  ApiResponse,
  AuthTokenData,
  ServiceProvider,
} from '../../types/auth.types';
import type { User } from '../../types/profile.types';
import apiClient from '../client';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

interface JwtPayload {
  sub?: string;
  ServiceProviderId?: string;
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  iat?: number;
  exp?: number;
  picture?: string;
  photoUrl?: string;
  status?: string;
  serviceProviderType?: string;
}

/**
 * Get user-friendly error message from API error
 */
const getErrorMessage = (error: any): string => {
  // Handle network errors
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
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
  if (typeof errorMessage === 'string') {
    const lowerMessage = errorMessage.toLowerCase();
    
    // Authentication errors
    if (lowerMessage.includes('bad credentials') || lowerMessage.includes('invalid credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    
    if (lowerMessage.includes('user not found') || lowerMessage.includes('user does not exist')) {
      return 'No account found with this email. Please sign up first.';
    }
    
    if (lowerMessage.includes('email already exists') || lowerMessage.includes('email already in use')) {
      return 'An account with this email already exists. Please login instead.';
    }
    
    if (lowerMessage.includes('phone') && lowerMessage.includes('already')) {
      return 'This phone number is already registered. Please use a different number.';
    }
    
    // Verification errors
    if (lowerMessage.includes('invalid verification token') || lowerMessage.includes('invalid token')) {
      return 'Invalid verification code. Please check the code and try again.';
    }
    
    if (lowerMessage.includes('verification token expired') || lowerMessage.includes('token expired')) {
      return 'Verification code has expired. Please request a new code.';
    }
    
    if (lowerMessage.includes('token already used')) {
      return 'This verification code has already been used. Please login or request a new code.';
    }
    
    // Account status errors
    if (lowerMessage.includes('account disabled') || lowerMessage.includes('account locked')) {
      return 'Your account has been disabled. Please contact support.';
    }
    
    if (lowerMessage.includes('email not verified')) {
      return 'Please verify your email before logging in.';
    }
  }

  // HTTP status-based messages
  switch (status) {
    case 400:
      return errorMessage || 'Invalid request. Please check your information and try again.';
    case 401:
      return errorMessage || 'Invalid email or password. Please try again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return errorMessage || 'Service not found. Please try again later.';
    case 409:
      return errorMessage || 'This information is already registered. Please use different details.';
    case 422:
      return errorMessage || 'Invalid data provided. Please check your information.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return errorMessage || 'An unexpected error occurred. Please try again.';
  }
};

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
const extractUserFromToken = (token: string): AuthResponse['serviceProvider'] => {
  const payload = decodeToken(token);
  if (!payload) {
    throw new Error('Invalid token format');
  }

  console.log('🔐 [TOKEN PAYLOAD]', payload);
  
  return {
    id: payload.sub || payload.ServiceProviderId || payload.id || 'unknown',
    email: payload.email || '',
    name: payload.fullName || payload.name || 'Service Provider',
    phone: payload.phone || undefined,
    logoUrl: payload.picture || payload.photoUrl || undefined,
    status: payload.status || 'INACTIVE',
    serviceProviderType: payload.serviceProviderType || '',
    createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * NEW: Get user by email to extract full name for welcome message
 * This uses the /v1/user/:id endpoint
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    console.log('📡 [API] Fetching user by email:', email);
    
    // First, get all users and find the one with matching email
    const response = await apiClient.get<ApiResponse<{ content: User[] }>>(
      '/v1/user/get-all'
    );
    
    const users = response.data.data.content;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('⚠️ [API] User not found with email:', email);
      return null;
    }
    
    console.log('✅ [API] User found:', user.name);
    return user;
  } catch (error) {
    console.error('❌ [API] Get user by email error:', error);
    // Don't throw error - just return null and let login continue
    return null;
  }
};

/**
 * Step 1: Submit SERVICE PROVIDER details and request verification code
 * Backend: POST /v1/sign-up/service-provider
 * Body: { name, email, phoneNo }
 * Returns: BaseResponse<UserDTO> (NO tokens)
 */
export const submitServiceProviderDetails = async (
  data: ServiceProviderSignupStep1Data
): Promise<SubmitDetailsResponse> => {
  try {
    console.log('📡 [API] POST /v1/sign-up/service-provider');
    console.log('📋 [API] Raw input data:', data);
    
    // Normalize phone number
    let normalizedPhone: string;
    try {
      const normalized = normalizePhoneNumber(data.phoneNo);
      normalizedPhone = normalized || data.phoneNo;
    } catch (error) {
      console.warn('⚠️ [API] Phone normalization failed, using original value');
      normalizedPhone = data.phoneNo;
    }
    
    // Create payload with minimal fields
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNo: normalizedPhone,
    };
    
    console.log('📤 [API] Sending payload:', payload);
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
      '/v1/sign-up/service-provider',
      payload
    );
    
    console.log('✅ [API] Service provider created (pending verification)');
    console.log('📧 [API] Verification token should be sent to email');
    
    return {
      message: response.data.customerMessage || 'Verification code sent to your email',
      email: data.email,
    };
  } catch (error) {
    console.error('❌ [API] Submit service provider details error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Step 2: Verify code and set password
 * Backend: POST /v1/verification/email
 * Body: { token: string, password: string }
 * Returns: BaseResponse<UserDTO> (NO auth tokens)
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
    
    console.log('📤 [API] Sending verification payload');
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
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
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Resend verification code
 */
export const resendVerificationCode = async (email: string): Promise<{ message: string }> => {
  try {
    console.log('📡 [API] POST /v1/verification/resend-code');
    
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
 * ✅ CRITICAL FIX: JWT contains service_provider_id but we need user_id
 * This fetches user by email to get the ACTUAL user ID and complete service provider data
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
    
    // Extract data from JWT token (contains SERVICE PROVIDER ID - WRONG!)
    let serviceProvider = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    console.log('🔍 [API] JWT token data extracted');
    console.log('⚠️  [API] JWT ID (service_provider_id):', serviceProvider.id);
    console.log('⚠️  [API] JWT name from token:', serviceProvider.name);
    
    // ✅ CRITICAL FIX: Fetch full user to get ACTUAL USER ID and COMPLETE SERVICE PROVIDER DATA
    try {
      const user = await getUserByEmail(credentials.email);
      if (user && user.serviceProvider) {
        console.log('✅ [API] User details fetched from database');
        console.log('📋 [API] ACTUAL USER ID:', user.id);
        console.log('📋 [API] USER NAME:', user.name);
        console.log('📋 [API] SERVICE PROVIDER ID:', user.serviceProvider.id);
        console.log('📋 [API] SERVICE PROVIDER NAME:', user.serviceProvider.name);
        console.log('📋 [API] SERVICE PROVIDER TYPE:', user.serviceProvider.serviceProviderType);
        console.log('💡 [API] User ID and Service Provider ID are different! Using USER ID for auth state.');
        
        // ✅ CRITICAL FIX: Build complete service provider object from database data
        // This ensures we have the correct name, type, and all other fields right from login
        serviceProvider = {
          id: user.id,  // ✅ CRITICAL: Use USER ID, NOT service provider ID
          name: user.serviceProvider.name || user.name,  // ✅ FIX: Use service provider name from database
          email: user.serviceProvider.email || user.email,
          phone: user.serviceProvider.phoneNo || user.phone,
          status: user.serviceProvider.status,
          logoUrl: user.serviceProvider.logoUrl || undefined,
          serviceProviderType: user.serviceProvider.serviceProviderType || '',
          createdAt: user.createdAt,
          updatedAt: user.updateAt,
        };
        
        console.log('✅ [API] Auth state built with complete database data:');
        console.log('  - ID (user_id):', serviceProvider.id);
        console.log('  - Name:', serviceProvider.name);
        console.log('  - Type:', serviceProvider.serviceProviderType);
        console.log('  - Status:', serviceProvider.status);
      } else {
        console.warn('⚠️  [API] Could not fetch user or service provider data - using JWT data');
        console.warn('⚠️  [API] Name may show as "Service Provider" and type may be missing');
      }
    } catch (userError) {
      console.error('❌ [API] Failed to fetch user details:', userError);
      console.warn('⚠️  [API] Using token data - name and profile may not display correctly');
    }
    
    return {
      serviceProvider,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error('❌ [API] Login error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Logout
 */
export const logout = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    console.log('📡 [AUTH API] POST /v1/logout');
    
    await apiClient.post(
      '/v1/logout', 
      { refreshToken },
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    
    console.log('✅ [AUTH API] Logout successful');
  } catch (error) {
    console.error('❌ [AUTH API] Logout error:', getErrorMessage(error));
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshTokenApi = async (
  refreshToken: string
): Promise<AuthResponse> => {
  try {
    console.log('📡 [AUTH API] POST /v1/auth/refresh');
    
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      '/v1/auth/refresh',
      {},
      { headers: { 'Authorization': `Bearer ${refreshToken}` } }
    );
    
    const { data } = response.data;
    const serviceProvider = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    console.log('✅ [AUTH API] Token refreshed');
    
    return {
      serviceProvider,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error('❌ [AUTH API] Refresh error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const authApi = {
  submitServiceProviderDetails,
  verifyAndCreateAccount,
  resendVerificationCode,
  login,
  logout,
  refreshToken: refreshTokenApi,
  getUserByEmail,
};