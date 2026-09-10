import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import { adminQuestionKey } from "@lecode/api/admin/questions";
import type { AdminTemplate } from "@lecode/types";

export interface UpsertTemplateInput {
  languageID: string;
  stub: string;
  harness: string;
}

export const useUpsertTemplate = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertTemplateInput) => {
      const { data } = await http.post<AdminTemplate>(
        `/admin/questions/${questionId}/templates`,
        input,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};

export const useDeleteTemplate = (questionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (languageId: string) => {
      await http.delete(`/admin/questions/${questionId}/templates/${languageId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionKey(questionId) }),
  });
};
