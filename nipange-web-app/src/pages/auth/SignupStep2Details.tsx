import React, { useState, useEffect } from "react";
import { Button } from "../../components/common/Button/Button";
import { Input } from "../../components/common/Input/Input";
import { validatePassword, validatePasswordConfirmation } from "../../utils/validation";


interface FormErrors {
  verificationCode?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

interface VerificationData {
  verificationCode: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface SignupStep2VerificationProps {
  email: string;
  onSubmit: (data: { verificationCode: string; password: string }) => void;
  onResendCode: () => void;
  isLoading: boolean;
  canResend: boolean;
  resendCountdown: number;
  verificationError?: string | null;
}

export const SignupStep2Verification: React.FC<SignupStep2VerificationProps> = ({
  email,
  onSubmit,
  onResendCode,
  isLoading,
  canResend,
  resendCountdown,
  verificationError,
}) => {
  const [formData, setFormData] = useState<VerificationData>({
    verificationCode: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Update verification code error when prop changes
  useEffect(() => {
    if (verificationError) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: verificationError,
      }));
    }
  }, [verificationError]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Verification Token validation - must be a non-empty string
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = "Please enter the verification token from your email";
    } else if (formData.verificationCode.trim().length < 10) {
      newErrors.verificationCode = "Token appears to be too short - please paste the full token";
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    // Confirm Password validation
    const confirmPasswordValidation = validatePasswordConfirmation(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.error;
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    console.log('📤 [STEP 2] Submitting verification data:', {
      token: formData.verificationCode.substring(0, 20) + '...',
      tokenLength: formData.verificationCode.length,
      hasPassword: '***',
    });

    onSubmit({
      verificationCode: formData.verificationCode.trim(),
      password: formData.password,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-semibold">
              ✓
            </div>
            <div className="w-24 h-1 bg-green-500 mx-2" />
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-white font-semibold">
              2
            </div>
          </div>
        </div>

        <div className="text-center mb-2">
          <p className="text-sm font-medium text-gray-500">Account Verification</p>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification token sent to{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Testing Mode:</strong> Check your database or email for the full verification token and paste it below.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Verification Token Input */}
          <div className="relative">
            <Input
              id="verificationCode"
              name="verificationCode"
              type={showToken ? "text" : "password"}
              label="Verification Token"
              placeholder="Paste your verification token here"
              value={formData.verificationCode}
              onChange={handleChange}
              error={errors.verificationCode}
              disabled={isLoading}
              autoComplete="off"
              helperText="Paste the full token from your database (e.g., RIz/+T2cKdyF9LwXekXg6JIgz7nOnaoy1+Et0P/6aUg=)"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            
            {/* Token Info Display */}
            {formData.verificationCode && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                <strong>Token length:</strong> {formData.verificationCode.length} characters
                {formData.verificationCode.length > 0 && (
                  <>
                    <br />
                    <strong>Preview:</strong> {formData.verificationCode.substring(0, 30)}...
                  </>
                )}
              </div>
            )}
          </div>
            
          {/* Inline Error Display */}
          {errors.verificationCode && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {errors.verificationCode}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Please check your database for the correct token, or request a new one below.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={onResendCode}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Resend verification token
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Didn't receive the token? Resend in {resendCountdown}s
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Create Password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isLoading}
              autoComplete="new-password"
              helperText="Must contain uppercase, lowercase, and number"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Terms and Conditions */}
          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div className="ml-3">
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.agreeToTerms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Verifying Account..." : "Create Account"}
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact{" "}
            <a href="mailto:support@nipange.com" className="text-blue-600 hover:text-blue-500">
              support@nipange.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};