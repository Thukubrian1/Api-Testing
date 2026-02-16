import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ServiceProvider } from '../../types/profile.types';

export interface AuthState {
  serviceProvider: ServiceProvider | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setAuth: (serviceProvider: ServiceProvider, token: string, refreshToken?: string) => void;
  updateServiceProvider: (serviceProvider: Partial<ServiceProvider>) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  serviceProvider: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (serviceProvider: ServiceProvider, token: string, refreshToken?: string) => {
        console.log('ðŸ’¾ [AUTH STORE] Setting auth state', {
          serviceProvider: serviceProvider.name,
          email: serviceProvider.email,
          id: serviceProvider.id,
          hasToken: !!token,
          tokenLength: token?.length,
          hasRefreshToken: !!refreshToken,
          refreshTokenLength: refreshToken?.length,
        });
        
        set({
          serviceProvider,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        console.log('âœ… [AUTH STORE] Auth state updated successfully');
      },

      updateServiceProvider: (serviceProviderData: Partial<ServiceProvider>) => {
        const currentServiceProvider = get().serviceProvider;
        if (!currentServiceProvider) {
          console.warn('âš ï¸ [AUTH STORE] No current service provider to update');
          return;
        }

        const updatedServiceProvider = { 
          ...currentServiceProvider, 
          ...serviceProviderData 
        };
        
        console.log('ðŸ”„ [AUTH STORE] Updating service provider', {
          updated: Object.keys(serviceProviderData),
        });
        
        set({
          serviceProvider: updatedServiceProvider,
        });
      },

      logout: () => {
        console.log('ðŸšª [AUTH STORE] Logging out, clearing state');
        set(initialState);
        console.log('âœ… [AUTH STORE] State cleared');
      },

      setLoading: (isLoading: boolean) => {
        console.log(`ðŸ”„ [AUTH STORE] Setting loading: ${isLoading}`);
        set({ isLoading });
      },

      setError: (error: string | null) => {
        console.log(`âŒ [AUTH STORE] Setting error:`, error);
        set({ error, isLoading: false });
      },

      clearError: () => {
        const currentError = get().error;
        if (currentError) {
          console.log('ðŸ§¹ [AUTH STORE] Clearing error:', currentError);
        }
        set({ error: null });
      },
    }),
    {
      name: 'ni-pange-service-provider-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        serviceProvider: state.serviceProvider,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log('ðŸ’§ [AUTH STORE] Rehydrating state from localStorage');
        return (state, error) => {
          if (error) {
            console.error('âŒ [AUTH STORE] Rehydration error:', error);
          } else if (state) {
            console.log('âœ… [AUTH STORE] Rehydrated successfully', {
              hasServiceProvider: !!state.serviceProvider,
              hasToken: !!state.token,
              isAuthenticated: state.isAuthenticated,
            });
          }
        };
      },
    }
  )
);

export const getAuthState = () => useAuthStore.getState();