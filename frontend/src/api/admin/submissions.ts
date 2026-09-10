import { useQuery } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import type { AdminSubmission } from "@lecode/types";

export interface AdminSubmissionFilters {
  userId?: string;
  questionId?: string;
}

export const adminSubmissionsKey = (f: AdminSubmissionFilters) =>
  ["admin", "submissions", f.userId ?? "", f.questionId ?? ""] as const;

export const listAdminSubmissionsAPI = async (
  f: AdminSubmissionFilters,
): Promise<AdminSubmission[]> => {
  const { data } = await http.get<AdminSubmission[]>("/admin/submissions", {
    params: {
      ...(f.userId ? { userId: f.userId } : {}),
      ...(f.questionId ? { questionId: f.questionId } : {}),
    },
  });
  return data;
};

export const useAdminSubmissions = (f: AdminSubmissionFilters = {}) =>
  useQuery({
    queryKey: adminSubmissionsKey(f),
    queryFn: () => listAdminSubmissionsAPI(f),
  });
