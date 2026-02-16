import React, { useState, useEffect } from "react";
import { SignupStep1Details } from "./SignupStep1Details";
import { SignupStep2Verification } from "./SignupStep2Details";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/endpoints/auth.api";
import { useToast } from "../../contexts/ToastContext";
import { useAuthStore } from "../../store/slices/authSlice";
import type { ServiceProviderSignupStep1Data } from "../../types/auth.types";

export const SignupContainer: React.FC = () => {
  const navigate = useNavigate();
  const { setError, clearError } = useAuthStore();
  const { success, error: showError } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [userDetails, setUserDetails] = useState<ServiceProviderSignupStep1Data | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Step 1: Submit service provider details and request verification code
  const submitDetailsMutation = useMutation({
    mutationFn: async (data: ServiceProviderSignupStep1Data) => {
      console.log('🚀 [STEP 1 MUTATION] Calling submitServiceProviderDetails API');
      const response = await authApi.submitServiceProviderDetails(data);
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ [STEP 1 SUCCESS]', response);
      setUserDetails(variables);
      setCurrentStep(2);
      // Only show toast for successful submission
      success(response.message || `Service provider created! Verification code sent to ${variables.email}`);
      startResendTimer();
      clearError();
    },
    onError: (error) => {
      console.error('❌ [STEP 1 ERROR]', error);
      const message =
        error instanceof Error ? error.message : "Failed to create service provider account";
      
      // Set error in store for persistence
      setError(message);
      
      // Show toast only for server/network errors
      showError(message);
      
      // DO NOT redirect - stay on step 1
      console.log('🚫 [STEP 1] Staying on page for user to retry');
    },
  });

  // Step 2: Verify code and set password
  const verifyAndCreateMutation = useMutation({
    mutationFn: async (data: { verificationCode: string; password: string }) => {
      if (!userDetails) {
        throw new Error("Service provider details not found");
      }

      console.log('🚀 [STEP 2 MUTATION] Calling verifyAndCreateAccount API');
      
      // Clear previous verification error
      setVerificationError(null);
      
      const response = await authApi.verifyAndCreateAccount({
        email: userDetails.email,
        ...data,
      });
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ [STEP 2 SUCCESS] Service provider account verified successfully');
      console.log('ℹ️ [STEP 2] Service provider must now login to get tokens');
      
      // Clear any errors
      clearError();
      setVerificationError(null);
      
      // Show success message
      success(
        response.message || 'Service provider account verified successfully! Redirecting to login...'
      );

      // Redirect to login page after successful verification
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { 
            email: userDetails?.email,
            accountCreated: true,
            message: 'Your service provider account has been verified! Please login to continue.'
          }
        });
      }, 1500);
    },
    onError: (error) => {
      console.error('❌ [STEP 2 ERROR]', error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to verify account. Please try again.";
      
      // Set verification-specific error (for inline display)
      setVerificationError(message);
      
      // Set error in auth store
      setError(message);
      
      // DO NOT show toast for verification errors - they're shown inline
      // Only show toast for server errors
      if (message.toLowerCase().includes('server') || 
          message.toLowerCase().includes('network') ||
          message.toLowerCase().includes('timeout')) {
        showError(message);
      }
      
      // CRITICAL: Stay on Step 2 for user to retry - DO NOT REDIRECT
      console.log('⚠️ [STEP 2] Staying on verification page for user to retry');
    },
  });

  // Resend verification code
  const resendCodeMutation = useMutation({
    mutationFn: async () => {
      if (!userDetails) {
        throw new Error("Service provider details not found");
      }
      console.log('🔄 [RESEND] Calling resendVerificationCode API');
      const response = await authApi.resendVerificationCode(userDetails.email);
      return response;
    },
    onSuccess: () => {
      console.log('✅ [RESEND SUCCESS]');
      success("New verification code sent to your email");
      setCanResend(false);
      setResendCountdown(60);
      setVerificationError(null);
      startResendTimer();
    },
    onError: (error) => {
      console.error('❌ [RESEND ERROR]', error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to resend code. Please try again.";
      showError(message);
    },
  });

  const startResendTimer = () => {
    setCanResend(false);
    setResendCountdown(60);
  };

  const handleBackToStep1 = () => {
    console.log('⬅️ [NAVIGATION] Going back to Step 1');
    setCurrentStep(1);
    setVerificationError(null);
    clearError();
  };

  // Countdown timer for resend
  useEffect(() => {
    if (currentStep !== 2 || canResend) {
      return;
    }

    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
    
    if (resendCountdown === 0) {
      const timeoutId = setTimeout(() => {
        setCanResend(true);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentStep, resendCountdown, canResend]);

  return (
    <>
      {currentStep === 1 ? (
        <SignupStep1Details
          onContinue={(data) => submitDetailsMutation.mutate(data)}
          isLoading={submitDetailsMutation.isPending}
        />
      ) : (
        <SignupStep2Verification
          email={userDetails?.email || ""}
          onSubmit={(data) => verifyAndCreateMutation.mutate(data)}
          onResendCode={() => resendCodeMutation.mutate()}
          onBack={handleBackToStep1}
          isLoading={verifyAndCreateMutation.isPending || resendCodeMutation.isPending}
          canResend={canResend}
          resendCountdown={resendCountdown}
          verificationError={verificationError}
        />
      )}
    </>
  );
};