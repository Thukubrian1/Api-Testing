import type {
  ApiResponse,
  User,
  ProfileUpdatePayload,
  DocumentUploadPayload,
  PaymentAccount,
  BankAccountData,
  MobileWalletData,
  WithdrawalLimitSettings,
} from '../../types/profile.types';
import apiClient, { getErrorMessage } from '../client';

/**
 * Extract user data from API response
 * ✅ FIXED: More robust response handling with detailed logging
 */
const extractUserData = (response: any, context: string): User => {
  console.log(`📋 [PROFILE API] Extracting user data - ${context}`);
  console.log(`📋 [PROFILE API] Full response:`, response);

  let userData: any = null;

  // Handle Axios response structure
  if (response && response.data) {
    console.log(`📋 [PROFILE API] response.data exists`);
    
    // Check if response.data has the expected API wrapper structure
    if (response.data.data) {
      console.log(`📋 [PROFILE API] Using response.data.data (API wrapper format)`);
      userData = response.data.data;
    } 
    // Check if response.data is already the user object
    else if (response.data.id && response.data.email) {
      console.log(`📋 [PROFILE API] Using response.data directly (user object format)`);
      userData = response.data;
    }
    // Handle case where data is wrapped differently
    else if (typeof response.data === 'object') {
      console.log(`📋 [PROFILE API] response.data is object but not standard format`);
      // Try to find user data in the response
      if (response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
        console.log(`📋 [PROFILE API] Found content array, using first item`);
        userData = response.data.content[0];
      } else {
        console.log(`📋 [PROFILE API] Attempting to use response.data as-is`);
        userData = response.data;
      }
    }
  } else if (response && response.id && response.email) {
    console.log(`📋 [PROFILE API] Response is already user object (no .data wrapper)`);
    userData = response;
  }

  if (!userData) {
    console.error('❌ [PROFILE API] Could not extract user data from response');
    console.error('Response structure:', JSON.stringify(response, null, 2));
    throw new Error('Invalid response structure: Could not find user data');
  }

  if (typeof userData === 'string') {
    console.error('❌ [PROFILE API] User data is a string:', userData);
    throw new Error('Server returned invalid data format');
  }

  if (typeof userData !== 'object') {
    console.error('❌ [PROFILE API] User data is not an object:', typeof userData);
    throw new Error('Invalid user data format');
  }

  if (!userData.id || !userData.email) {
    console.error('❌ [PROFILE API] User data missing required fields');
    console.error('User data:', JSON.stringify(userData, null, 2));
    throw new Error('Invalid user data: Missing required fields (id or email)');
  }

  console.log('✅ [PROFILE API] User data extracted successfully');
  console.log('📋 [PROFILE API] User ID:', userData.id);
  console.log('📋 [PROFILE API] User email:', userData.email);
  
  return userData as User;
};

/**
 * Get all users (paginated)
 */
