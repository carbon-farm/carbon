import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest } from '../api/client';

interface Session {
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface RegisterResult {
  userId: string;
  message: string;
  devOtp?: string; // only ever present outside production — see backend AuthService.issueOtp
}

interface RequestOtpResult {
  message: string;
  devOtp?: string;
}

interface AuthContextValue {
  session: Session | null;
  register: (mobileNumber: string, password: string, name: string) => Promise<RegisterResult>;
  verifyRegistrationOtp: (mobileNumber: string, code: string) => Promise<void>;
  login: (mobileNumber: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordResetOtp: (mobileNumber: string) => Promise<RequestOtpResult>;
  verifyPasswordResetOtp: (mobileNumber: string, code: string) => Promise<string>;
  resetPassword: (mobileNumber: string, newPassword: string, resetToken: string) => Promise<void>;
}

const STORAGE_KEY = 'agriai.session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const register = useCallback((mobileNumber: string, password: string, name: string) => {
    return apiRequest<RegisterResult>('/auth/register', {
      method: 'POST',
      body: { mobileNumber, password, name },
    });
  }, []);

  const verifyRegistrationOtp = useCallback(async (mobileNumber: string, code: string) => {
    const result = await apiRequest<{ accessToken: string; refreshToken: string }>('/auth/otp/verify', {
      method: 'POST',
      body: { mobileNumber, code, purpose: 'REGISTRATION' },
    });
    setSession({ accessToken: result.accessToken, refreshToken: result.refreshToken, role: 'FARMER' });
  }, []);

  const login = useCallback(async (mobileNumber: string, password: string) => {
    const result = await apiRequest<{ accessToken: string; refreshToken: string; role: string }>('/auth/login', {
      method: 'POST',
      body: { mobileNumber, password },
    });
    setSession({ accessToken: result.accessToken, refreshToken: result.refreshToken, role: result.role });
  }, []);

  const requestPasswordResetOtp = useCallback((mobileNumber: string) => {
    return apiRequest<RequestOtpResult>('/auth/otp/request', {
      method: 'POST',
      body: { mobileNumber, purpose: 'PASSWORD_RESET' },
    });
  }, []);

  const verifyPasswordResetOtp = useCallback(async (mobileNumber: string, code: string) => {
    const result = await apiRequest<{ verified: boolean; resetToken: string }>('/auth/otp/verify', {
      method: 'POST',
      body: { mobileNumber, code, purpose: 'PASSWORD_RESET' },
    });
    return result.resetToken;
  }, []);

  const resetPassword = useCallback(async (mobileNumber: string, newPassword: string, resetToken: string) => {
    await apiRequest('/auth/password/reset', {
      method: 'POST',
      body: { mobileNumber, newPassword, resetToken },
    });
  }, []);

  const logout = useCallback(() => {
    if (session) {
      apiRequest('/auth/logout', { method: 'POST', token: session.accessToken }).catch(() => {
        // Logging out locally still succeeds even if the network call fails —
        // the refresh token still expires naturally on the server.
      });
    }
    setSession(null);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      register,
      verifyRegistrationOtp,
      login,
      logout,
      requestPasswordResetOtp,
      verifyPasswordResetOtp,
      resetPassword,
    }),
    [
      session,
      register,
      verifyRegistrationOtp,
      login,
      logout,
      requestPasswordResetOtp,
      verifyPasswordResetOtp,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
