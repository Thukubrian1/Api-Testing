import { getRefreshToken, saveToken, saveRefreshToken, clearTokens } from './tokenStorage';
import { authApi } from '../api/endpoints/auth.api';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh
 */
const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when token is refreshed
 */
const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  if (isRefreshing) {
    // If already refreshing, wait for the refresh to complete
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await authApi.refreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Save new tokens
    saveToken(accessToken);
    if (newRefreshToken) {
      saveRefreshToken(newRefreshToken);
    }

    // Notify subscribers
    onTokenRefreshed(accessToken);

    return accessToken;
  } catch (error) {
    // If refresh fails, clear all tokens
    clearTokens();
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Check if currently refreshing token
 */
export const isRefreshingToken = (): boolean => {
  return isRefreshing;
};