export const getAllUsers = async (pageNo: number = 0, pageSize: number = 10): Promise<User[]> => {
  try {
    console.log('📡 [PROFILE API] GET /v1/user/get-all', { pageNo, pageSize });
    
    const response = await apiClient.get<ApiResponse<{ content: User[] }>>(
      '/v1/user/get-all',
      { params: { pageNo, pageSize } }
    );
    
    console.log('✅ [PROFILE API] Users retrieved successfully');
    
    if (response.data?.data?.content) {
      return response.data.data.content;
    }
    
    return [];
  } catch (error) {
    console.error('❌ [PROFILE API] Get all users error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get user by ID
 * Backend: GET /v1/user/:id
 * 
 * ✅ IMPROVED: Added retry logic for reliability
 */
export const getUserById = async (
  userId: string,
  retryCount: number = 0,
  maxRetries: number = 5
): Promise<User> => {
  try {
    console.log('📡 [PROFILE API] GET /v1/user/:id', { 
      userId, 
      attempt: retryCount + 1,
      maxRetries: maxRetries + 1
    });
    
    const response = await apiClient.get(`/v1/user/${userId}`);
    
    console.log('✅ [PROFILE API] User profile retrieved successfully');
    console.log('📋 [PROFILE API] Response status:', response.status);
    
    return extractUserData(response, 'getUserById');
  } catch (error: any) {
    console.error('❌ [PROFILE API] Get user by ID error:', error);
    
    // Check if it's a network error and we haven't exceeded retry limit
    const isNetworkError = 
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout');
    
    if (isNetworkError && retryCount < maxRetries) {
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
      console.log(`⏳ [PROFILE API] Network error, retrying in ${waitTime}ms... (attempt ${retryCount + 2}/${maxRetries + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return getUserById(userId, retryCount + 1, maxRetries);
    }
    
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get user by service provider ID
 * 
 * ✅ WORKAROUND: JWT contains service_provider_id but /v1/user/:id needs user_id
 * This function finds user by their service provider ID
 * 
 * TEMPORARY: Until backend JWT is fixed to use user_id in sub field
 */
export const getUserByServiceProviderId = async (serviceProviderId: string): Promise<User> => {
  try {
    console.log('📡 [PROFILE API] GET user by service provider ID:', serviceProviderId);
    
    // Get all users and find the one with matching service provider ID
    const response = await apiClient.get<ApiResponse<{ content: User[] }>>(
      '/v1/user/get-all',
      { params: { pageNo: 0, pageSize: 100 } }  // Get enough users
    );
    
    const users = response.data.data.content;
    console.log(`📋 [PROFILE API] Searching ${users.length} users for service provider ID match...`);
    
    const user = users.find(u => {
      const match = u.serviceProvider?.id === serviceProviderId;
      if (match) {
        console.log('✅ [PROFILE API] Found matching user!');
        console.log('📋 [PROFILE API] USER ID:', u.id);
        console.log('📋 [PROFILE API] SERVICE PROVIDER ID:', u.serviceProvider.id);
        console.log('📋 [PROFILE API] Name:', u.name);
      }
      return match;
    });
    
    if (!user) {
      console.error('❌ [PROFILE API] No user found with service provider ID:', serviceProviderId);
      throw new Error('User not found with service provider ID: ' + serviceProviderId);
    }
    
    console.log('✅ [PROFILE API] User retrieved by service provider ID');
    return user;
  } catch (error) {
    console.error('❌ [PROFILE API] Get user by service provider ID error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * ✅ CRITICAL FIX: Build COMPLETE payload with all fields
 * 
 * Backend issue: ServiceProviderService.updateServiceProvider() uses setters directly:
 * - serviceProvider.setTaxPin(updateServiceProviderDTO.getTaxPin())
 * - If you send null, it sets null (overwrites existing data)
 * 
 * Solution: Always send complete object with all fields, merging updates with current data
 * 
 * ✅ IMPROVED: Better handling of null vs undefined, preserves boolean false values
 */
const buildCompletePayload = (
  currentServiceProvider: any,
  updates: Partial<ProfileUpdatePayload>
): any => {
  console.log('🔧 [PROFILE API] Building complete payload');
  console.log('📋 [PROFILE API] Current data:', {
    id: currentServiceProvider.id,
    name: currentServiceProvider.name,
    status: currentServiceProvider.status,
    serviceProviderType: currentServiceProvider.serviceProviderType,
  });
  console.log('📋 [PROFILE API] Updates:', updates);

  // Helper to safely get value, preserving null but using fallback for undefined
  const safeValue = (current: any, fallback: any) => {
    return current !== undefined && current !== null ? current : fallback;
  };

  // Start with all current values - preserve existing values including null
  const payload: any = {
    id: currentServiceProvider.id,
    name: currentServiceProvider.name,
    status: currentServiceProvider.status || 'ACTIVE',
    serviceProviderType: currentServiceProvider.serviceProviderType || null,
    idNumber: currentServiceProvider.idNumber || null,
    businessRegistrationNumber: currentServiceProvider.businessRegistrationNumber || null,
    taxPin: currentServiceProvider.taxPin || null,
    
    // Nested objects - preserve existing structure exactly
    locationDetail: {
      businessAddress: safeValue(currentServiceProvider.locationDetail?.businessAddress, null),
      postalCode: safeValue(currentServiceProvider.locationDetail?.postalCode, null),
      websiteUrl: safeValue(currentServiceProvider.locationDetail?.websiteUrl, null),
    },
    notificationPreference: {
      emailNotificationEnabled: Boolean(currentServiceProvider.notificationPreference?.emailNotificationEnabled),
      eventApprovalNotificationEnabled: Boolean(currentServiceProvider.notificationPreference?.eventApprovalNotificationEnabled),
      rsvpNotificationEnabled: Boolean(currentServiceProvider.notificationPreference?.rsvpNotificationEnabled),
      smsNotificationEnabled: Boolean(currentServiceProvider.notificationPreference?.smsNotificationEnabled),
      weeklyReportEnabled: Boolean(currentServiceProvider.notificationPreference?.weeklyReportEnabled),
    },
    socialMedia: {
      facebook: safeValue(currentServiceProvider.socialMedia?.facebook, null),
      instagram: safeValue(currentServiceProvider.socialMedia?.instagram, null),
      tiktok: safeValue(currentServiceProvider.socialMedia?.tiktok, null),
      twitter_x: safeValue(currentServiceProvider.socialMedia?.twitter_x, null),
    },
    brandIdentity: {
      primaryColor: safeValue(currentServiceProvider.brandIdentity?.primaryColor, null),
      secondaryColor: safeValue(currentServiceProvider.brandIdentity?.secondaryColor, null),
    },
  };

  // Now merge updates - only update fields that are explicitly provided
  if (updates.name !== undefined) {
    payload.name = updates.name;
  }
  
  if (updates.status !== undefined) {
    payload.status = updates.status;
  }
  
  if (updates.serviceProviderType !== undefined) {
    payload.serviceProviderType = updates.serviceProviderType;
  }
  
  if (updates.idNumber !== undefined) {
    payload.idNumber = updates.idNumber;
  }
  
  if (updates.businessRegistrationNumber !== undefined) {
    payload.businessRegistrationNumber = updates.businessRegistrationNumber;
  }
  
  if (updates.taxPin !== undefined) {
    payload.taxPin = updates.taxPin;
  }
  
  // Merge nested objects - only update provided fields
  if (updates.locationDetail) {
    payload.locationDetail = {
      ...payload.locationDetail,
      ...Object.fromEntries(
        Object.entries(updates.locationDetail).filter(([_, v]) => v !== undefined)
      ),
    };
  }
  
  if (updates.notificationPreference) {
    payload.notificationPreference = {
      ...payload.notificationPreference,
      ...Object.fromEntries(
        Object.entries(updates.notificationPreference).filter(([_, v]) => v !== undefined)
      ),
    };
  }
  
  if (updates.socialMedia) {
    payload.socialMedia = {
      ...payload.socialMedia,
      ...Object.fromEntries(
        Object.entries(updates.socialMedia).filter(([_, v]) => v !== undefined)
      ),
    };
  }
  
  if (updates.brandIdentity) {
    payload.brandIdentity = {
      ...payload.brandIdentity,
      ...Object.fromEntries(
        Object.entries(updates.brandIdentity).filter(([_, v]) => v !== undefined)
      ),
    };
  }

  console.log('✅ [PROFILE API] Complete payload built');
  console.log('📤 [PROFILE API] Final payload:', JSON.stringify(payload, null, 2));

  return payload;
};

/**
 * Update service provider profile
 * 
 * ✅ FIXED: Now sends complete payload to prevent null overwrites
 * ✅ IMPROVED: Better error handling and timing
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<ProfileUpdatePayload>
): Promise<User> => {
  try {
    console.log('📡 [PROFILE API] Update profile');
    console.log('📋 [PROFILE API] User ID:', userId);
    console.log('📋 [PROFILE API] Updates:', updates);
    
    // Step 1: Get current user data
    console.log('📡 [PROFILE API] Step 1: Fetching current user data...');
    const currentUser = await getUserById(userId);
    const currentServiceProvider = currentUser.serviceProvider;
    
    if (!currentServiceProvider) {
      throw new Error('Service provider data not found');
    }
    
    const serviceProviderId = currentServiceProvider.id;
    console.log('📋 [PROFILE API] Service Provider ID:', serviceProviderId);
    
    // Step 2: Build complete payload (merges updates with current data)
    console.log('📡 [PROFILE API] Step 2: Building complete payload...');
    const payload = buildCompletePayload(currentServiceProvider, updates);
    
    // Step 3: Send update request
    console.log('📡 [PROFILE API] Step 3: Sending PUT /v1/service-provider');
    const updateResponse = await apiClient.put(`/v1/service-provider`, payload);
    
    console.log('✅ [PROFILE API] Update request completed');
    console.log('📋 [PROFILE API] Response status:', updateResponse.status);
    console.log('📋 [PROFILE API] Response data:', updateResponse.data);
    
    // ✅ CRITICAL FIX: Extract ServiceProviderDTO from PUT response
    // This avoids the issue where GET /v1/user/:id returns empty data
    let updatedServiceProvider: any = null;
    
    if (updateResponse.data?.data) {
      console.log('📋 [PROFILE API] Found updated service provider in response.data.data');
      updatedServiceProvider = updateResponse.data.data;
    } else if (updateResponse.data && typeof updateResponse.data === 'object' && updateResponse.data.id) {
      console.log('📋 [PROFILE API] Found updated service provider in response.data');
      updatedServiceProvider = updateResponse.data;
    }
    
    if (updatedServiceProvider) {
      // Build complete User object by merging updated ServiceProvider with existing User data
      const updatedUser: User = {
        ...currentUser,
        serviceProvider: updatedServiceProvider,
        // Sync user-level fields with service provider fields
        name: updatedServiceProvider.name || currentUser.name,
        email: updatedServiceProvider.email || currentUser.email,
        phone: updatedServiceProvider.phoneNo || currentUser.phone,
      };
      
      console.log('✅ [PROFILE API] Profile updated successfully (using PUT response data)');
      console.log('📋 [PROFILE API] Updated service provider:', {
        id: updatedServiceProvider.id,
        name: updatedServiceProvider.name,
        status: updatedServiceProvider.status,
        hasLocationDetail: !!updatedServiceProvider.locationDetail,
        hasSocialMedia: !!updatedServiceProvider.socialMedia,
      });
      
      return updatedUser;
    }
    
    // Fallback: Response didn't contain data (shouldn't happen with status 200)
    console.warn('⚠️ [PROFILE API] PUT response did not contain ServiceProviderDTO');
    console.warn('⚠️ [PROFILE API] This is unexpected - attempting fallback fetch...');
    
    try {
      // Wait for database to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fetchedUser = await getUserById(userId);
      console.log('✅ [PROFILE API] Profile updated successfully (fetched after delay)');
      return fetchedUser;
    } catch (fetchError) {
      console.error('❌ [PROFILE API] Failed to fetch updated user');
      console.warn('⚠️ [PROFILE API] Returning optimistic update based on payload');
      // Return optimistic update: merge payload with current user
      return {
        ...currentUser,
        serviceProvider: {
          ...currentServiceProvider,
          ...payload,
        },
      };
    }
  } catch (error: any) {
    console.error('❌ [PROFILE API] Update profile error:', error);
    console.error('📋 [PROFILE API] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Convenience functions for updating specific sections
 */
export const updateBasicInformation = (userId: string, data: { name?: string }) =>
  updateProfile(userId, data);

export const updateProviderInformation = (
  userId: string,
  data: {
    serviceProviderType?: 'INDIVIDUAL' | 'BUSINESS';
    idNumber?: string;
    businessRegistrationNumber?: string;
    taxPin?: string;
  }
) => updateProfile(userId, data);

export const updateLocationDetails = (
  userId: string,
  data: {
    businessAddress?: string;
    postalCode?: string;
    websiteUrl?: string;
  }
) => updateProfile(userId, { locationDetail: data });

export const updateNotificationPreferences = (
  userId: string,
  data: {
    emailNotificationEnabled?: boolean;
    smsNotificationEnabled?: boolean;
    rsvpNotificationEnabled?: boolean;
    eventApprovalNotificationEnabled?: boolean;
    weeklyReportEnabled?: boolean;
  }
) => updateProfile(userId, { notificationPreference: data });

export const updateSocialMedia = (
  userId: string,
  data: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter_x?: string;
  }
) => updateProfile(userId, { socialMedia: data });

export const updateBrandIdentity = (
  userId: string,
  data: {
    primaryColor?: string;
    secondaryColor?: string;
  }
) => updateProfile(userId, { brandIdentity: data });

/**
 * Upload documents
 * PUT /v1/service-provider/{id}/documents
 * 
 * ⚠️ CRITICAL BACKEND CONSTRAINT:
 * The backend requires ALL 4 document fields to be present:
 * - businessLogo (required)
 * - nationalId (required)
 * - taxRegistrationCertificate (required)
 * - coverImage (required)
 * 
 * The backend controller uses @RequestPart without required=false,
 * making all parameters mandatory. Partial updates are not supported.
 * 
 * ✅ FIXED: Added validation and clear error messages
 */
export const uploadDocuments = async (
  userId: string,
  documents: DocumentUploadPayload
): Promise<User> => {
  try {
    console.log('📡 [PROFILE API] Upload documents');
    console.log('📋 [PROFILE API] Documents to upload:', {
      hasBusinessLogo: !!documents.businessLogo,
      hasNationalId: !!documents.nationalId,
      hasTaxCert: !!documents.taxRegistrationCertificate,
      hasCoverImage: !!documents.coverImage,
    });

    // ✅ NEW: Support partial/flexible document uploads
    // At least one document must be provided
    const hasAnyDocument = documents.businessLogo || 
                          documents.nationalId || 
                          documents.taxRegistrationCertificate || 
                          documents.coverImage;

    if (!hasAnyDocument) {
      const errorMsg = 'Please select at least one document to upload.';
      console.error('❌ [PROFILE API]', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Step 1: Get service provider ID
    console.log('📡 [PROFILE API] Step 1: Fetching current user data...');
    const currentUser = await getUserById(userId);
    const serviceProviderId = currentUser.serviceProvider?.id;
    
    if (!serviceProviderId) {
      throw new Error('Service provider ID not found');
    }
    
    console.log('📋 [PROFILE API] User ID:', userId);
    console.log('📋 [PROFILE API] Service Provider ID:', serviceProviderId);
    
    // Step 2: Build FormData - Include only provided documents
    const formData = new FormData();
    let uploadCount = 0;
    
    if (documents.businessLogo) {
      formData.append('businessLogo', documents.businessLogo);
      uploadCount++;
      console.log('📎 [PROFILE API] Adding businessLogo');
    }
    
    if (documents.nationalId) {
      formData.append('nationalId', documents.nationalId);
      uploadCount++;
      console.log('📎 [PROFILE API] Adding nationalId');
    }
    
    if (documents.taxRegistrationCertificate) {
      formData.append('taxRegistrationCertificate', documents.taxRegistrationCertificate);
      uploadCount++;
      console.log('📎 [PROFILE API] Adding taxRegistrationCertificate');
    }
    
    if (documents.coverImage) {
      formData.append('coverImage', documents.coverImage);
      uploadCount++;
      console.log('📎 [PROFILE API] Adding coverImage');
    }
    
    console.log(`📤 [PROFILE API] Uploading ${uploadCount} document(s)...`);
    console.log('📋 [PROFILE API] FormData keys:', Array.from(formData.keys()));
    
    // Step 3: Upload with detailed logging
    console.log('📡 [PROFILE API] PUT /v1/service-provider/' + serviceProviderId + '/documents');
    
    const uploadResponse = await apiClient.put(
      `/v1/service-provider/${serviceProviderId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('✅ [PROFILE API] Documents uploaded successfully');
    console.log('📋 [PROFILE API] Response status:', uploadResponse.status);
    console.log('📋 [PROFILE API] Response data:', uploadResponse.data);
    
    // Step 4: Fetch updated user using the ACTUAL user ID
    console.log('📡 [PROFILE API] Step 4: Fetching updated user data...');
    console.log('📋 [PROFILE API] Using USER ID (not service provider ID):', userId);
    const updatedUser = await getUserById(userId);
    
    console.log('✅ [PROFILE API] Upload complete, user data updated');
    
    return updatedUser;
  } catch (error: any) {
    console.error('❌ [PROFILE API] Upload documents error:', error);
    console.error('📋 [PROFILE API] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(getErrorMessage(error));
  }
};

/**
 * ⚠️ PARTIAL UPLOAD WORKAROUND
 * 
 * Since the backend requires all 4 fields, this function helps users
 * understand which documents they need to provide.
 * 
 * Use this to check current document status before uploading.
 */
export const getDocumentUploadRequirements = async (
  userId: string
): Promise<{
  allRequired: string[];
  currentlyMissing: string[];
  hasAllDocuments: boolean;
}> => {
  try {
    const user = await getUserById(userId);
    const docs = user.serviceProvider?.documents;
    
    const allRequired = [
      'businessLogo',
      'nationalId', 
      'taxRegistrationCertificate',
      'coverImage'
    ];
    
    const currentlyMissing: string[] = [];
    
    if (!docs?.businessLogoUrl) currentlyMissing.push('businessLogo');
    if (!docs?.idNumberUrl) currentlyMissing.push('nationalId');
    if (!docs?.taxRegistrationCertificateUrl) currentlyMissing.push('taxRegistrationCertificate');
    if (!docs?.coverImageUrl) currentlyMissing.push('coverImage');
    
    return {
      allRequired,
      currentlyMissing,
      hasAllDocuments: currentlyMissing.length === 0,
    };
  } catch (error) {
    console.error('❌ [PROFILE API] Get document requirements error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * ⚠️ NOTE: These convenience functions won't work as-is due to backend constraints.
 * The backend requires ALL 4 document fields (businessLogo, nationalId, 
 * taxRegistrationCertificate, coverImage) to be present in the request.
 * 
 * Use uploadDocuments() with all 4 files instead, or wait for backend update
 * to support partial document updates.
 */
export const uploadLogo = (userId: string, file: File) => {
  console.warn('⚠️ [PROFILE API] uploadLogo requires all 4 document fields due to backend constraints');
  console.warn('⚠️ [PROFILE API] Please use uploadDocuments() with all 4 files instead');
  throw new Error('Backend requires all 4 document fields. Use uploadDocuments() with all required files.');
};

export const uploadCoverImage = (userId: string, file: File) => {
  console.warn('⚠️ [PROFILE API] uploadCoverImage requires all 4 document fields due to backend constraints');
  console.warn('⚠️ [PROFILE API] Please use uploadDocuments() with all 4 files instead');
  throw new Error('Backend requires all 4 document fields. Use uploadDocuments() with all required files.');
};

/**
 * Payment accounts (stubs - implement when backend is ready)
 */
export const getPaymentAccounts = async (): Promise<PaymentAccount[]> => {
  try {
    const response = await apiClient.get('/v1/payment-accounts');
    return response.data?.data || [];
  } catch (error) {
    console.error('❌ [PROFILE API] Get payment accounts error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const addBankAccount = async (data: BankAccountData): Promise<PaymentAccount> => {
  try {
    const response = await apiClient.post('/v1/payment-accounts/bank', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('❌ [PROFILE API] Add bank account error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const addMobileWallet = async (data: MobileWalletData): Promise<PaymentAccount> => {
  try {
    const response = await apiClient.post('/v1/payment-accounts/mobile', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('❌ [PROFILE API] Add mobile wallet error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const setDefaultPaymentAccount = async (accountId: string): Promise<void> => {
  try {
    await apiClient.put(`/v1/payment-accounts/${accountId}/default`);
  } catch (error) {
    console.error('❌ [PROFILE API] Set default payment account error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const deletePaymentAccount = async (accountId: string): Promise<void> => {
  try {
    await apiClient.delete(`/v1/payment-accounts/${accountId}`);
  } catch (error) {
    console.error('❌ [PROFILE API] Delete payment account error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const getWithdrawalLimits = async (): Promise<WithdrawalLimitSettings> => {
  try {
    const response = await apiClient.get('/v1/settings/withdrawal-limits');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('❌ [PROFILE API] Get withdrawal limits error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const updateWithdrawalLimits = async (
  data: Partial<WithdrawalLimitSettings>
): Promise<WithdrawalLimitSettings> => {
  try {
    const response = await apiClient.put('/v1/settings/withdrawal-limits', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('❌ [PROFILE API] Update withdrawal limits error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const profileApi = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateBasicInformation,
  updateProviderInformation,
  updateLocationDetails,
  updateNotificationPreferences,
  updateSocialMedia,
  updateBrandIdentity,
  uploadDocuments,
  uploadLogo,
  uploadCoverImage,
  getDocumentUploadRequirements,
  getPaymentAccounts,
  addBankAccount,
  addMobileWallet,
  setDefaultPaymentAccount,
  deletePaymentAccount,
  getWithdrawalLimits,
  updateWithdrawalLimits,
};