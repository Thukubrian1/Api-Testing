import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button/Button";
import { Input } from "../../components/common/Input/Input";
import { getGoogleOAuthUrl } from "../../config/config";
import { normalizePhoneNumber } from "../../utils/phoneUtils";
import { validateName, validateEmail, validatePhone } from "../../utils/validation";


interface FormErrors {
  email?: string;
  fullName?: string;
  phone?: string;
}

interface UserDetailsData {
  email: string;
  name: string;
  phone?: string;
}

interface SignupStep1DetailsProps {
  onContinue: (data: UserDetailsData) => void;
  isLoading: boolean;
  isProvider?: boolean;
}

export const SignupStep1Details: React.FC<SignupStep1DetailsProps> = ({
  onContinue,
  isLoading,
  isProvider = false,
}) => {
  const [formData, setFormData] = useState<UserDetailsData>({
    email: "",
    name: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Trim and normalize all form data
   */
  const trimAndNormalizeData = (data: UserDetailsData): UserDetailsData => {
    return {
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      phone: normalizePhoneNumber(data.phone || ''),
    };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedData = trimAndNormalizeData(formData);

    // First Name validation
    const fullNameValidation = validateName(trimmedData.name, "Full name");
    if (!fullNameValidation.isValid) {
      newErrors.fullName = fullNameValidation.error;
    }

    // Email validation
    const emailValidation = validateEmail(trimmedData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Phone validation (optional but must be valid if provided)
    if (trimmedData.phone) {
      const phoneValidation = validatePhone(trimmedData.phone, false);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    // Trim and normalize data before sending to backend
    const trimmedData = trimAndNormalizeData(formData);
    console.log('📤 [STEP 1] Submitting trimmed data:', {
      ...trimmedData,
      phone: trimmedData.phone || '(empty)',
    });
    
    onContinue(trimmedData);
  };

  const handleGoogleSignup = () => {
    try {
      const googleUrl = getGoogleOAuthUrl();
      window.location.href = googleUrl;
    } catch (error) {
      console.error("Failed to sign up with Google:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-white font-semibold">
              1
            </div>
            <div className="w-24 h-1 bg-gray-300 mx-2" />
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-600 font-semibold">
              2
            </div>
          </div>
        </div>

        <div className="text-center mb-2">
          <p className="text-sm font-medium text-gray-500">User Details</p>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your adventure today
          </p>
        </div>

        {/* Google Sign Up Button - Only for User Signup */}
        {!isProvider && (
          <>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleSignup}
              disabled={isLoading}
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
              Sign up with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Fields - Side by Side */}
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Enter full Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.fullName}
              disabled={isLoading}
              required
            />

          {/* Email */}
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder={
              isProvider ? "provider@company.com" : "john@example.com"
            }
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            autoComplete="email"
            helperText="A verification code will be sent to this email"
            required
          />

          {/* Phone */}
          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+254 712 345 678"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            autoComplete="tel"
            helperText="Optional - for account recovery"
          />

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Continue"}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account
              </span>
            </div>
          </div>
        </div>

        {/* Sign in Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to={isProvider ? "/provider/login" : "/login"}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
          {/* {!isProvider && (
            <p className="mt-2 text-sm text-gray-600">
              Are you a service provider?{" "}
              <Link
                to="/provider/signup"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Register here
              </Link>
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
};