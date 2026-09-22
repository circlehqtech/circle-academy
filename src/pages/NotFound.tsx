import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { ROLE_HOME } from "../routes/routeConfig";
import { button } from "../styles";

export function NotFound() {
  const { role } = useAuth();
  const destination = role ? ROLE_HOME[role] : "/auth";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-accent-text">404</p>
        <h1 className="mt-2 text-4xl font-[750] tracking-[-0.035em]">
          This page does not exist
        </h1>
        <p className="mt-4 text-muted">
          The link may be outdated, or the page may belong to a different workspace.
        </p>
        <Link className={`${button} mt-7 inline-flex`} to={destination}>
          Return to HQ Learn
        </Link>
      </div>
    </main>
  );
}
