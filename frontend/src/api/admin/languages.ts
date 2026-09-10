import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import { languagesKey } from "@lecode/api/languages";
import type { Language } from "@lecode/types";

export interface CreateLanguageInput {
  slug: string;
  name: string;
  version: string;
}

export interface UpdateLanguageInput {
  name?: string;
  version?: string;
  isEnabled?: boolean;
}

export const useCreateLanguage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLanguageInput) => {
      const { data } = await http.post<Language>("/admin/languages", input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: languagesKey }),
  });
};

export const useUpdateLanguage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLanguageInput & { id: string }) => {
      const { data } = await http.patch<Language>(`/admin/languages/${id}`, input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: languagesKey }),
  });
};
