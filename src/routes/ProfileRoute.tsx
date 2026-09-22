import { Navigate } from "react-router-dom";
import { ProfileSettings } from "../pages/ProfileSettings";
import { useAuth } from "../features/auth/useAuth";

export function ProfileRoute() {
  const { role, logout } = useAuth();
  if (!role) return <Navigate to="/auth" replace />;
  return <ProfileSettings role={role} onLogout={logout} />;
}
