import { AxiosError } from 'axios';

/**
 * Extract user-friendly error message from various error types
 * Prioritizes user-friendly messages over technical error codes
 */
export const getErrorMessage = (error: unknown): string => {
  console.log('🔍 [ERROR HANDLER] Processing error:', error);

  // Handle AxiosError (API errors)
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const responseData = error.response?.data;

    console.log('📊 [ERROR HANDLER] Axios error - Status:', status);
    console.log('📋 [ERROR HANDLER] Response data:', responseData);

    // First, try to get user-friendly message from backend
    // But filter out technical messages
    if (responseData?.customerMessage) {
      const msg = responseData.customerMessage;
      // Don't use technical error messages
      if (!msg.includes('status code') && 
          !msg.includes('Request failed') &&
          !msg.includes('Network Error') &&
          !msg.includes('timeout')) {
        console.log('✅ [ERROR HANDLER] Using customer message:', msg);
        return msg;
      }
    }

    if (responseData?.message) {
      const msg = responseData.message;
      // Don't use technical error messages
      if (!msg.includes('status code') && 
          !msg.includes('Request failed') &&
          !msg.includes('Network Error') &&
          !msg.includes('timeout')) {
        console.log('✅ [ERROR HANDLER] Using message:', msg);
        return msg;
      }
    }

    // If backend message is technical or missing, use user-friendly messages based on status
    switch (status) {
      case 400:
        console.log('⚠️ [ERROR HANDLER] 400 Bad Request');
        return 'Invalid request. Please check your input and try again.';
      
      case 401:
        console.log('🔐 [ERROR HANDLER] 401 Unauthorized');
        return 'Invalid credentials. Please check your email and password.';
      
      case 403:
        console.log('🚫 [ERROR HANDLER] 403 Forbidden');
        return 'Access denied. Your account may be disabled or not verified.';
      
      case 404:
        console.log('🔍 [ERROR HANDLER] 404 Not Found');
        return 'Resource not found. Please check and try again.';
      
      case 409:
        console.log('🔄 [ERROR HANDLER] 409 Conflict');
        return 'This resource already exists. Please use different details.';
      
      case 422:
        console.log('⚠️ [ERROR HANDLER] 422 Unprocessable Entity');
        return 'Validation failed. Please check your input.';
      
      case 429:
        console.log('⏱️ [ERROR HANDLER] 429 Too Many Requests');
        return 'Too many attempts. Please wait a moment and try again.';
      
      case 500:
        console.log('💥 [ERROR HANDLER] 500 Server Error');
        return 'Server error. Please try again later.';
      
      case 502:
        console.log('🌐 [ERROR HANDLER] 502 Bad Gateway');
        return 'Service temporarily unavailable. Please try again later.';
      
      case 503:
        console.log('🔧 [ERROR HANDLER] 503 Service Unavailable');
        return 'Service is under maintenance. Please try again later.';
      
      case 504:
        console.log('⏰ [ERROR HANDLER] 504 Gateway Timeout');
        return 'Request timed out. Please try again.';
      
      default:
        console.log('❓ [ERROR HANDLER] Unknown status:', status);
        return 'An error occurred. Please try again.';
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const msg = error.message;
    
    // Filter out technical messages
    if (msg.includes('status code')) {
      console.log('⚠️ [ERROR HANDLER] Technical error message, using fallback');
      return 'An error occurred. Please try again.';
    }
    
    if (msg.includes('Request failed')) {
      console.log('⚠️ [ERROR HANDLER] Generic request failure');
      return 'Request failed. Please check your connection and try again.';
    }
    
    if (msg.includes('Network Error')) {
      console.log('🌐 [ERROR HANDLER] Network error');
      return 'Network error. Please check your internet connection.';
    }
    
    if (msg.includes('timeout')) {
      console.log('⏰ [ERROR HANDLER] Timeout error');
      return 'Request timed out. Please try again.';
    }

    console.log('✅ [ERROR HANDLER] Using error message:', msg);
    return msg;
  }

  // Handle string errors
  if (typeof error === 'string') {
    console.log('📝 [ERROR HANDLER] String error:', error);
    return error;
  }

  // Fallback for unknown error types
  console.log('❓ [ERROR HANDLER] Unknown error type');
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if an error is a network error (offline, DNS, etc.)
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && Boolean(error.request);
  }
  return false;
};

/**
 * Check if an error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
};

/**
 * Check if an error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 400 || error.response?.status === 422;
  }
  return false;
};

/**
 * Check if an error is a server error
 */
export const isServerError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status ? status >= 500 : false;
  }
  return false;
};