import type { ReactNode } from "react";
import { PlayerProvider } from "../../contexts/PlayerContext";
import { ToastProvider } from "../../contexts/ToastContext";
import type { Role } from "../../types/lms";
import { AuthProvider } from "../../features/auth/AuthContext";
import { WorkspaceProvider } from "../../features/workspace/WorkspaceContext";

interface AppProvidersProps {
  children: ReactNode;
  initialAuthenticated: boolean;
  initialRole: Role;
}

export function AppProviders({
  children,
  initialAuthenticated,
  initialRole,
}: AppProvidersProps) {
  return (
    <ToastProvider>
      <PlayerProvider>
        <AuthProvider
          initialAuthenticated={initialAuthenticated}
          initialRole={initialRole}
        >
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </PlayerProvider>
    </ToastProvider>
  );
}
