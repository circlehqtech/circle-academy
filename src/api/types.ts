import type { Role } from "../types/lms";

export type ApiRole = "ADMIN" | "FACILITATOR" | "STUDENT";

export interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: ApiRole;
  status?: string;
}

export interface LoginDto { email: string; password: string }
export interface RegisterDto { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string }
export interface CreateAccountDto extends RegisterDto { role: "STUDENT" | "FACILITATOR" }
export interface UpdateProfileDto { firstName?: string; lastName?: string; phoneNumber?: string }
export interface ChangePasswordDto { currentPassword: string; newPassword: string }
export interface ResetPasswordDto { token: string; password: string }

export interface LoginResult {
  accessToken: string;
  account: Account;
}

export type ApiEnvelope<T> = T | { data: T; message?: string; status?: boolean };

export function unwrapApiData<T>(value: ApiEnvelope<T>): T {
  if (value && typeof value === "object" && "data" in value) return (value as { data: T }).data;
  return value as T;
}

export function toRole(role?: string | null): Role | null {
  const normalized = role?.toLowerCase();
  return normalized === "student" || normalized === "facilitator" || normalized === "admin" ? normalized : null;
}
