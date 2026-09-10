import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import type {
  AdminQuestionDetail,
  AdminQuestionListItem,
} from "@lecode/types";

export const adminQuestionsKey = ["admin", "questions"] as const;
export const adminQuestionKey = (id: string) =>
  ["admin", "questions", id] as const;

export interface CreateQuestionInput {
  title: string;
  slug?: string;
  statement: string;
  hints?: Record<string, unknown> | null;
}

export const listAdminQuestionsAPI = async (): Promise<AdminQuestionListItem[]> => {
  const { data } = await http.get<AdminQuestionListItem[]>("/admin/questions");
  return data;
};

export const getAdminQuestionAPI = async (id: string): Promise<AdminQuestionDetail> => {
  const { data } = await http.get<AdminQuestionDetail>(`/admin/questions/${id}`);
  return data;
};

export const useAdminQuestions = () =>
  useQuery({ queryKey: adminQuestionsKey, queryFn: listAdminQuestionsAPI });

export const useAdminQuestion = (id: string | undefined) =>
  useQuery({
    queryKey: adminQuestionKey(id ?? ""),
    queryFn: () => getAdminQuestionAPI(id as string),
    enabled: !!id,
  });

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      const { data } = await http.post<AdminQuestionListItem>("/admin/questions", input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQuestionsKey }),
  });
};

export const useUpdateQuestion = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CreateQuestionInput>) => {
      const { data } = await http.patch<AdminQuestionListItem>(
        `/admin/questions/${id}`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQuestionKey(id) });
      qc.invalidateQueries({ queryKey: adminQuestionsKey });
    },
  });
};

// generate + unpublish both change the question status; refetch the detail
const useStatusAction = (id: string, path: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await http.post(`/admin/questions/${id}/${path}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQuestionKey(id) });
      qc.invalidateQueries({ queryKey: adminQuestionsKey });
    },
  });
};

export const useGenerateQuestion = (id: string) => useStatusAction(id, "generate");
export const useUnpublishQuestion = (id: string) => useStatusAction(id, "unpublish");
