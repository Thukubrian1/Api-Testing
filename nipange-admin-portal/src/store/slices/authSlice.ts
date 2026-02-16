import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Admin } from '../../types/auth.types';

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setAuth: (admin: Admin, token: string, refreshToken?: string) => void;
  updateAdmin: (admin: Partial<Admin>) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  admin: null,
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

      setAuth: (admin: Admin, token: string, refreshToken?: string) => {
        console.log('💾 [AUTH STORE] Setting auth state', {
          admin: admin.name,
          email: admin.email,
          id: admin.id,
          hasToken: !!token,
          tokenLength: token?.length,
          hasRefreshToken: !!refreshToken,
          refreshTokenLength: refreshToken?.length,
        });

        set({
          admin,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        console.log('✅ [AUTH STORE] Auth state updated successfully');
      },

      updateAdmin: (adminData: Partial<Admin>) => {
        const currentAdmin = get().admin;
        if (!currentAdmin) {
          console.warn('⚠️ [AUTH STORE] No current admin to update');
          return;
        }

        const updatedAdmin = { ...currentAdmin, ...adminData };

        console.log('🔄 [AUTH STORE] Updating Admin', {
          updated: Object.keys(adminData),
        });

        set({
          admin: updatedAdmin,
        });
      },

      logout: () => {
        console.log('🚪 [AUTH STORE] Logging out, clearing state');
        set(initialState);
        console.log('✅ [AUTH STORE] State cleared');
      },

      setLoading: (isLoading: boolean) => {
        console.log(`🔄 [AUTH STORE] Setting loading: ${isLoading}`);
        set({ isLoading });
      },

      setError: (error: string | null) => {
        console.log(`❌ [AUTH STORE] Setting error:`, error);
        set({ error, isLoading: false });
      },

      clearError: () => {
        const currentError = get().error;
        if (currentError) {
          console.log('🧹 [AUTH STORE] Clearing error:', currentError);
        }
        set({ error: null });
      },
    }),
    {
      name: 'ni-pange-cms-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log('💧 [AUTH STORE] Rehydrating state from localStorage');
        return (state, error) => {
          if (error) {
            console.error('❌ [AUTH STORE] Rehydration error:', error);
          } else if (state) {
            console.log('✅ [AUTH STORE] Rehydrated successfully', {
              hasAdmin: !!state.admin,
              hasToken: !!state.token,
              isAuthenticated: state.isAuthenticated,
            });
          }
        };
      },
    }
  )
);

/** Used by client.ts interceptors (outside React) to read current state */
export const getAuthState = () => useAuthStore.getState();

/**
 * Stub used by permissions.ts — returns null so all permission helpers
 * gracefully fall through to "allowed" until you wire up real permissions.
 * Replace with actual permission fetching when ready.
 */
export const getPermissions = (): null => {
  return null;
};