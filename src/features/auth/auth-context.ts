import { createContext } from "react";
import type { Role } from "../../types/lms";

export interface AuthContextValue {
  isAuthenticated: boolean;
  role: Role | null;
  login: (role: Role) => void;
  switchRole: (role: Role) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
