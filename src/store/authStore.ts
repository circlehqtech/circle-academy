import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Account } from "../api/types";
import { toRole } from "../api/types";
import type { Role } from "../types/lms";

interface AuthState {
  accessToken: string | null;
  account: Account | null;
  isAuthenticated: boolean;
  role: Role | null;
  mustChangePassword: boolean;
  setSession: (accessToken: string, account: Account, mustChangePassword?: boolean) => void;
  updateAccount: (account: Account) => void;
  clearPasswordChangeRequirement: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      account: null,
      isAuthenticated: false,
      role: null,
      mustChangePassword: false,
      setSession: (accessToken, account, mustChangePassword = false) => set({ accessToken, account, isAuthenticated: true, role: toRole(account.role), mustChangePassword }),
      updateAccount: (account) => set({ account, role: toRole(account.role) }),
      clearPasswordChangeRequirement: () => set({ mustChangePassword: false }),
      logout: () => set({ accessToken: null, account: null, isAuthenticated: false, role: null, mustChangePassword: false }),
    }),
    {
      name: "hq-learn-auth-v2",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ accessToken, account, isAuthenticated, role, mustChangePassword }) => ({ accessToken, account, isAuthenticated, role, mustChangePassword }),
    },
  ),
);
