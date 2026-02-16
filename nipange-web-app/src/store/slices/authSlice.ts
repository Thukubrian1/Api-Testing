import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, User } from '../../types/auth.types';

interface AuthActions {
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Helper function to decode JWT and get expiration
const getTokenExpiration = (token: string): { exp: number; timeLeft: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = exp - now;
    
    return {
      exp,
      timeLeft: `${timeLeft}s (${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s)`,
    };
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (user: User, token: string, refreshToken?: string) => {
        console.log('🔐 [AUTH STORE] Setting authentication...');
        console.log('👤 [USER]', {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        });
        
        const tokenExp = getTokenExpiration(token);
        console.log('🎫 [ACCESS TOKEN]', {
          preview: `${token.substring(0, 20)}...`,
          length: token.length,
          expiresAt: tokenExp ? new Date(tokenExp.exp * 1000).toISOString() : 'unknown',
          timeLeft: tokenExp?.timeLeft || 'unknown',
        });
        
        if (refreshToken) {
          const refreshExp = getTokenExpiration(refreshToken);
          console.log('🔄 [REFRESH TOKEN]', {
            preview: `${refreshToken.substring(0, 20)}...`,
            length: refreshToken.length,
            expiresAt: refreshExp ? new Date(refreshExp.exp * 1000).toISOString() : 'unknown',
            timeLeft: refreshExp?.timeLeft || 'unknown',
          });
        }
        
        // Set up token expiration warning
        if (tokenExp) {
          // Extract just the seconds number from exp timestamp
          const timeLeftSeconds = tokenExp.exp - Math.floor(Date.now() / 1000);
          
          if (timeLeftSeconds > 10) {
            // Warn 10 seconds before expiration
            setTimeout(() => {
              console.warn('⚠️ [TOKEN WARNING] Access token will expire in 10 seconds!');
            }, (timeLeftSeconds - 10) * 1000);
          }
          
          // Log when token expires
          setTimeout(() => {
            console.error('⏰ [TOKEN EXPIRED] Access token has expired!');
            console.log('🔄 [NEXT STEP] Next API call will trigger token refresh');
          }, timeLeftSeconds * 1000);
        }
        
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        console.log('✅ [AUTH STORE] Authentication set successfully');
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) {
          console.warn('⚠️ [AUTH STORE] Cannot update user - no user in state');
          return;
        }

        console.log('📝 [AUTH STORE] Updating user data:', userData);
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser });
        console.log('✅ [AUTH STORE] User updated successfully');
      },

      logout: () => {
        console.log('🚪 [AUTH STORE] Logging out...');
        console.log('🗑️ [AUTH STORE] Clearing all auth state');
        
        set(initialState);
        
        console.log('✅ [AUTH STORE] Logout complete');
      },

      setLoading: (isLoading: boolean) => {
        console.log(`⏳ [AUTH STORE] Loading: ${isLoading}`);
        set({ isLoading });
      },

      setError: (error: string | null) => {
        if (error) {
          console.error('❌ [AUTH STORE] Error:', error);
        } else {
          console.log('✅ [AUTH STORE] Error cleared');
        }
        set({ error, isLoading: false });
      },

      clearError: () => {
        console.log('🧹 [AUTH STORE] Clearing error');
        set({ error: null });
      },

    }),

    {
      name: 'ni-pange-web-app-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          console.log('🔄 [AUTH STORE] Rehydrating from localStorage...');
          const tokenExp = getTokenExpiration(state.token);
          console.log('🎫 [STORED TOKEN]', {
            preview: `${state.token.substring(0, 20)}...`,
            expiresAt: tokenExp ? new Date(tokenExp.exp * 1000).toISOString() : 'unknown',
            timeLeft: tokenExp?.timeLeft || 'unknown',
            user: state.user?.email,
          });
        }
      },
    }
  )
);

export const getAuthState = () => useAuthStore.getState();