import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "../../types/lms";
import { AuthContext, type AuthContextValue } from "./auth-context";

const SESSION_KEY = "hq-learn-session-v1";

interface AuthSession {
  role: Role;
}

function readStoredSession(): AuthSession | null {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as Partial<AuthSession>;
    if (
      session.role === "student" ||
      session.role === "facilitator" ||
      session.role === "admin"
    ) {
      return { role: session.role };
    }
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
  }
  return null;
}

export function AuthProvider({
  children,
  initialAuthenticated,
  initialRole,
}: {
  children: ReactNode;
  initialAuthenticated: boolean;
  initialRole: Role;
}) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    initialAuthenticated ? { role: initialRole } : readStoredSession(),
  );

  const login = useCallback((role: Role) => {
    const nextSession = { role };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const switchRole = useCallback((role: Role) => {
    const nextSession = { role };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session !== null,
      role: session?.role ?? null,
      login,
      switchRole,
      logout,
    }),
    [login, logout, session, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
