import { useQuery } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import type { AdminUser } from "@lecode/types";

export const adminUsersKey = ["admin", "users"] as const;

export const listAdminUsersAPI = async (): Promise<AdminUser[]> => {
  const { data } = await http.get<AdminUser[]>("/admin/users");
  return data;
};

export const useAdminUsers = () =>
  useQuery({ queryKey: adminUsersKey, queryFn: listAdminUsersAPI });
