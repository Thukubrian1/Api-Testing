import { profileApi } from '../api/endpoints/profile.api';
import { useAuthStore } from '../store/slices/authSlice';

/**
 * Utility function to fetch complete user data after login
 * This should be called once after successful login to populate the full user profile
 * 
 * Why this is needed:
 * - JWT token only contains basic info (id, email, name)
 * - We need the complete User object which includes the ServiceProvider details
 * - The ServiceProvider ID from JWT is what we use to fetch the complete data
 * 
 * @returns Promise<User> - Complete user object with service provider details
 */
export const fetchCompleteUserData = async () => {
  try {
    const { serviceProvider, updateServiceProvider } = useAuthStore.getState();
    
    if (!serviceProvider?.id) {
      throw new Error('No service provider ID found in auth store. Please log in again.');
    }

    console.log('📡 [FETCH USER DATA] Starting fetch for Service Provider ID:', serviceProvider.id);
    console.log('📡 [FETCH USER DATA] Current auth store state:', {
      hasServiceProvider: !!serviceProvider,
      serviceProviderEmail: serviceProvider.email,
      serviceProviderName: serviceProvider.name,
    });

    // Fetch the complete User object using the service provider ID
    // Note: The backend GET /v1/user/:id endpoint expects the USER ID
    // But since we have the service provider ID from JWT, we use it to fetch the user
    const userData = await profileApi.getUserById(serviceProvider.id);

    console.log('✅ [FETCH USER DATA] Success! Received complete user data');
    console.log('📋 [FETCH USER DATA] User ID:', userData.id);
    console.log('📋 [FETCH USER DATA] Service Provider ID:', userData.serviceProvider?.id);
    console.log('📋 [FETCH USER DATA] Service Provider Type:', userData.serviceProvider?.serviceProviderType);

    // Update the auth store with complete service provider data
    // This ensures the auth store has all the latest information
    if (userData.serviceProvider) {
      console.log('🔄 [FETCH USER DATA] Updating auth store with complete service provider data');
      
      updateServiceProvider({
        ...userData.serviceProvider,
        // Ensure dates are in the correct format
        createdAt: userData.createdAt,
        updatedAt: userData.updateAt,
      });
      
      console.log('✅ [FETCH USER DATA] Auth store updated successfully');
    }

    return userData;
  } catch (error) {
    console.error('❌ [FETCH USER DATA] Error fetching user data:', error);
    throw error;
  }
};

/**
 * Hook version of fetchCompleteUserData for use in React components
 * This is automatically called by useFetchUserData hook
 */
export const useFetchCompleteUserData = () => {
  return {
    fetch: fetchCompleteUserData,
  };
};

/**
 * Function to call after successful login
 * This ensures the app has all the data it needs
 * 
 * Usage in your login flow:
 * 
 * ```typescript
 * // After successful login
 * const authResponse = await authApi.login(credentials);
 * 
 * // Store the auth tokens
 * setAuth(authResponse.serviceProvider, authResponse.accessToken, authResponse.refreshToken);
 * 
 * // Fetch complete user data
 * await initializeUserData();
 * 
 * // Now navigate to dashboard
 * navigate('/dashboard');
 * ```
 */
export const initializeUserData = async () => {
  try {
    console.log('🚀 [INITIALIZE] Starting user data initialization');
    
    const userData = await fetchCompleteUserData();
    
    console.log('✅ [INITIALIZE] User data initialized successfully');
    console.log('✅ [INITIALIZE] Ready to navigate to dashboard');
    
    return userData;
  } catch (error) {
    console.error('❌ [INITIALIZE] Failed to initialize user data:', error);
    throw new Error('Failed to load user profile. Please try logging in again.');
  }
};

/**
 * Debug utility to check ID consistency
 * Call this if you're experiencing ID-related issues
 */
export const debugUserIds = () => {
  const { serviceProvider } = useAuthStore.getState();
  
  console.log('🔍 [DEBUG IDs] Current state:');
  console.log('  - Service Provider ID (from JWT/Auth Store):', serviceProvider?.id);
  console.log('  - Service Provider Email:', serviceProvider?.email);
  console.log('  - Service Provider Name:', serviceProvider?.name);
  console.log('  - Service Provider Type:', serviceProvider?.serviceProviderType);
  
  if (!serviceProvider?.id) {
    console.error('❌ [DEBUG IDs] No Service Provider ID found! User needs to log in.');
    return false;
  }
  
  console.log('✅ [DEBUG IDs] Service Provider ID is available');
  return true;
};

/**
 * Example usage in a login component:
 * 
 * ```typescript
 * import { initializeUserData } from '../utils/userDataHelper';
 * import { useAuthStore } from '../store/slices/authSlice';
 * 
 * const handleLogin = async (credentials) => {
 *   try {
 *     // Step 1: Login and get tokens
 *     const authResponse = await authApi.login(credentials);
 *     
 *     // Step 2: Store auth data (this is done by setAuth)
 *     const { setAuth } = useAuthStore.getState();
 *     setAuth(
 *       authResponse.serviceProvider,
 *       authResponse.accessToken,
 *       authResponse.refreshToken
 *     );
 *     
 *     // Step 3: Fetch complete user data
 *     await initializeUserData();
 *     
 *     // Step 4: Navigate to dashboard
 *     navigate('/dashboard');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *     showToast('error', 'Login failed');
 *   }
 * };
 * ```
 */