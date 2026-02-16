import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/endpoints/auth.api';
import { useToast } from '../contexts/ToastContext';
import type { ForgotPasswordRequest } from '../types/auth.types';

/**
 * Custom hook for password reset request
 */
export const useForgotPassword = () => {
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: () => {
      success('Password reset instructions sent to your email');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      showError(message);
    },
  });
};

/**
 * Custom hook for password reset (with token)
 * Note: You'll need to add the resetPassword endpoint to auth.api.ts
 */
export const useResetPassword = () => {
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      // TODO: Implement resetPassword in auth.api.ts
      throw new Error('Reset password endpoint not implemented');
    },
    onSuccess: () => {
      success('Password reset successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      showError(message);
    },
  });
};

/**
 * Custom hook for changing password (for logged-in users)
 * Note: You'll need to add the changePassword endpoint to auth.api.ts
 */
export const useChangePassword = () => {
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      // TODO: Implement changePassword in auth.api.ts
      throw new Error('Change password endpoint not implemented');
    },
    onSuccess: () => {
      success('Password changed successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      showError(message);
    },
  });
};