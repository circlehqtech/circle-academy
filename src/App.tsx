import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./app/providers/AppProviders";
import { AppRoutes } from "./routes/AppRoutes";
import type { Role } from "./types/lms";

interface AppProps {
  /** Which workspace opens first. */
  initialRole?: Role;
  /** Starting colour mode for the whole platform. */
  initialTheme?: "light" | "dark";
  /** Skip authentication when embedding a specific workspace in tests or previews. */
  initialAuthenticated?: boolean;
}

export function App({
  initialRole = "student",
  initialTheme = "light",
  initialAuthenticated = false,
}: AppProps) {
  return (
    <AppProviders
      initialAuthenticated={initialAuthenticated}
      initialRole={initialRole}
    >
      <BrowserRouter>
        <AppRoutes initialTheme={initialTheme} />
      </BrowserRouter>
    </AppProviders>
  );
}
