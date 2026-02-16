import axios from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // API error response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.customerMessage) {
      return error.response.data.customerMessage;
    }
    // Network error
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Create a standardized ApiError object
 */
export const createApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: getErrorMessage(error),
      code: error.code,
      status: error.response?.status,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: getErrorMessage(error),
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && !!error.request;
  }
  return false;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Check if error is a forbidden error (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }
  return false;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404;
  }
  return false;
};

/**
 * Check if error is a validation error (400 or 422)
 */
export const isValidationError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return status === 400 || status === 422;
  }
  return false;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.';
  }

  if (isForbiddenError(error)) {
    return "You don't have permission to perform this action.";
  }

  if (isNotFoundError(error)) {
    return 'The requested resource was not found.';
  }

  if (isValidationError(error)) {
    return getErrorMessage(error);
  }

  return getErrorMessage(error);
};

/**
 * Log error to console in development
 */
export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
};