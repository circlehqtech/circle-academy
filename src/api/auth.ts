import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { endpoints, queryKeys } from "./endpoints";
import type {
  Account,
  ApiEnvelope,
  ChangePasswordDto,
  LoginDto,
  LoginResult,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from "./types";
import { unwrapApiData } from "./types";
import { useAuthStore } from "../store/authStore";
import { accountIsDisabled } from "./adminAccounts";

function parseJwt(token: string): Partial<Account> {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalized)) as Partial<Account>;
  } catch {
    return {};
  }
}

function normalizeLogin(
  value: ApiEnvelope<Record<string, unknown>>,
): LoginResult {
  const data = unwrapApiData(value);
  const accessToken = String(
    data.accessToken ?? data.access_token ?? data.token ?? "",
  );
  const rawAccount = (data.account ??
    data.user ??
    parseJwt(accessToken)) as Partial<Account>;
  const account: Account = {
    id: String(rawAccount.id ?? rawAccount.email ?? "current-user"),
    email: String(rawAccount.email ?? ""),
    firstName: String(rawAccount.firstName ?? ""),
    lastName: String(rawAccount.lastName ?? ""),
    phoneNumber: rawAccount.phoneNumber,
    role: String(rawAccount.role ?? "STUDENT").toUpperCase() as Account["role"],
    status: rawAccount.status,
  };
  if (!accessToken)
    throw new Error("The login response did not include an access token.");
  if (accountIsDisabled(account))
    throw new Error("This account is disabled. Contact an administrator to restore access.");
  return { accessToken, account };
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginDto) =>
      normalizeLogin(
        await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
          endpoints.auth.login,
          credentials,
        ),
      ),
    onSuccess: ({ accessToken, account }, credentials) => {
      setSession(accessToken, account, credentials.password === "SecurePass123!");
      queryClient.setQueryData(queryKeys.auth.me, account);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterDto) =>
      apiClient.post<unknown>(endpoints.auth.register, payload),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<unknown>(endpoints.auth.resendVerification, { email }),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.get<unknown>(endpoints.auth.verifyEmail, { token }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<unknown>(endpoints.auth.forgotPassword, { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordDto) =>
      apiClient.post<unknown>(endpoints.auth.resetPassword, payload),
  });
}

export function useCurrentAccount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () =>
      unwrapApiData(
        await apiClient.get<ApiEnvelope<Account>>(endpoints.auth.me),
      ),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateAccount = useAuthStore((state) => state.updateAccount);
  return useMutation({
    mutationFn: async (payload: UpdateProfileDto) => {
      await apiClient.patch<unknown>(endpoints.auth.me, payload);
      return unwrapApiData(await apiClient.get<ApiEnvelope<Account>>(endpoints.auth.me));
    },
    onSuccess: (account) => {
      updateAccount(account);
      queryClient.setQueryData(queryKeys.auth.me, account);
    },
  });
}

export function useChangePassword() {
  const clearPasswordChangeRequirement = useAuthStore((state) => state.clearPasswordChangeRequirement);
  return useMutation({
    mutationFn: (payload: ChangePasswordDto) =>
      apiClient.post<unknown>(endpoints.auth.changePassword, payload),
    onSuccess: clearPasswordChangeRequirement,
  });
}
