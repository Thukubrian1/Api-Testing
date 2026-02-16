export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
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
  admin: Admin;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

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
  admin: Admin | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}