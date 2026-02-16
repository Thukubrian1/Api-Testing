// ============================================================================
// ENUMS - Matching Backend Exactly
// ============================================================================

/**
 * Service Provider Type Enum
 * Backend: service_provider_type_enum as ENUM('INDIVIDUAL','BUSINESS')
 */
export type ServiceProviderType = 'INDIVIDUAL' | 'BUSINESS';

/**
 * Status Enum
 * Backend: status_enum (values: NEW, ACTIVE, INACTIVE, SUSPENDED, etc.)
 */
export type Status = 'NEW' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Business Type Enum
 * Backend: business_type_enum as ENUM('SOLE_PROPRIETORSHIP','PARTNERSHIP',
 *          'LIMITED_LIABILITY_COMPANY','CORPORATION','COOPERATIVE','NON_PROFIT_ORGANIZATION')
 */
export type BusinessType = 
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'LIMITED_LIABILITY_COMPANY'
  | 'CORPORATION'
  | 'COOPERATIVE'
  | 'NON_PROFIT_ORGANIZATION';

// ============================================================================
// NESTED OBJECTS - Matching Backend DTOs
// ============================================================================

/**
 * LocationDetail
 * Backend: LocationDetail.java
 */
export interface LocationDetail {
  businessAddress: string | null;
  postalCode: string | null;
  websiteUrl: string | null;
}

/**
 * NotificationPreference
 * Backend: NotificationPreference.java
 */
export interface NotificationPreference {
  emailNotificationEnabled: boolean;
  eventApprovalNotificationEnabled: boolean;
  rsvpNotificationEnabled: boolean;
  smsNotificationEnabled: boolean;
  weeklyReportEnabled: boolean;
}

/**
 * SocialMedia
 * Backend: SocialMedia.java
 */
export interface SocialMedia {
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter_x: string | null;
}

/**
 * BrandIdentity
 * Backend: BrandIdentity.java
 */
export interface BrandIdentity {
  primaryColor: string | null;
  secondaryColor: string | null;
}

/**
 * ServiceProviderDocuments
 * Backend: ServiceProviderDocuments.java
 */
export interface ServiceProviderDocuments {
  businessLogoHash: string | null;
  businessLogoUrl: string | null;
  businessRegistrationCertificateHash: string | null;
  businessRegistrationCertificateUrl: string | null;
  comments: string | null;
  coverImageHash: string | null;
  coverImageUrl: string | null;
  idNumberHash: string | null;
  idNumberUrl: string | null;
  taxRegistrationCertificateHash: string | null;
  taxRegistrationCertificateUrl: string | null;
}

// ============================================================================
// MAIN ENTITIES
// ============================================================================

/**
 * UserRole
 * Represents a role assigned to a user
 */
export interface UserRole {
  roleId: string;
  roleName: string;
  userId: string;
  userName: string | null;
}

/**
 * ServiceProvider
 * Backend: ServiceProviderDTO.java
 * 
 * This matches the response from:
 * - GET /v1/service-provider/{id}
 * - PUT /v1/service-provider (response)
 * - Nested in User object from GET /v1/user/{id}
 */
export interface ServiceProvider {
  id: string;
  email: string;
  name: string;
  phoneNo: string;
  status: Status;
  serviceProviderType: ServiceProviderType | null;
  logoUrl: string | null;
  
  // Provider-specific fields
  idNumber: string | null;
  businessRegistrationNumber: string | null;
  taxPin: string | null;
  
  // Nested objects
  locationDetail: LocationDetail;
  notificationPreference: NotificationPreference;
  socialMedia: SocialMedia;
  brandIdentity: BrandIdentity;
  documents: ServiceProviderDocuments;
}

/**
 * User
 * Backend: UserDTO.java
 * 
 * Response from GET /v1/user/{id}
 * Note: The user has a nested serviceProvider object
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  photoUrl: string | null;
  status: Status;
  createdAt: string;
  updateAt: string;
  userRoles: UserRole[];
  serviceProvider: ServiceProvider;
}

// ============================================================================
// UPDATE PAYLOADS - Matching Backend Request DTOs
// ============================================================================

/**
 * ProfileUpdatePayload
 * Backend: UpdateServiceProviderDTO.java
 * 
 * Used for: PUT /v1/service-provider
 * 
 * ✅ CRITICAL: All fields match backend DTO exactly
 * ✅ Uses 'phoneNo' not 'phone' to match backend
 * ✅ Supports partial updates - all fields optional except in base API call
 */
