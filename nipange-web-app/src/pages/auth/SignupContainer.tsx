import React, { useState, useEffect } from "react";
import { SignupStep1Details } from "./SignupStep1Details";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/endpoints/auth.api";
import { useToast } from "../../contexts/ToastContext";
import { useAuthStore } from "../../store/slices/authSlice";
import type { SignupStep1Data } from "../../types/auth.types";
import { SignupStep2Verification } from "./SignupStep2Details";
import { AxiosError } from "axios";

interface SignupContainerProps {
  isProvider?: boolean;
}

export const SignupContainer: React.FC<SignupContainerProps> = ({
  isProvider = false,
}) => {
  const navigate = useNavigate();
  const { setError, clearError } = useAuthStore();
  const { success, error: showError } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [userDetails, setUserDetails] = useState<SignupStep1Data | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Step 1: Submit user details and request verification code
  const submitDetailsMutation = useMutation({
    mutationFn: async (data: SignupStep1Data) => {
      console.log('🚀 [STEP 1 MUTATION] Calling submitUserDetails API');
      console.log('📤 [STEP 1] Data:', { 
        email: data.email, 
        name: data.name,
        phone: data.phone || '(none)' 
      });
      
      const response = await authApi.submitUserDetails(data);
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ [STEP 1 SUCCESS]', response);
      console.log('📧 [STEP 1] Verification code should be sent to:', variables.email);
      
      setUserDetails(variables);
      setCurrentStep(2);
      success(`Verification code sent to ${variables.email}`);
      startResendTimer();
      clearError();
      
      console.log('➡️ [STEP 1] Moving to Step 2');
    },
    onError: (error: any) => {
      console.error('❌ [STEP 1 ERROR]', error);
      
      let errorMessage = "Failed to send verification code";
      
      if (error instanceof AxiosError) {
        console.log('🔍 [STEP 1] Axios error detected');
        console.log('📊 [STEP 1] Response status:', error.response?.status);
        console.log('📋 [STEP 1] Response data:', error.response?.data);
        
        const responseData = error.response?.data;
        
        if (error.response?.status === 400) {
          errorMessage = responseData?.customerMessage || 
                        responseData?.message || 
                        'Invalid input. Please check your details.';
          console.log('⚠️ [STEP 1] 400 Bad Request - Invalid input');
        } else if (error.response?.status === 409) {
          errorMessage = 'An account with this email or phone already exists. Please use different credentials or login.';
          console.log('🔄 [STEP 1] 409 Conflict - Duplicate user');
        } else if (responseData?.customerMessage) {
          errorMessage = responseData.customerMessage;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.log('📝 [STEP 1] Final error message:', errorMessage);
      
      // CRITICAL FIX: Set error but DO NOT navigate or refresh
      setError(errorMessage);
      showError(errorMessage);
      
      console.log('⚠️ [STEP 1] User stays on Step 1 to retry');
      console.log('🔄 [STEP 1] Form is ready for user to correct input');
      
      // CRITICAL: Do NOT call setCurrentStep or navigate
      // User must stay on Step 1 to fix their input
    },
  });

  // Step 2: Verify code and set password
  // CRITICAL: ONLY redirect on SUCCESS, stay on Step 2 for errors
  const verifyAndCreateMutation = useMutation({
    mutationFn: async (data: { verificationCode: string; password: string }) => {
      if (!userDetails) {
        throw new Error("User details not found. Please start over.");
      }

      console.log('🚀 [STEP 2 MUTATION] Calling verifyAndCreateAccount API');
      console.log('📤 [STEP 2] Data:', {
        email: userDetails.email,
        tokenLength: data.verificationCode.length,
        hasPassword: '***',
      });
      
      // Clear previous errors before new attempt
      setVerificationError(null);
      clearError();
      
      const response = await authApi.verifyAndCreateAccount({
        ...userDetails,
        ...data,
      });
      
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ [STEP 2 SUCCESS] Account verified successfully');
      console.log('💬 [STEP 2] Success message:', response.message);
      console.log('ℹ️ [STEP 2] User must now login to get tokens');
      
      // Clear ALL errors
      clearError();
      setVerificationError(null);
      
      // Show success message
      const successMessage = response.message || 
        'Account created successfully! Please login with your credentials.';
      success(successMessage);

      console.log('🔀 [STEP 2] Preparing redirect to login...');
      
      // Redirect to login page after successful verification
      setTimeout(() => {
        console.log('➡️ [STEP 2] Redirecting to login page');
        navigate('/login', { 
          replace: true,
          state: { 
            email: userDetails?.email,
            accountCreated: true,
            message: 'Your account has been verified! Please login to continue.'
          }
        });
      }, 2000);
    },
    onError: (error: any) => {
      console.error('❌ [STEP 2 ERROR]', error);
      
      let errorMessage = "Failed to verify code. Please try again.";
      let isInvalidToken = false;
      
      if (error instanceof AxiosError) {
        console.log('🔍 [STEP 2] Axios error detected');
        console.log('📊 [STEP 2] Response status:', error.response?.status);
        console.log('📋 [STEP 2] Response data:', error.response?.data);
        
        const responseData = error.response?.data;
        
        if (error.response?.status === 400) {
          isInvalidToken = true;
          
          // Check for specific error messages
          if (responseData?.customerMessage?.toLowerCase().includes('token')) {
            errorMessage = responseData.customerMessage;
          } else if (responseData?.customerMessage?.toLowerCase().includes('verification')) {
            errorMessage = responseData.customerMessage;
          } else if (responseData?.customerMessage) {
            errorMessage = responseData.customerMessage;
          } else {
            errorMessage = 'Invalid or expired verification code. Please check the code or request a new one.';
          }
          
          console.log('🔐 [STEP 2] 400 Bad Request - Invalid verification code');
        } else if (error.response?.status === 404) {
          errorMessage = 'Verification token not found. Please request a new code.';
          isInvalidToken = true;
          console.log('🔍 [STEP 2] 404 Not Found - Token not found');
        } else if (error.response?.status === 410) {
          errorMessage = 'Verification code has expired. Please request a new one.';
          isInvalidToken = true;
          console.log('⏰ [STEP 2] 410 Gone - Token expired');
        } else if (responseData?.customerMessage) {
          errorMessage = responseData.customerMessage;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.log('📝 [STEP 2] Final error message:', errorMessage);
      console.log('🔐 [STEP 2] Is invalid token:', isInvalidToken);
      
      // CRITICAL FIX: Set verification-specific error for inline display
      setVerificationError(errorMessage);
      
      // Also set in auth store
      setError(errorMessage);
      
      // Show error toast
      showError(errorMessage);
      
      // CRITICAL FIX: DO NOT navigate or redirect on error
      // User must stay on Step 2 to retry with correct code
      console.log('⚠️ [STEP 2] User STAYS on Step 2 to retry');
      console.log('🔄 [STEP 2] User can:');
      console.log('   1. Re-enter the verification code');
      console.log('   2. Request a new code (resend)');
      console.log('   3. Check their email/database for the correct code');
      
      // CRITICAL: Do NOT call navigate() or setCurrentStep()
      // The component should remain mounted with error displayed
    },
  });

  // Resend verification code
  const resendCodeMutation = useMutation({
    mutationFn: async () => {
      if (!userDetails) {
        throw new Error("User details not found. Please start over.");
      }
      
      console.log('🔄 [RESEND] Calling resendVerificationCode API');
      console.log('📧 [RESEND] Email:', userDetails.email);
      
      const response = await authApi.resendVerificationCode(userDetails.email);
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ [RESEND SUCCESS]');
      console.log('💬 [RESEND] Message:', response?.message);
      
      const successMessage = response?.message || "New verification code sent to your email";
      success(successMessage);
      
      setCanResend(false);
      setResendCountdown(60);
      setVerificationError(null); // Clear any previous errors
      clearError();
      startResendTimer();
      
      console.log('🔄 [RESEND] User can now try with new code');
    },
    onError: (error: any) => {
      console.error('❌ [RESEND ERROR]', error);
      
      let errorMessage = "Failed to resend code. Please try again.";
      
      if (error instanceof AxiosError) {
        const responseData = error.response?.data;
        
        if (error.response?.status === 404) {
          errorMessage = 'Resend endpoint not available. Please contact support or try creating a new account.';
        } else if (responseData?.customerMessage) {
          errorMessage = responseData.customerMessage;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
      
      // CRITICAL FIX: Do NOT navigate on resend error
      // User should stay on Step 2 and can try again
      console.log('⚠️ [RESEND] User stays on Step 2 despite resend error');
      console.log('🔄 [RESEND] User can try to resend again or use existing code');
    },
  });

  const startResendTimer = () => {
    console.log('⏱️ [TIMER] Starting 60 second countdown');
    setCanResend(false);
    setResendCountdown(60);
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
        console.log('✅ [TIMER] Countdown complete - resend enabled');
        setCanResend(true);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentStep, resendCountdown, canResend]);

  return (
    <>
      {currentStep === 1 ? (
        <SignupStep1Details
          onContinue={(data) => {
            console.log('▶️ [CONTAINER] Step 1 form submitted');
            submitDetailsMutation.mutate(data);
          }}
          isLoading={submitDetailsMutation.isPending}
          isProvider={isProvider}
        />
      ) : (
        <SignupStep2Verification
          email={userDetails?.email || ""}
          onSubmit={(data) => {
            console.log('▶️ [CONTAINER] Step 2 form submitted');
            verifyAndCreateMutation.mutate(data);
          }}
          onResendCode={() => {
            console.log('▶️ [CONTAINER] Resend code requested');
            resendCodeMutation.mutate();
          }}
          isLoading={verifyAndCreateMutation.isPending || resendCodeMutation.isPending}
          canResend={canResend}
          resendCountdown={resendCountdown}
          verificationError={verificationError}
        />
      )}
    </>
  );
};