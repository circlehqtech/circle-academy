import { useLocation, useNavigate } from "react-router-dom";
import { AuthFlow } from "../pages/AuthFlow";
import { useAuth } from "../features/auth/useAuth";
import { ROLE_HOME } from "./routeConfig";

interface RedirectState {
  from?: { pathname?: string };
}

export function AuthRoute() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AuthFlow
      onComplete={(role) => {
        login(role);
        const state = location.state as RedirectState | null;
        const requestedPath = state?.from?.pathname;
        const destination = requestedPath?.startsWith(`/${role}/`)
          ? requestedPath
          : ROLE_HOME[role];
        navigate(destination, { replace: true });
      }}
    />
  );
}
