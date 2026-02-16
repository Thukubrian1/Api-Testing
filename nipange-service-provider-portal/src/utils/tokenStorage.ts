/**
 * Token storage utilities for managing JWT tokens
 */

const TOKEN_KEY = 'ni-pange-token';
const REFRESH_TOKEN_KEY = 'ni-pange-refresh-token';
const TOKEN_EXPIRY_KEY = 'ni-pange-token-expiry';

/**
 * Save access token to localStorage
 */
export const saveToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Get access token from localStorage
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove access token from localStorage
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Save refresh token to localStorage
 */
export const saveRefreshToken = (refreshToken: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

/**
 * Save token expiry time
 */
export const saveTokenExpiry = (expiresIn: number): void => {
  try {
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error saving token expiry:', error);
  }
};

/**
 * Get token expiry time
 */
export const getTokenExpiry = (): number | null => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() >= expiry;
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  removeToken();
  removeRefreshToken();
  try {
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Decode JWT token payload (without verification)
 */
export const decodeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token: string): string | null => {
  const payload = decodeToken(token);
  return payload?.sub || payload?.userId || null;
};

/**
 * Check if token exists
 */
export const hasToken = (): boolean => {
  return !!getToken();
};

/**
 * Check if refresh token exists
 */
export const hasRefreshToken = (): boolean => {
  return !!getRefreshToken();
};