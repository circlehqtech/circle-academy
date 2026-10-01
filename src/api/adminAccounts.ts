import { useQuery } from "@tanstack/react-query";
import { asRecord, collection } from "./adapters";
import { queryKeys } from "./endpoints";
import { lmsApi } from "./lmsApi";
import type { Account, ApiRole } from "./types";

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function normalizeAccount(value: unknown): Account {
  const record = asRecord(value);
  return {
    ...record,
    id: text(record.id ?? record.accountId),
    email: text(record.email),
    firstName: text(record.firstName),
    lastName: text(record.lastName),
    phoneNumber: record.phoneNumber == null ? null : text(record.phoneNumber),
    role: text(record.role).toUpperCase() as ApiRole,
    status: text(record.status || "ACTIVE").toUpperCase(),
  };
}

export function useAdminAccounts(role: ApiRole, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.accounts(role),
    queryFn: async () => collection(await lmsApi.admin.accounts({ role }), "accounts").map(normalizeAccount),
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function accountName(account: Pick<Account, "firstName" | "lastName">) {
  return `${account.firstName} ${account.lastName}`.trim() || "Unnamed account";
}

export function accountIsDisabled(account?: Pick<Account, "status"> | null) {
  return ["DISABLED", "SUSPENDED", "INACTIVE", "DEACTIVATED", "REJECTED"].includes(account?.status?.toUpperCase() ?? "");
}

export function accountStatusLabel(account?: Pick<Account, "status"> | null) {
  if (accountIsDisabled(account)) return "Disabled";
  const value = account?.status || "ACTIVE";
  return value.toLowerCase().replace(/(^|_)(\w)/g, (_, space: string, letter: string) => `${space ? " " : ""}${letter.toUpperCase()}`);
}
