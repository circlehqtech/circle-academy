import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { ROLE_HOME } from "./routeConfig";
import type { Role } from "../types/lms";

export function AuthGuard() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestGuard() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }

  return <Outlet />;
}

export function RoleGuard({ allowedRole }: { allowedRole: Role }) {
  const { role } = useAuth();

  if (!role) return <Navigate to="/auth" replace />;
  if (role !== allowedRole) return <Navigate to={ROLE_HOME[role]} replace />;

  return <Outlet />;
}
