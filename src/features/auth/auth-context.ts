import { createContext } from "react";
import type { Role } from "../../types/lms";
import type { Account } from "../../api/types";

export interface AuthContextValue {
  isAuthenticated: boolean;
  role: Role | null;
  account: Account | null;
  accessToken: string | null;
  mustChangePassword: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
