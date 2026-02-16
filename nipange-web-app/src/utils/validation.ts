/**
 * Validation utility functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, and number',
    };
  }

  return { isValid: true };
};

/**
 * Password confirmation validation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Phone number validation
 */
export const validatePhone = (phone: string, required: boolean = false): ValidationResult => {
  if (!phone || !phone.trim()) {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number must not exceed 15 digits' };
  }

  // Validate format: allow digits, spaces, dashes, parentheses, and plus sign
  // Fixed: Removed unnecessary escapes
  if (!/^[\d\s\-+()]+$/.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
};

/**
 * Name validation
 */
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} must not exceed 50 characters` };
  }

  return { isValid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string, fieldName: string = 'This field'): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * URL validation
 */
export const validateUrl = (url: string, required: boolean = false): ValidationResult => {
  if (!url || !url.trim()) {
    if (required) {
      return { isValid: false, error: 'URL is required' };
    }
    return { isValid: true };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Min length validation
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string = 'This field'
): ValidationResult => {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Max length validation
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string = 'This field'
): ValidationResult => {
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Password strength calculator
 */
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
} => {
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Weak', color: 'red' };
  }

  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z\d]/.test(password)) score += 1;

  // Determine label and color
  if (score <= 2) {
    return { score, label: 'Weak', color: 'red' };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: 'orange' };
  } else if (score <= 5) {
    return { score, label: 'Good', color: 'yellow' };
  } else if (score <= 6) {
    return { score, label: 'Strong', color: 'green' };
  } else {
    return { score, label: 'Very Strong', color: 'green' };
  }
};