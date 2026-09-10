import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import { adminQuestionKey } from "@lecode/api/admin/questions";
import type { AdminSolution } from "@lecode/types";

export interface CreateSolutionInput {
  languageID: string;
  code: string;
  isReference: boolean;
}

export const useCreateSolution = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSolutionInput) => {
      const { data } = await http.post<AdminSolution>(
        `/admin/questions/${questionId}/solutions`,
        input,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};

export const useUpdateSolution = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      solutionId,
      ...input
    }: { solutionId: string; code: string; isReference?: boolean }) => {
      const { data } = await http.patch<AdminSolution>(
        `/admin/questions/${questionId}/solutions/${solutionId}`,
        input,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};

export const useDeleteSolution = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (solutionId: string) => {
      await http.delete(`/admin/questions/${questionId}/solutions/${solutionId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};
