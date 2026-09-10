import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import { adminQuestionKey } from "@lecode/api/admin/questions";
import type { AdminTestCase, TestCaseKind } from "@lecode/types";

export interface CreateTestCaseInput {
  kind: TestCaseKind;
  input: string;
  explanation?: string;
}

export const useCreateTestCase = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTestCaseInput) => {
      const { data } = await http.post<AdminTestCase>(
        `/admin/questions/${questionId}/test-cases`,
        input,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};

export const useDeleteTestCase = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testCaseId: string) => {
      await http.delete(`/admin/questions/${questionId}/test-cases/${testCaseId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};
