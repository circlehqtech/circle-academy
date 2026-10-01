import type { ReactNode } from "react";
import { PlayerProvider } from "../../contexts/PlayerContext";
import { ToastProvider } from "../../contexts/ToastContext";
import type { Role } from "../../types/lms";
import { AuthProvider } from "../../features/auth/AuthContext";
import { WorkspaceProvider } from "../../features/workspace/WorkspaceContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (count, error) => ("status" in error && error.status === 401 ? false : count < 2) },
      mutations: { retry: false },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider
          initialAuthenticated={initialAuthenticated}
          initialRole={initialRole}
        >
          <WorkspaceProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
