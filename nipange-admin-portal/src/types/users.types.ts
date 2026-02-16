/**
 * Users Module Types
 * Types for Admins, Service Providers, and App Users
 */

// =======================
// Admin Types
// =======================

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  lastLogin: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt?: string;
  updatedAt?: string;
  logoUrl?: string;
}

export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  MODERATOR = 'Moderator',
  DATA_ANALYST = 'Data Analyst',
}

export enum AdminStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

export interface AdminFormData {
  name: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  role: AdminRole;
  status: AdminStatus;
  password?: string;
}

export interface CreateAdminRequest extends AdminFormData {
  password: string;
}

export interface UpdateAdminRequest {
  name?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  role?: AdminRole;
  status?: AdminStatus;
}

// =======================
// Service Provider Types
// =======================

export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
  categories: string[];
  subcategories: string[];
  events: number;
  status: ProviderStatus;
  commission?: number;
  documents?: ProviderDocument[];
  createdAt?: string;
  updatedAt?: string;
  logoUrl?: string;
}

export enum ProviderStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  SUSPENDED = 'Suspended',
}

export interface ProviderDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
  mimeType?: string;
  fileExtension?: string;
  comments?: DocumentComment[];
}

export interface DocumentComment {
  id: string;
  documentId: string;
  author: string;
  authorRole: string;
  text: string;
  date: string;
  timestamp: string;
  createdAt?: string;
}

export interface ProviderFormData {
  name: string;
  email: string;
  phone: string;
  description?: string;
  categories: string[];
  subcategories: string[];
  password?: string;
}

export interface CreateProviderRequest extends ProviderFormData {
  password: string;
}

export interface UpdateProviderRequest {
  name?: string;
  phone?: string;
  description?: string;
  categories?: string[];
  subcategories?: string[];
  commission?: number;
  status?: ProviderStatus;
}

export interface ProviderActionRequest {
  reason?: string;
}

export interface ProviderStats {
  active: number;
  pending: number;
  avgSessionTime: string;
  newThisWeek: number;
  sessionChange: string;
}

// =======================
// App User Types
// =======================

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  location: string;
  categoryPreference: string[];
  budgetTier?: BudgetTier;
  userType: UserType;
  eventsAttended: number;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  photoUrl?: string;
}

export enum UserType {
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  VIP = 'VIP',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

export enum BudgetTier {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface AppUserFormData {
  name: string;
  email: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  location: string;
  categoryPreference: string[];
  budgetTier?: BudgetTier;
  userType: UserType;
  password?: string;
}

export interface CreateAppUserRequest extends AppUserFormData {
  password: string;
}

export interface UpdateAppUserRequest {
  name?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  location?: string;
  categoryPreference?: string[];
  budgetTier?: BudgetTier;
  userType?: UserType;
  status?: UserStatus;
}

export interface UserActionRequest {
  reason?: string;
}

export interface UserStats {
  active: number;
  premium: number;
  avgSessionTime: string;
  newThisWeek: number;
  sessionChange: string;
  premiumPercentage: number;
}

// =======================
// Category Types
// =======================

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

// =======================
// Filter & Search Types
// =======================

export interface UserFilters {
  status?: AdminStatus | ProviderStatus | UserStatus;
  role?: AdminRole;
  userType?: UserType;
  search?: string;
  page?: number;
  limit?: number;
}

// =======================
// API Response Types
// =======================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}