/**
 * User Data Transformation Utilities
 * Maps backend user response to frontend types
 */

import type { AppUser, ServiceProvider, Admin } from '@/types/users.types';

/**
 * Backend User Response (from /v1/user/get-all)
 */
interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
  status: string;
  createdAt: string;
  updateAt: string;
  userRoles: Array<{
    roleId: string;
    roleName: string;
    userId: string;
    userName: string | null;
  }>;
  serviceProvider?: BackendServiceProvider | null;
}

interface BackendServiceProvider {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  logoUrl?: string | null;
  status: string;
  serviceProviderType?: string | null;
  documents?: {
    businessLogoUrl?: string | null;
    businessLogoHash?: string | null;
    businessRegistrationCertificateUrl?: string | null;
    businessRegistrationCertificateHash?: string | null;
    coverImageUrl?: string | null;
    coverImageHash?: string | null;
    idNumberUrl?: string | null;
    idNumberHash?: string | null;
    taxRegistrationCertificateUrl?: string | null;
    taxRegistrationCertificateHash?: string | null;
    comments?: any[] | null;
  };
  locationDetail?: {
    businessAddress?: string | null;
    postalCode?: string | null;
    websiteUrl?: string | null;
  };
  socialMedia?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter_x?: string | null;
    tiktok?: string | null;
  };
  brandIdentity?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
  notificationPreference?: {
    emailNotificationEnabled: boolean;
    smsNotificationEnabled: boolean;
    weeklyReportEnabled: boolean;
    eventApprovalNotificationEnabled: boolean;
    rsvpNotificationEnabled: boolean;
  };
}

/**
 * Transform backend user to AppUser
 */
export const transformToAppUser = (backendUser: BackendUser): AppUser => {
  // Extract role name to determine user type
  const roleName = backendUser.userRoles[0]?.roleName || 'STANDARD_USER';
  
  // Map role to user type
  const getUserType = (role: string) => {
    if (role.includes('PREMIUM')) return 'Premium';
    if (role.includes('VIP')) return 'VIP';
    return 'Standard';
  };

  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    phone: backendUser.phone,
    gender: undefined, // Not in backend response
    dateOfBirth: undefined, // Not in backend response
    location: '', // Not in backend response
    categoryPreference: [], // Not in backend response
    budgetTier: undefined, // Not in backend response
    userType: getUserType(roleName),
    eventsAttended: 0, // Not in backend response
    status: backendUser.status as any,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updateAt,
    photoUrl: backendUser.photoUrl || undefined,
  };
};

/**
 * Transform backend user to ServiceProvider
 */
export const transformToServiceProvider = (backendUser: BackendUser): ServiceProvider | null => {
  if (!backendUser.serviceProvider) {
    return null;
  }

  const sp = backendUser.serviceProvider;

  return {
    id: sp.id,
    name: sp.name,
    email: sp.email,
    phone: sp.phoneNo,
    description: undefined, // Not in backend response
    categories: [], // Not in backend response
    subcategories: [], // Not in backend response
    events: 0, // Not in backend response
    status: sp.status as any,
    commission: undefined, // Not in backend response
    documents: sp.documents ? [] : undefined, // Would need to transform documents
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updateAt,
    logoUrl: sp.logoUrl || undefined,
  };
};

/**
 * Transform backend user to Admin
 */
export const transformToAdmin = (backendUser: BackendUser): Admin => {
  // Extract role name
  const roleName = backendUser.userRoles[0]?.roleName || 'ADMIN';
  
  // Map backend role to AdminRole
  const getAdminRole = (role: string) => {
    if (role.includes('SUPER_ADMIN')) return 'Super Admin';
    if (role.includes('MODERATOR')) return 'Moderator';
    if (role.includes('DATA_ANALYST')) return 'Data Analyst';
    return 'Admin';
  };

  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    phone: backendUser.phone,
    gender: undefined, // Not in backend response
    lastLogin: backendUser.updateAt || backendUser.createdAt,
    role: getAdminRole(roleName) as any,
    status: backendUser.status as any,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updateAt,
    logoUrl: backendUser.photoUrl || undefined,
  };
};

/**
 * Determine if a user is a service provider based on their roles
 */
export const isServiceProvider = (backendUser: BackendUser): boolean => {
  return backendUser.userRoles.some(role => 
    role.roleName === 'SERVICE_PROVIDER_ROLE' || 
    role.roleName.includes('SERVICE_PROVIDER')
  );
};

/**
 * Determine if a user is an admin based on their roles
 */
export const isAdmin = (backendUser: BackendUser): boolean => {
  return backendUser.userRoles.some(role => 
    role.roleName.includes('ADMIN') || 
    role.roleName.includes('MODERATOR') ||
    role.roleName.includes('DATA_ANALYST')
  );
};

/**
 * Determine if a user is a standard app user
 */
export const isAppUser = (backendUser: BackendUser): boolean => {
  return backendUser.userRoles.some(role => 
    role.roleName === 'STANDARD_USER' ||
    role.roleName === 'PREMIUM_USER' ||
    role.roleName === 'VIP_USER' ||
    role.roleName.includes('USER')
  ) && !isServiceProvider(backendUser) && !isAdmin(backendUser);
};