export interface ProfileUpdatePayload {
  id?: string;  
  name?: string;
  status?: Status;
  serviceProviderType?: ServiceProviderType;
  idNumber?: string | null;
  businessRegistrationNumber?: string | null;
  taxPin?: string | null;
  locationDetail?: Partial<LocationDetail>;
  notificationPreference?: Partial<NotificationPreference>;
  socialMedia?: Partial<SocialMedia>;
  brandIdentity?: Partial<BrandIdentity>;
  documents?: Partial<ServiceProviderDocuments>;
}

/**
 * DocumentUploadPayload
 * Backend: ServiceProvideOnBoardingDocument.java (record)
 * 
 * Used for: PUT /v1/service-provider/{id}/documents
 * 
 * Field names match backend multipart parameter names exactly:
 * - businessLogo (not 'logo')
 * - nationalId (not 'idDocument')
 * - taxRegistrationCertificate (not 'taxCert')
 * - coverImage
 */
export interface DocumentUploadPayload {
  businessLogo?: File;
  nationalId?: File;
  taxRegistrationCertificate?: File;
  coverImage?: File;
  businessRegistrationCertificate?: File;  // May be used in future
}

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

/**
 * ApiResponse
 * Backend: BaseResponse<T>
 * 
 * Standard wrapper for all API responses
 */
export interface ApiResponse<T> {
  customerMessage: string;
  data: T;
  responseCode: string;
  responseDesc: string;
}

/**
 * PaginatedResponse
 * For endpoints that return paginated data like GET /v1/user/get-all
 */
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ============================================================================
// PAYMENT ACCOUNT TYPES
// ============================================================================

export type PaymentAccountType = 'BANK_ACCOUNT' | 'MOBILE_WALLET' | 'PAYPAL';

export interface PaymentAccount {
  id: string;
  accountType: PaymentAccountType;
  accountName: string;
  accountNumber?: string;
  phoneNumber?: string;
  email?: string;
  bankName?: string;
  branchName?: string;
  swiftCode?: string;
  provider?: string;
  nickname?: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountData {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchName: string;
  swiftCode?: string;
  nickname?: string;
}

export interface MobileWalletData {
  provider: string;
  phoneNumber: string;
  accountName: string;
  nickname?: string;
}

// ============================================================================
// WITHDRAWAL LIMIT SETTINGS
// ============================================================================

export interface WithdrawalLimitSettings {
  dailyLimit: number;
  singleTransactionLimit: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  largeTransactionAlerts: boolean;
  alertThreshold?: number;
}

// ============================================================================
// SECURITY SETTINGS
// ============================================================================

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'SMS' | 'AUTHENTICATOR_APP';
  lastPasswordChange?: string;
  loginNotifications: boolean;
  sessionTimeout: number;
}

export interface TwoFactorSetupData {
  method: 'SMS' | 'AUTHENTICATOR_APP';
  phoneNumber?: string;
}

export interface TwoFactorVerifyData {
  verificationCode: string;
  method: 'SMS' | 'AUTHENTICATOR_APP';
}

// ============================================================================
// TYPE GUARDS & HELPERS
// ============================================================================

/**
 * Type guard to check if a service provider is INDIVIDUAL
 */
export const isIndividualProvider = (sp: ServiceProvider): boolean => {
  return sp.serviceProviderType === 'INDIVIDUAL';
};

/**
 * Type guard to check if a service provider is BUSINESS
 */
export const isBusinessProvider = (sp: ServiceProvider): boolean => {
  return sp.serviceProviderType === 'BUSINESS';
};

/**
 * Type guard to check if a status is active
 */
export const isActiveStatus = (status: Status): boolean => {
  return status === 'ACTIVE';
};

/**
 * Helper to get status display text
 */
export const getStatusDisplayText = (status: Status): string => {
  const statusMap: Record<Status, string> = {
    NEW: 'New',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    PENDING: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return statusMap[status] || status;
};

/**
 * Helper to get provider type display text
 */
export const getProviderTypeDisplayText = (type: ServiceProviderType | null): string => {
  if (!type) return 'Not Set';
  return type === 'INDIVIDUAL' ? 'Individual' : 'Business';
};

/**
 * Helper to get business type display text
 */
export const getBusinessTypeDisplayText = (type: BusinessType): string => {
  const typeMap: Record<BusinessType, string> = {
    SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
    PARTNERSHIP: 'Partnership',
    LIMITED_LIABILITY_COMPANY: 'Limited Liability Company (LLC)',
    CORPORATION: 'Corporation',
    COOPERATIVE: 'Cooperative',
    NON_PROFIT_ORGANIZATION: 'Non-Profit Organization',
  };
  return typeMap[type] || type;
};