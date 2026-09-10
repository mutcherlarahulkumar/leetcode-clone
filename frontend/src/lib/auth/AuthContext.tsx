import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAuthToken } from "@lecode/lib/axios";
import { Role, type AuthResponse, type User } from "@lecode/types";

const USER_STORAGE_KEY = "lecode.user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  ready: boolean; // localStorage hydrated (avoids SSR/first-paint flicker)
  setSession: (res: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // hydrate once on the client; the token itself lives in axios/localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  const setSession = useCallback((res: AuthResponse) => {
    setAuthToken(res.token);
    setUser(res.user);
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    try {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === Role.admin,
      ready,
      setSession,
      logout,
    }),
    [user, ready, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
