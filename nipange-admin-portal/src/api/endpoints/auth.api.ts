import type { 
  ApiResponse,
  AuthResponse, 
  AuthTokenData, 
  LoginCredentials, 
} from '../../types/auth.types';
import apiClient, { getErrorMessage } from '../client';

interface JwtPayload {
  sub?: string;
  adminId?: string;
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
const extractUserFromToken = (token: string): AuthResponse['admin'] => {
  const payload = decodeToken(token);
  if (!payload) {
    throw new Error('Invalid token format');
  }

  console.log('📋 [TOKEN PAYLOAD]', payload);
  
  return {
    id: payload.sub || payload.adminId || payload.id || 'unknown',
    email: payload.email || '',
    name: payload.fullName || payload.name || 'User',
    phone: payload.phone || undefined,
    logoUrl: payload.picture || payload.photoUrl || undefined,
    status: payload.status || 'INACTIVE',
    createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};


/**
 * Login - Returns auth tokens
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('📡 [API] POST /v1/auth/login');
    
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };
    
    console.log('📤 [API] Login payload:', { email: payload.email, password: '***' });
    
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      '/v1/auth/login',
      payload
    );
    
    const { data } = response.data;
    
    console.log('✅ [API] Login successful');
    
    const admin = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    return {
      admin,
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
    const admin = extractUserFromToken(data.accessToken);
    const expiresIn = parseInt(data.expireIn, 10);
    
    console.log('✅ [AUTH API] Token refreshed');
    
    return {
      admin,
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
  login,
  logout,
  refreshToken: refreshTokenApi,
};