/**
 * Users API Endpoints
 * API calls for Admins, Service Providers, and App Users
 */

import apiClient, { getErrorMessage } from '../client';
import type {
  Admin,
  ServiceProvider,
  AppUser,
  CreateAdminRequest,
  UpdateAdminRequest,
  CreateProviderRequest,
  UpdateProviderRequest,
  ProviderActionRequest,
  CreateAppUserRequest,
  UpdateAppUserRequest,
  UserActionRequest,
  ProviderStats,
  UserStats,
  Category,
  PaginatedResponse,
  ApiResponse,
  UserFilters,
  ProviderDocument,
  DocumentComment,
} from '../../types/users.types';

// Backend pagination response structure
interface BackendPaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Transform backend pagination response to frontend format
const transformPaginatedResponse = <T>(backendResponse: BackendPaginatedResponse<T>): PaginatedResponse<T> => {
  return {
    data: backendResponse.content,
    pagination: {
      total: backendResponse.totalElements,
      page: backendResponse.page,
      limit: backendResponse.size,
      totalPages: backendResponse.totalPages,
    },
  };
};

// =======================
// Admin Endpoints
// =======================

/**
 * Get all admins with optional filters
 * Note: Uses unified /v1/user/get-all endpoint - auth handled by interceptor
 */
