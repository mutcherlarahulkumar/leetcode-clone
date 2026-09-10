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
