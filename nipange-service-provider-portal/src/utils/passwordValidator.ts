/**
 * Password validation utilities
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  score: number;
}

/**
 * Validate password with detailed feedback
 */
export const validatePasswordDetailed = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let score = 0;

  // Check length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Check for special characters (optional but increases strength)
  if (/[^a-zA-Z\d]/.test(password)) {
    score += 1;
  }

  // Determine strength
  let strength: PasswordValidation['strength'];
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'fair';
  } else if (score <= 5) {
    strength = 'good';
  } else if (score <= 6) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

/**
 * Check for common weak passwords
 */
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'letmein',
    'monkey',
    '1234567890',
    'password123',
    'admin',
    'welcome',
  ];

  return commonPasswords.some(
    (common) => password.toLowerCase().includes(common)
  );
};

/**
 * Check if password contains sequential characters
 */
export const hasSequentialChars = (password: string): boolean => {
  for (let i = 0; i < password.length - 2; i++) {
    const code1 = password.charCodeAt(i);
    const code2 = password.charCodeAt(i + 1);
    const code3 = password.charCodeAt(i + 2);

    if (code2 === code1 + 1 && code3 === code2 + 1) {
      return true;
    }
  }
  return false;
};

/**
 * Check if password contains repeated characters
 */
export const hasRepeatedChars = (password: string, maxRepeat: number = 3): boolean => {
  for (let i = 0; i <= password.length - maxRepeat; i++) {
    const char = password[i];
    let count = 1;

    for (let j = i + 1; j < password.length; j++) {
      if (password[j] === char) {
        count++;
        if (count >= maxRepeat) return true;
      } else {
        break;
      }
    }
  }
  return false;
};

/**
 * Generate password requirements message
 */
export const getPasswordRequirements = (): string[] => {
  return [
    'At least 8 characters long',
    'Contains at least one uppercase letter (A-Z)',
    'Contains at least one lowercase letter (a-z)',
    'Contains at least one number (0-9)',
    'Avoid common passwords',
  ];
};

/**
 * Calculate password entropy (bits)
 */
export const calculatePasswordEntropy = (password: string): number => {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) charsetSize += 26; // lowercase
  if (/[A-Z]/.test(password)) charsetSize += 26; // uppercase
  if (/\d/.test(password)) charsetSize += 10; // numbers
  if (/[^a-zA-Z\d]/.test(password)) charsetSize += 32; // special chars

  return Math.log2(Math.pow(charsetSize, password.length));
};

/**
 * Get estimated time to crack password
 */
export const getTimeToCrack = (password: string): string => {
  const entropy = calculatePasswordEntropy(password);
  const guessesPerSecond = 1e10; // 10 billion guesses per second (modern GPU)
  const secondsToCrack = Math.pow(2, entropy) / guessesPerSecond;

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  if (secondsToCrack < minute) {
    return 'Less than a minute';
  } else if (secondsToCrack < hour) {
    return `${Math.ceil(secondsToCrack / minute)} minutes`;
  } else if (secondsToCrack < day) {
    return `${Math.ceil(secondsToCrack / hour)} hours`;
  } else if (secondsToCrack < year) {
    return `${Math.ceil(secondsToCrack / day)} days`;
  } else {
    const years = Math.ceil(secondsToCrack / year);
    if (years > 1000000) {
      return 'Millions of years';
    }
    return `${years} years`;
  }
};