export const getAdmins = async (filters?: UserFilters): Promise<PaginatedResponse<Admin>> => {
  try {
    console.log('📡 [API] GET /v1/user/get-all', filters);
    
    const response = await apiClient.get<ApiResponse<BackendPaginatedResponse<Admin>>>(
      '/v1/user/get-all',
      { params: filters }
    );
    
    console.log('✅ [API] Admins fetched successfully');
    return transformPaginatedResponse(response.data.data);
  } catch (error) {
    console.error('❌ [API] Get admins error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get admin by ID
 */
export const getAdminById = async (id: string): Promise<Admin> => {
  try {
    console.log('📡 [API] GET /v1/user/:id', { id });
    
    const response = await apiClient.get<ApiResponse<Admin>>(`/v1/user/${id}`);
    
    console.log('✅ [API] Admin fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get admin error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create new admin
 */
export const createAdmin = async (data: CreateAdminRequest): Promise<Admin> => {
  try {
    console.log('📡 [API] POST /v1/admin');
    
    const response = await apiClient.post<ApiResponse<Admin>>('/v1/admin', data);
    
    console.log('✅ [API] Admin created successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Create admin error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (id: string, data: UpdateAdminRequest): Promise<Admin> => {
  try {
    console.log('📡 [API] PUT /v1/user', { id, data });
    
    const response = await apiClient.put<ApiResponse<Admin>>(
      `/v1/user`,
      { id, ...data }
    );
    
    console.log('✅ [API] Admin updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Update admin error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (id: string): Promise<void> => {
  try {
    console.log('📡 [API] DELETE /v1/user/:id', { id });
    
    await apiClient.delete(`/v1/user/${id}`);
    
    console.log('✅ [API] Admin deleted successfully');
  } catch (error) {
    console.error('❌ [API] Delete admin error:', error);
    throw new Error(getErrorMessage(error));
  }
};

// =======================
// Service Provider Endpoints
// =======================

/**
 * Get all service providers with optional filters
 * Note: Uses unified /v1/user/get-all endpoint - auth handled by interceptor
 */
export const getServiceProviders = async (
  filters?: UserFilters
): Promise<PaginatedResponse<ServiceProvider>> => {
  try {
    console.log('📡 [API] GET /v1/user/get-all', filters);
    
    const response = await apiClient.get<ApiResponse<BackendPaginatedResponse<ServiceProvider>>>(
      '/v1/user/get-all',
      { params: filters }
    );
    
    console.log('✅ [API] Service providers fetched successfully');
    return transformPaginatedResponse(response.data.data);
  } catch (error) {
    console.error('❌ [API] Get service providers error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get service provider by ID
 */
export const getServiceProviderById = async (id: string): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] GET /v1/service-provider/:id', { id });
    
    const response = await apiClient.get<ApiResponse<ServiceProvider>>(
      `/v1/service-provider/${id}`
    );
    
    console.log('✅ [API] Service provider fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create new service provider
 */
export const createServiceProvider = async (
  data: CreateProviderRequest
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] POST /v1/sign-up/service-provider');
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
      '/v1/sign-up/service-provider',
      data
    );
    
    console.log('✅ [API] Service provider created successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Create service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update service provider
 */
export const updateServiceProvider = async (
  id: string,
  data: UpdateProviderRequest
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] PUT /v1/service-provider', { id, data });
    
    const response = await apiClient.put<ApiResponse<ServiceProvider>>(
      `/v1/service-provider`,
      { id, ...data }
    );
    
    console.log('✅ [API] Service provider updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Update service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update service provider commission
 */
export const updateProviderCommission = async (
  id: string,
  commission: number
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] PATCH /v1/service-providers/:id/commission', { id, commission });
    
    const response = await apiClient.patch<ApiResponse<ServiceProvider>>(
      `/v1/service-providers/${id}/commission`,
      { commission }
    );
    
    console.log('✅ [API] Provider commission updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Update provider commission error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Approve service provider
 */
export const approveServiceProvider = async (
  id: string,
  data?: ProviderActionRequest
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] POST /v1/service-providers/:id/approve', { id });
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
      `/v1/service-providers/${id}/approve`,
      data
    );
    
    console.log('✅ [API] Service provider approved successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Approve service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Reject service provider
 */
export const rejectServiceProvider = async (
  id: string,
  data: ProviderActionRequest
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] POST /v1/service-providers/:id/reject', { id, reason: data.reason });
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
      `/v1/service-providers/${id}/reject`,
      data
    );
    
    console.log('✅ [API] Service provider rejected successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Reject service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Suspend service provider
 */
export const suspendServiceProvider = async (
  id: string,
  data: ProviderActionRequest
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] POST /v1/service-providers/:id/suspend', { id, reason: data.reason });
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
      `/v1/service-providers/${id}/suspend`,
      data
    );
    
    console.log('✅ [API] Service provider suspended successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Suspend service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Reinstate service provider
 */
export const reinstateServiceProvider = async (
  id: string,
  data?: ProviderActionRequest
): Promise<ServiceProvider> => {
  try {
    console.log('📡 [API] POST /v1/service-providers/:id/reinstate', { id });
    
    const response = await apiClient.post<ApiResponse<ServiceProvider>>(
      `/v1/service-providers/${id}/reinstate`,
      data
    );
    
    console.log('✅ [API] Service provider reinstated successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Reinstate service provider error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get provider statistics
 */
export const getProviderStats = async (): Promise<ProviderStats> => {
  try {
    console.log('📡 [API] GET /v1/service-providers/stats');
    
    const response = await apiClient.get<ApiResponse<ProviderStats>>(
      '/v1/service-providers/stats'
    );
    
    console.log('✅ [API] Provider stats fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get provider stats error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get provider documents
 */
export const getProviderDocuments = async (id: string): Promise<ProviderDocument[]> => {
  try {
    console.log('📡 [API] GET /v1/service-providers/:id/documents', { id });
    
    const response = await apiClient.get<ApiResponse<ProviderDocument[]>>(
      `/v1/service-providers/${id}/documents`
    );
    
    console.log('✅ [API] Provider documents fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get provider documents error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get document comments
 */
export const getDocumentComments = async (
  providerId: string,
  documentId: string
): Promise<DocumentComment[]> => {
  try {
    console.log('📡 [API] GET /v1/service-providers/:id/documents/:docId/comments', {
      providerId,
      documentId,
    });
    
    const response = await apiClient.get<ApiResponse<DocumentComment[]>>(
      `/v1/service-providers/${providerId}/documents/${documentId}/comments`
    );
    
    console.log('✅ [API] Document comments fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get document comments error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Add document comment
 */
export const addDocumentComment = async (
  providerId: string,
  documentId: string,
  comment: string
): Promise<DocumentComment> => {
  try {
    console.log('📡 [API] POST /v1/service-providers/:id/documents/:docId/comments', {
      providerId,
      documentId,
    });
    
    const response = await apiClient.post<ApiResponse<DocumentComment>>(
      `/v1/service-providers/${providerId}/documents/${documentId}/comments`,
      { comment }
    );
    
    console.log('✅ [API] Comment added successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Add comment error:', error);
    throw new Error(getErrorMessage(error));
  }
};

// =======================
// App User Endpoints
// =======================

/**
 * Get all app users with optional filters
 * Note: Uses unified /v1/user/get-all endpoint - auth handled by interceptor
 */
export const getAppUsers = async (filters?: UserFilters): Promise<PaginatedResponse<AppUser>> => {
  try {
    console.log('📡 [API] GET /v1/user/get-all', filters);
    
    const response = await apiClient.get<ApiResponse<BackendPaginatedResponse<AppUser>>>(
      '/v1/user/get-all',
      { params: filters }
    );
    
    console.log('✅ [API] App users fetched successfully');
    return transformPaginatedResponse(response.data.data);
  } catch (error) {
    console.error('❌ [API] Get app users error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get app user by ID
 */
export const getAppUserById = async (id: string): Promise<AppUser> => {
  try {
    console.log('📡 [API] GET /v1/user/:id', { id });
    
    const response = await apiClient.get<ApiResponse<AppUser>>(`/v1/user/${id}`);
    
    console.log('✅ [API] App user fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get app user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create new app user
 */
export const createAppUser = async (data: CreateAppUserRequest): Promise<AppUser> => {
  try {
    console.log('📡 [API] POST /v1/app-users');
    
    const response = await apiClient.post<ApiResponse<AppUser>>('/v1/app-users', data);
    
    console.log('✅ [API] App user created successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Create app user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update app user
 */
export const updateAppUser = async (id: string, data: UpdateAppUserRequest): Promise<AppUser> => {
  try {
    console.log('📡 [API] PUT /v1/user', { id, data });
    
    const response = await apiClient.put<ApiResponse<AppUser>>(
      `/v1/user`,
      { id, ...data }
    );
    
    console.log('✅ [API] App user updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Update app user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Suspend app user
 */
export const suspendAppUser = async (
  id: string,
  data: UserActionRequest
): Promise<AppUser> => {
  try {
    console.log('📡 [API] POST /v1/app-users/:id/suspend', { id, reason: data.reason });
    
    const response = await apiClient.post<ApiResponse<AppUser>>(
      `/v1/app-users/${id}/suspend`,
      data
    );
    
    console.log('✅ [API] App user suspended successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Suspend app user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Reactivate app user
 */
export const reactivateAppUser = async (
  id: string,
  data?: UserActionRequest
): Promise<AppUser> => {
  try {
    console.log('📡 [API] POST /v1/app-users/:id/reactivate', { id });
    
    const response = await apiClient.post<ApiResponse<AppUser>>(
      `/v1/app-users/${id}/reactivate`,
      data
    );
    
    console.log('✅ [API] App user reactivated successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Reactivate app user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    console.log('📡 [API] GET /v1/app-users/stats');
    
    const response = await apiClient.get<ApiResponse<UserStats>>('/v1/app-users/stats');
    
    console.log('✅ [API] User stats fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get user stats error:', error);
    throw new Error(getErrorMessage(error));
  }
};

// =======================
// Category Endpoints
// =======================

/**
 * Get all categories with subcategories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('📡 [API] GET /v1/categories');
    
    const response = await apiClient.get<ApiResponse<Category[]>>('/v1/categories');
    
    console.log('✅ [API] Categories fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ [API] Get categories error:', error);
    throw new Error(getErrorMessage(error));
  }
};

// Export all as a single object
export const usersApi = {
  // Admins
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,

  // Service Providers
  getServiceProviders,
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  updateProviderCommission,
  approveServiceProvider,
  rejectServiceProvider,
  suspendServiceProvider,
  reinstateServiceProvider,
  getProviderStats,
  getProviderDocuments,
  getDocumentComments,
  addDocumentComment,

  // App Users
  getAppUsers,
  getAppUserById,
  createAppUser,
  updateAppUser,
  suspendAppUser,
  reactivateAppUser,
  getUserStats,

  // Categories
  getCategories,
};