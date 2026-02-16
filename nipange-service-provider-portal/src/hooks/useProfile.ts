import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  ProfileUpdatePayload,
  DocumentUploadPayload,
  BankAccountData,
  MobileWalletData,
  WithdrawalLimitSettings,
} from '../types/profile.types';
import { useAuthStore } from '../store/slices/authSlice';
import { profileApi } from '../api/endpoints/profile.api';

/**
 * Hook to get current user profile by ID
 * This is called after login using the user ID from JWT
 * 
 * ✅ FIXED: Added aggressive retry logic for backend timing issues
 * ✅ FIXED: Keeps previous data while retrying (no blank screen)
 * ✅ FIXED: Auth store updated with USER ID, not service provider ID
 */
export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      console.log('🔄 [USE PROFILE] Fetching user profile for ID:', userId);
      return profileApi.getUserById(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // ✅ CRITICAL FIX: Retry up to 5 times (handles backend timing issues)
    retry: 5,
    
    // ✅ CRITICAL FIX: Use increasing delays (2s, 4s, 6s, 8s, 10s)
    retryDelay: (attemptIndex) => {
      const delay = Math.min(2000 * (attemptIndex + 1), 10000);
      console.log(`⏳ [USE PROFILE] Retry attempt ${attemptIndex + 1}/5 in ${delay}ms...`);
      return delay;
    },
    
    // ✅ CRITICAL FIX: Keep showing previous data while retrying (no blank screen)
    placeholderData: (previousData) => previousData,
    
    onSuccess: (data) => {
      console.log('✅ [USE PROFILE] User profile loaded:', {
        id: data.id,
        name: data.name,
        email: data.email,
      });
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Failed to load user profile after 5 retries:', error.message);
      console.error('💡 [USE PROFILE] Please try refreshing the page');
    },
  });
};

/**
 * Hook to get all users (if needed for admin features)
 */
export const useAllUsers = (pageNo: number = 0, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['all-users', pageNo, pageSize],
    queryFn: () => profileApi.getAllUsers(pageNo, pageSize),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update profile
 * ✅ FIXED: Supports partial updates (single or multiple fields)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { serviceProvider, updateServiceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: Partial<ProfileUpdatePayload>) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('🔄 [USE PROFILE] Updating profile with data:', Object.keys(data));
      console.log('📋 [USE PROFILE] Update payload:', data);
      
      // Pass the user ID (from JWT), API will extract service provider ID internally
      return profileApi.updateProfile(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Profile updated successfully');
      console.log('📋 [USE PROFILE] Updated user ID:', updatedUser.id);
      console.log('📋 [USE PROFILE] Service provider ID:', updatedUser.serviceProvider?.id);
      console.log('📋 [USE PROFILE] Service provider name:', updatedUser.serviceProvider?.name);
      console.log('📋 [USE PROFILE] Service provider type:', updatedUser.serviceProvider?.serviceProviderType);
      
      // Update the cached user profile
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      
      // Also invalidate to trigger a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
      
      // ✅ CRITICAL FIX: Update auth store with ALL service provider fields
      // This ensures the top bar and other components show the latest data
      if (updatedUser.serviceProvider) {
        console.log('🔄 [USE PROFILE] Updating auth store with new service provider data');
        console.log('⚠️  [USE PROFILE] PRESERVING user ID in auth store (not replacing with SP ID)');
        
        // Get current service provider from auth to preserve the USER ID
        const currentServiceProvider = useAuthStore.getState().serviceProvider;
        const currentUserId = currentServiceProvider?.id;
        
        console.log('📋 [USE PROFILE] Current auth store ID:', currentUserId);
        console.log('📋 [USE PROFILE] Will preserve this ID after update');
        
        // ✅ CRITICAL: Update ALL service provider fields while preserving USER ID
        updateServiceProvider({
          // ✅ CRITICAL: Keep the existing USER ID, DO NOT replace with service provider data
          id: currentUserId || updatedUser.id,  
          name: updatedUser.serviceProvider.name,
          email: updatedUser.serviceProvider.email,
          phoneNo: updatedUser.serviceProvider.phoneNo,
          status: updatedUser.serviceProvider.status,
          logoUrl: updatedUser.serviceProvider.logoUrl,
          serviceProviderType: updatedUser.serviceProvider.serviceProviderType, 
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updateAt,
          // Don't spread the entire serviceProvider object as it contains SP ID, not user ID
        });
        
        console.log('✅ [USE PROFILE] Auth store updated with all fields, USER ID preserved');
        console.log('📋 [USE PROFILE] Updated fields:', {
          id: currentUserId,
          name: updatedUser.serviceProvider.name,
          type: updatedUser.serviceProvider.serviceProviderType,
          status: updatedUser.serviceProvider.status,
        });
      }
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Profile update failed:', error.message);
      // Don't show toast here - let the component handle it
    },
  });
};

/**
 * ✅ SECTION 1: Hook to update basic information
 * Fields: name
 */
