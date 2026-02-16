import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';
import { useToast } from '../../contexts/ToastContext';

interface JwtPayload {
  sub?: string;
  email: string;
  name: string;
  phone?: string;
  picture?: string;
  avatar?: string;
  email_verified?: boolean;
  iat?: number;
}

/**
 * Silent OAuth Callback Page
 * After user selects Google account, this processes auth in background with NO UI
 * User flow: Click "Sign in with Google" → Google account picker → Instant redirect to app
 */
export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, setError } = useAuthStore();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const handleOAuthCallback = () => {
      try {
        // Extract parameters from URL
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');
        
        // Handle error from backend
        if (error) {
          const message = error === 'access_denied' 
            ? 'Authentication cancelled' 
            : `Authentication error: ${error}`;
          
          setError(message);
          showError(message);
          navigate('/login', { replace: true });
          return;
        }

        // Validate tokens
        if (!accessToken || !refreshToken) {
          const message = 'Authentication failed: No tokens received';
          setError(message);
          showError(message);
          navigate('/login', { replace: true });
          return;
        }

        // Decode the access token to extract user info
        const tokenPayload = decodeToken(accessToken);

        if (!tokenPayload) {
          const message = 'Invalid token format';
          setError(message);
          showError(message);
          navigate('/login', { replace: true });
          return;
        }

        // Extract user data from JWT payload
        const user = {
          id: tokenPayload.sub || 'unknown',
          email: tokenPayload.email,
          name: tokenPayload.name,
          phone: tokenPayload.phone || undefined,
          avatar: tokenPayload.picture || tokenPayload.avatar || undefined,
          isVerified: tokenPayload.email_verified !== false,
          createdAt: tokenPayload.iat 
            ? new Date(tokenPayload.iat * 1000).toISOString() 
            : new Date().toISOString(),
          updatedAt: tokenPayload.iat 
            ? new Date(tokenPayload.iat * 1000).toISOString() 
            : new Date().toISOString(),
        };

        // Store auth data (synchronous operation)
        setAuth(user, accessToken, refreshToken);
        

        // Instant redirect to home
        navigate('/', { replace: true });
        
      } catch (error) {
        const message = error instanceof Error 
          ? error.message 
          : 'Authentication failed. Please try again.';
        
        setError(message);
        showError(message);
        navigate('/login', { replace: true });
      }
    };

    // Execute immediately - no async needed
    handleOAuthCallback();
  }, [searchParams, navigate, setAuth, setError, success, showError]);

  // Return null - completely invisible to user
  // User goes: Google account selection → Instant redirect (no loading screen)
  return null;
};

/**
 * Helper function to decode JWT token
 */
function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}