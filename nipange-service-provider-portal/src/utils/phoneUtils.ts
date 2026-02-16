/**
 * Phone number utility functions for normalization and formatting
 */

/**
 * Normalize phone number by removing all non-digit characters except leading +
 * Ensures consistent format for database storage
 */
export const normalizePhoneNumber = (phone: string): string | undefined => {
  if (!phone || !phone.trim()) {
    return undefined;
  }

  // Remove all whitespace and special characters except + at the start
  const normalized = phone.trim();
  
  // Extract leading + if exists
  const hasPlus = normalized.startsWith('+');
  
  // Remove all non-digit characters
  const digitsOnly = normalized.replace(/\D/g, '');
  
  // Return with + prefix if it was there originally
  if (hasPlus && digitsOnly) {
    return `+${digitsOnly}`;
  }
  
  return digitsOnly || undefined;
};

/**
 * Format phone number for display (adds spaces for readability)
 * Example: +254712345678 -> +254 712 345 678
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return '';
  
  // Format Kenyan numbers (+254)
  if (normalized.startsWith('+254') && normalized.length === 13) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 10)} ${normalized.slice(10)}`;
  }
  
  // Format other international numbers (generic grouping)
  if (normalized.startsWith('+')) {
    const countryCode = normalized.slice(0, 4);
    const rest = normalized.slice(4);
    return `${countryCode} ${rest.match(/.{1,3}/g)?.join(' ') || rest}`;
  }
  
  // Format local numbers without country code
  return normalized.match(/.{1,3}/g)?.join(' ') || normalized;
};

/**
 * Validate if phone number has minimum required digits
 */
export const hasMinimumPhoneDigits = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return false;
  
  const digitsOnly = normalized.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

/**
 * Validate if phone number doesn't exceed maximum digits
 */
export const isWithinMaxPhoneDigits = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return true; // Empty is valid
  
  const digitsOnly = normalized.replace(/\D/g, '');
  return digitsOnly.length <= 15;
};