export const useUpdateBasicInformation = () => {
  const queryClient = useQueryClient();
  const { serviceProvider, updateServiceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: { name?: string }) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('📄 [USE PROFILE] Updating basic information');
      console.log('📋 [USE PROFILE] Basic info payload:', data);
      return profileApi.updateBasicInformation(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Basic information updated successfully');
      console.log('📋 [USE PROFILE] New name:', updatedUser.serviceProvider?.name);
      
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
      
      // ✅ FIX: Update auth store with ALL fields including name
      if (updatedUser.serviceProvider) {
        // Get current auth user ID to preserve it
        const currentServiceProvider = useAuthStore.getState().serviceProvider;
        const currentUserId = currentServiceProvider?.id;
        
        console.log('🔄 [USE PROFILE] Updating auth store with basic info');
        console.log('📋 [USE PROFILE] New name:', updatedUser.serviceProvider.name);
        
        updateServiceProvider({
          id: currentUserId || updatedUser.id,  // Preserve USER ID
          name: updatedUser.serviceProvider.name,
          email: updatedUser.serviceProvider.email,
          phone: updatedUser.serviceProvider.phoneNo,
          status: updatedUser.serviceProvider.status,
          logoUrl: updatedUser.serviceProvider.logoUrl,
          serviceProviderType: updatedUser.serviceProvider.serviceProviderType || '',
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updateAt,
        });
        
        console.log('✅ [USE PROFILE] Auth store updated with new name:', updatedUser.serviceProvider.name);
      }
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Basic information update failed:', error.message);
    },
  });
};

/**
 * ✅ SECTION 2: Hook to update provider information
 * Fields: serviceProviderType, idNumber, businessRegistrationNumber, taxPin
 */
export const useUpdateProviderInformation = () => {
  const queryClient = useQueryClient();
  const { serviceProvider, updateServiceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      serviceProviderType?: 'INDIVIDUAL' | 'BUSINESS';
      idNumber?: string;
      businessRegistrationNumber?: string;
      taxPin?: string;
    }) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('📄 [USE PROFILE] Updating provider information');
      console.log('📋 [USE PROFILE] Provider info payload:', data);
      return profileApi.updateProviderInformation(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Provider information updated successfully');
      console.log('📋 [USE PROFILE] New provider type:', updatedUser.serviceProvider?.serviceProviderType);
      
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
      
      // ✅ FIX: Update auth store with ALL provider information fields
      if (updatedUser.serviceProvider) {
        // Get current auth user ID to preserve it
        const currentServiceProvider = useAuthStore.getState().serviceProvider;
        const currentUserId = currentServiceProvider?.id;
        
        console.log('🔄 [USE PROFILE] Updating auth store with provider info');
        console.log('📋 [USE PROFILE] Provider type:', updatedUser.serviceProvider.serviceProviderType);
        
        updateServiceProvider({
          id: currentUserId || updatedUser.id,  // Preserve USER ID
          serviceProviderType: updatedUser.serviceProvider.serviceProviderType || '',
          name: updatedUser.serviceProvider.name,
          email: updatedUser.serviceProvider.email,
          phone: updatedUser.serviceProvider.phoneNo,
          status: updatedUser.serviceProvider.status,
          logoUrl: updatedUser.serviceProvider.logoUrl,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updateAt,
        });
        
        console.log('✅ [USE PROFILE] Auth store updated with provider type:', updatedUser.serviceProvider.serviceProviderType);
      }
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Provider information update failed:', error.message);
    },
  });
};

/**
 * ✅ SECTION 3: Hook to update location details
 * Fields: businessAddress, postalCode, websiteUrl
 */
export const useUpdateLocationDetails = () => {
  const queryClient = useQueryClient();
  const { serviceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      businessAddress?: string;
      postalCode?: string;
      websiteUrl?: string;
    }) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('📄 [USE PROFILE] Updating location details');
      return profileApi.updateLocationDetails(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Location details updated successfully');
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Location details update failed:', error.message);
    },
  });
};

/**
 * ✅ SECTION 4: Hook to update notification preferences
 * Fields: email, SMS, RSVP, event approval, weekly reports
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { serviceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      emailNotificationEnabled?: boolean;
      smsNotificationEnabled?: boolean;
      rsvpNotificationEnabled?: boolean;
      eventApprovalNotificationEnabled?: boolean;
      weeklyReportEnabled?: boolean;
    }) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('📄 [USE PROFILE] Updating notification preferences');
      return profileApi.updateNotificationPreferences(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Notification preferences updated successfully');
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Notification preferences update failed:', error.message);
    },
  });
};

/**
 * ✅ SECTION 5: Hook to update social media links
 * Fields: facebook, instagram, tiktok, twitter_x
 */
export const useUpdateSocialMedia = () => {
  const queryClient = useQueryClient();
  const { serviceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      twitter_x?: string;
    }) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('📄 [USE PROFILE] Updating social media links');
      return profileApi.updateSocialMedia(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Social media links updated successfully');
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Social media update failed:', error.message);
    },
  });
};

