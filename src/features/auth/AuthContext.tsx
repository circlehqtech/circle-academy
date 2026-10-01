import { useEffect, useMemo, type ReactNode } from "react";
import type { Role } from "../../types/lms";
import { AuthContext, type AuthContextValue } from "./auth-context";
import { useAuthStore } from "../../store/authStore";
import { accountIsDisabled } from "../../api/adminAccounts";

export function AuthProvider({
  children,
  initialAuthenticated,
  initialRole,
}: {
  children: ReactNode;
  initialAuthenticated: boolean;
  initialRole: Role;
}) {
  const auth = useAuthStore();
  const setSession = useAuthStore((state) => state.setSession);
  const logout = auth.logout;
  const accountDisabled = accountIsDisabled(auth.account);

  useEffect(() => {
    if (!initialAuthenticated || auth.isAuthenticated) return;
    setSession("preview-session", {
      id: "preview-user",
      email: "preview@circlehq.co",
      firstName: "Preview",
      lastName: "User",
      role: initialRole.toUpperCase() as "ADMIN" | "FACILITATOR" | "STUDENT",
    });
  }, [auth.isAuthenticated, initialAuthenticated, initialRole, setSession]);

  useEffect(() => {
    if (accountDisabled) logout();
  }, [accountDisabled, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: auth.isAuthenticated,
      role: auth.role,
      account: auth.account,
      accessToken: auth.accessToken,
      mustChangePassword: auth.mustChangePassword,
      logout: auth.logout,
    }),
    [auth.accessToken, auth.account, auth.isAuthenticated, auth.logout, auth.mustChangePassword, auth.role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
