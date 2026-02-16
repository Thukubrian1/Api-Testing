export const UserRole = {
  USER: 'USER',
  GUEST: 'GUEST',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  avatar?: string;
  emailVerification: boolean;
  isEnabled: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;

}

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  rememberMe?: boolean;
}

// Two-step signup interfaces
export interface SignupStep1Data {
  email: string;
  name: string;
  phone?: string;
}

export interface SignupStep2Data {
  verificationCode: string;
  password: string;
}

export interface VerifyAndCreateAccountData extends SignupStep1Data, SignupStep2Data {}

// API Response structure
export interface ApiResponse<T> {
  customerMessage: string;
  data: T;
  responseCode: string;
  responseDesc: string;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  clientName: string;
  expireIn: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  clientName: string;
}

// Step 1: Submit details response
export interface SubmitDetailsResponse {
  message: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}