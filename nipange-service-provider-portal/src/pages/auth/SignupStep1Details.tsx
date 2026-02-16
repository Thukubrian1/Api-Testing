import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button/Button";
import { Input } from "../../components/common/Input/Input";
import { normalizePhoneNumber } from "../../utils/phoneUtils";
import type { ServiceProviderSignupStep1Data } from "../../types/auth.types";
import {
  validateName,
  validateEmail,
  validatePhone,
} from "../../utils/validation";

interface FormErrors {
  email?: string;
  name?: string;
  phoneNo?: string;
}

interface SignupStep1DetailsProps {
  onContinue: (data: ServiceProviderSignupStep1Data) => void;
  isLoading: boolean;
}

export const SignupStep1Details: React.FC<SignupStep1DetailsProps> = ({
  onContinue,
  isLoading,
}) => {
  const [formData, setFormData] = useState<ServiceProviderSignupStep1Data>({
    name: "",
    email: "",
    phoneNo: "",
    serviceProviderType: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Trim and normalize all form data
   */
  const trimAndNormalizeData = (
    data: ServiceProviderSignupStep1Data,
  ): ServiceProviderSignupStep1Data => {
    let normalizedPhone: string;
    try {
      const normalized = normalizePhoneNumber(data.phoneNo);
      normalizedPhone = normalized || data.phoneNo;
    } catch (error) {
      normalizedPhone = data.phoneNo;
    }
    
    return {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNo: normalizedPhone,
    };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedData = trimAndNormalizeData(formData);

    // Name validation (Business/Provider name)
    const nameValidation = validateName(trimmedData.name, "Business/Provider name");
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    // Email validation
    const emailValidation = validateEmail(trimmedData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Phone validation (MANDATORY for service provider)
    const phoneValidation = validatePhone(trimmedData.phoneNo, true); // true = required
    if (!phoneValidation.isValid) {
      newErrors.phoneNo = phoneValidation.error;
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // STEP 1: IMMEDIATELY PREVENT DEFAULT - THIS IS CRITICAL
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('📝 [STEP 1] Form submitted - preventDefault called IMMEDIATELY');
    
    // STEP 2: Prevent submission if already loading
    if (isLoading) {
      console.log('⚠️ [STEP 1] Already loading, blocking duplicate submit');
      return false;
    }
    
    // STEP 3: Clear all errors
    setErrors({});

    // STEP 4: Validate BEFORE calling API - CRITICAL
    if (!validateForm()) {
      console.log('❌ [STEP 1] Client-side validation failed - staying on page');
      // DO NOT show toast for validation errors - they're inline only
      // CRITICAL: Do not call onContinue, stay on page
      return false;
    }

    console.log('✅ [STEP 1] Validation passed, proceeding with API call');

    // STEP 5: Only call API if validation passed
    const trimmedData = trimAndNormalizeData(formData);
    console.log("📤 [STEP 1] Submitting service provider data:", trimmedData);

    try {
      // This will call the API via SignupContainer mutation
      onContinue(trimmedData);
      console.log('✅ [STEP 1] onContinue called with valid data');
    } catch (error) {
      console.error('❌ [STEP 1] Submission error:', error);
      // Let the parent component handle the error
    }

    // STEP 6: Always return false for extra safety
    return false;
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
          <p className="text-sm font-medium text-gray-500">Service Provider Details</p>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register your service provider business
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Business/Provider Name */}
          <div className="mb-5">
            <Input
              id="name"
              name="name"
              type="text"
              label="Business/Provider Name"
              placeholder="Enter your business or provider name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="provider@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
              helperText="A verification code will be sent to this email"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="mb-5">
            <Input
              id="phoneNo"
              name="phoneNo"
              type="tel"
              label="Phone Number"
              placeholder="+254 712 345 678"
              value={formData.phoneNo}
              onChange={handleChange}
              error={errors.phoneNo}
              disabled={isLoading}
              autoComplete="tel"
              required
            />
          </div>

          {/* Continue Button */}
          <div className="pt-4 mb-6">
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
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};