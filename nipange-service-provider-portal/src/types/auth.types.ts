export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  logoUrl?: string;
  serviceProviderType: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: string; 
  rememberMe?: boolean;
}

// Service Provider signup interfaces
export interface ServiceProviderSignupStep1Data {
  name: string;        // Business/Provider name (mandatory)
  email: string;       // Email (mandatory)
  phoneNo: string;     // Phone (mandatory for service provider - will be normalized before sending)
  serviceProviderType: string;
}

export interface SignupStep2Data {
  verificationCode: string;
  password: string;
}

export interface VerifyAndCreateAccountData {
  email: string;
  verificationCode: string;
  password: string;
}

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
  serviceProvider: ServiceProvider;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
  serviceProvider: ServiceProvider | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}