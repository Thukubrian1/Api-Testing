import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/slices/authSlice";
import { useToast } from "../../../contexts/ToastContext";
import type { LoginCredentials } from "../../../types/auth.types";
import { authApi } from "../../../api/endpoints/auth.api";
import { Input } from "../../../components/common/Input/Input";
import { Button } from "../../../components/common/Button/Button";
import { getGoogleOAuthUrl } from "../../../config/config";
import { validateEmail } from "../../../utils/validation";
import { AxiosError } from "axios";

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  isProvider?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isProvider = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setError, setLoading, clearError } = useAuthStore();
  const { success, error: showToastError, info } = useToast();
  

  const role = isProvider ? 'SERVICE_PROVIDER_ROLE' : 'STANDARD_USER';

  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    role,
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Show account created message if coming from signup
  useEffect(() => {
    if (location.state?.accountCreated && location.state?.message) {
      info(location.state.message);
    }
    
    // Pre-fill email if provided
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }

    // Check if session expired
    if (typeof window !== 'undefined' && sessionStorage.getItem('sessionExpired')) {
      info('Your session has expired. Please login again.');
      sessionStorage.removeItem('sessionExpired');
    }
  }, [location.state, info]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    
    // Clear login error when user modifies form
    if (loginError) {
      setLoginError(null);
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [LOGIN FORM] Form submitted');
    console.log('📋 [LOGIN FORM] Role being sent:', role);
    
    // CRITICAL: Clear ALL previous errors and state
    setErrors({});
    setLoginError(null);
    clearError();

    // Validate form
    if (!validateForm()) {
      console.log('⚠️ [LOGIN FORM] Validation failed');
      showToastError("Please fix the errors in the form");
      return;
    }

    console.log('✅ [LOGIN FORM] Validation passed');
    
    // Set loading state
    setIsSubmitting(true);
    setLoading(true);

    try {
      console.log('📡 [LOGIN FORM] Calling login API...');
      console.log('📤 [LOGIN FORM] Credentials:', { 
        email: formData.email, 
        password: '***',
        role: formData.role,
        rememberMe: formData.rememberMe 
      });
      
      const response = await authApi.login(formData);

      console.log('✅ [LOGIN FORM] Login API successful');
      console.log('👤 [LOGIN FORM] User data received:', {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      });

      // Store auth data in state
      setAuth(response.user, response.accessToken, response.refreshToken);
      
      console.log('💾 [LOGIN FORM] Auth state updated');

      // Show personalized success message
      const userName = response.user.name || 'User';
      success(`Welcome back to Nipange, ${userName}!`);
      
      console.log('🎉 [LOGIN FORM] Success message shown');

      // Small delay to ensure state is updated and toast is visible
      setTimeout(() => {
        console.log('🔀 [LOGIN FORM] Redirecting user...');
        
        // Redirect to previous page or home
        const from = (location.state?.from?.pathname as string) || "/";
        navigate(from, { replace: true });
        
        console.log('✅ [LOGIN FORM] Redirect initiated to:', from);
      }, 500);
      
    } catch (error: any) {
      console.error('❌ [LOGIN FORM] Login failed');
      console.error('📋 [LOGIN FORM] Error details:', error);
      
      // CRITICAL: Extract error message and determine error type
      let errorMessage = 'Login failed. Please try again.';
      let isWrongCredentials = false;
      
      if (error instanceof AxiosError) {
        console.log('🔍 [LOGIN FORM] Axios error detected');
        console.log('📊 [LOGIN FORM] Response status:', error.response?.status);
        console.log('📋 [LOGIN FORM] Response data:', error.response?.data);
        
        const responseData = error.response?.data;
        const status = error.response?.status;
        
        // Check for common error patterns - ORDER MATTERS!
        // First check if backend provided a user-friendly message
        if (responseData?.customerMessage && 
            !responseData.customerMessage.includes('status code') &&
            !responseData.customerMessage.includes('Request failed')) {
          errorMessage = responseData.customerMessage;
          console.log('💬 [LOGIN FORM] Using customer message from API:', errorMessage);
        } else if (responseData?.message && 
                   !responseData.message.includes('status code') &&
                   !responseData.message.includes('Request failed')) {
          errorMessage = responseData.message;
          console.log('💬 [LOGIN FORM] Using message from API:', errorMessage);
        }
        // If backend message is technical, use our user-friendly messages based on status
        else if (status === 401) {
          isWrongCredentials = true;
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          console.log('🔐 [LOGIN FORM] 401 Unauthorized - Wrong credentials or wrong role');
        } else if (status === 400) {
          isWrongCredentials = true;
          errorMessage = 'Invalid login credentials. Please check your email and password.';
          console.log('⚠️ [LOGIN FORM] 400 Bad Request - Invalid input');
        } else if (status === 403) {
          errorMessage = 'Account is disabled or not verified. Please check your email for verification.';
          console.log('🚫 [LOGIN FORM] 403 Forbidden - Account issue');
        } else if (status === 404) {
          errorMessage = 'Account not found. Please check your email or sign up.';
          console.log('🔍 [LOGIN FORM] 404 Not Found - Account does not exist');
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
          console.log('💥 [LOGIN FORM] 500 Server Error');
        } else {
          // Generic error for other status codes
          errorMessage = 'Login failed. Please check your credentials and try again.';
          console.log('⚠️ [LOGIN FORM] Other error status:', status);
        }
      } else if (error instanceof Error) {
        // Only use error.message if it's user-friendly
        if (!error.message.includes('status code') && 
            !error.message.includes('Request failed')) {
          errorMessage = error.message;
        } else {
          errorMessage = 'Login failed. Please check your credentials and try again.';
        }
        console.log('📝 [LOGIN FORM] Error message:', errorMessage);
      }
      
      // Set error states
      setLoginError(errorMessage);
      setError(errorMessage);
      showToastError(errorMessage);
      
      console.log('🎯 [LOGIN FORM] Error states set:', {
        loginError: errorMessage,
        isWrongCredentials,
      });
      
      // If wrong credentials, also set field-level errors for visual feedback
      if (isWrongCredentials) {
        setErrors({
          email: ' ', // Space to trigger error state styling
          password: ' ', // Space to trigger error state styling
        });
        console.log('🎨 [LOGIN FORM] Field-level errors set for visual feedback');
      }
      
      console.log('⚠️ [LOGIN FORM] User stays on login page to retry');
      console.log('🔄 [LOGIN FORM] Form is ready for retry');
      
      // CRITICAL: Do NOT call navigate() or window.location
      // User must stay on this page to correct their input
      
    } finally {
      console.log('🏁 [LOGIN FORM] Login attempt completed');
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔍 [LOGIN FORM] Google login initiated');
      const googleUrl = getGoogleOAuthUrl();
      console.log('🔗 [LOGIN FORM] Redirecting to:', googleUrl);
      window.location.href = googleUrl;
    } catch (error) {
      console.error('❌ [LOGIN FORM] Google login error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      showToastError(errorMessage);
      setError(errorMessage);
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isProvider ? "Provider Login" : "Login"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isProvider
              ? "Login to manage your events and venues"
              : "Login to access your account"}
          </p>
        </div>

        {/* Google Sign In Button - Only for User Login */}
        {!isProvider && (
          <>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="mb-6"
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              Sign in with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>
          </>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder={
              isProvider ? "provider@company.com" : "user@example.com"
            }
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isSubmitting}
            autoComplete="email"
            required
          />

          {/* Password Field */}
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                New to Ni-Pange?
              </span>
            </div>
          </div>
        </div>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to={"/signup"}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};