import { useQuery } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import type { QuestionSummary, QuestionDetail } from "@lecode/types";

export const questionsKey = ["questions"] as const;
export const questionKey = (id: string) => ["questions", id] as const;

export const listQuestionsAPI = async (): Promise<QuestionSummary[]> => {
  const { data } = await http.get<QuestionSummary[]>("/questions");
  return data;
};

export const getQuestionAPI = async (id: string): Promise<QuestionDetail> => {
  const { data } = await http.get<QuestionDetail>(`/questions/${id}`);
  return data;
};

export const useQuestions = () =>
  useQuery({ queryKey: questionsKey, queryFn: listQuestionsAPI });

export const useQuestion = (id: string | undefined) =>
  useQuery({
    queryKey: questionKey(id ?? ""),
    queryFn: () => getQuestionAPI(id as string),
    enabled: !!id,
  });