/**
 * ✅ SECTION 6: Hook to update brand identity
 * Fields: primaryColor, secondaryColor
 */
export const useUpdateBrandIdentity = () => {
  const queryClient = useQueryClient();
  const { serviceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      primaryColor?: string;
      secondaryColor?: string;
    }) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('📄 [USE PROFILE] Updating brand identity');
      return profileApi.updateBrandIdentity(serviceProvider.id, data);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Brand identity updated successfully');
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Brand identity update failed:', error.message);
    },
  });
};

/**
 * Hook to upload documents
 * ✅ FIXED: Supports uploading single or multiple documents
 */
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();
  const { serviceProvider, updateServiceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (documents: DocumentUploadPayload) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      const docTypes = Object.keys(documents).filter(k => documents[k as keyof DocumentUploadPayload]);
      console.log('🔄 [USE PROFILE] Uploading documents:', docTypes);
      
      return profileApi.uploadDocuments(serviceProvider.id, documents);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Documents uploaded successfully');
      
      // Update cached profile
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      
      // Invalidate to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
      
      // Update auth store if logo URL changed
      if (updatedUser.serviceProvider?.documents?.businessLogoUrl) {
        const newLogoUrl = updatedUser.serviceProvider.documents.businessLogoUrl;
        console.log('🔄 [USE PROFILE] Updating logo URL in auth store:', newLogoUrl);
        updateServiceProvider({
          logoUrl: newLogoUrl,
        });
      }
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Document upload failed:', error.message);
      // Don't show toast here - let the component handle it
    },
  });
};

/**
 * Hook to upload logo only
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  const { serviceProvider, updateServiceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('🔄 [USE PROFILE] Uploading logo:', file.name);
      return profileApi.uploadLogo(serviceProvider.id, file);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Logo uploaded successfully');
      
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
      
      const logoUrl = updatedUser.serviceProvider?.documents?.businessLogoUrl;
      if (logoUrl) {
        updateServiceProvider({ logoUrl });
      }
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Logo upload failed:', error.message);
    },
  });
};

/**
 * Hook to upload cover image
 */
export const useUploadCoverImage = () => {
  const queryClient = useQueryClient();
  const { serviceProvider } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => {
      if (!serviceProvider?.id) {
        throw new Error('User ID not found. Please login again.');
      }
      
      console.log('🔄 [USE PROFILE] Uploading cover image:', file.name);
      return profileApi.uploadCoverImage(serviceProvider.id, file);
    },
    onSuccess: (updatedUser: User) => {
      console.log('✅ [USE PROFILE] Cover image uploaded successfully');
      queryClient.setQueryData(['user-profile', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', updatedUser.id] });
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Cover image upload failed:', error.message);
    },
  });
};

/**
 * Hook to get payment accounts
 */
export const usePaymentAccounts = () => {
  return useQuery({
    queryKey: ['payment-accounts'],
    queryFn: profileApi.getPaymentAccounts,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to add bank account
 */
export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BankAccountData) => {
      console.log('🔄 [USE PROFILE] Adding bank account');
      return profileApi.addBankAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      console.log('✅ [USE PROFILE] Bank account added successfully');
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Add bank account failed:', error.message);
    },
  });
};

/**
 * Hook to add mobile wallet
 */
export const useAddMobileWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MobileWalletData) => {
      console.log('🔄 [USE PROFILE] Adding mobile wallet');
      return profileApi.addMobileWallet(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      console.log('✅ [USE PROFILE] Mobile wallet added successfully');
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Add mobile wallet failed:', error.message);
    },
  });
};

/**
 * Hook to set default payment account
 */
export const useSetDefaultAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => {
      console.log('🔄 [USE PROFILE] Setting default account:', accountId);
      return profileApi.setDefaultPaymentAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      console.log('✅ [USE PROFILE] Default account set successfully');
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Set default account failed:', error.message);
    },
  });
};

/**
 * Hook to delete payment account
 */
export const useDeletePaymentAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => {
      console.log('🔄 [USE PROFILE] Deleting payment account:', accountId);
      return profileApi.deletePaymentAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      console.log('✅ [USE PROFILE] Payment account deleted successfully');
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Delete payment account failed:', error.message);
    },
  });
};

/**
 * Hook to get withdrawal limits
 */
export const useWithdrawalLimits = () => {
  return useQuery({
    queryKey: ['withdrawal-limits'],
    queryFn: profileApi.getWithdrawalLimits,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update withdrawal limits
 */
export const useUpdateWithdrawalLimits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WithdrawalLimitSettings>) => {
      console.log('🔄 [USE PROFILE] Updating withdrawal limits');
      return profileApi.updateWithdrawalLimits(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-limits'] });
      console.log('✅ [USE PROFILE] Withdrawal limits updated successfully');
    },
    onError: (error: Error) => {
      console.error('❌ [USE PROFILE] Update withdrawal limits failed:', error.message);
    },
  });
};