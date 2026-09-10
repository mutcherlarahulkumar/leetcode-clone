import { useMutation, useQuery } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import { isPending } from "@lecode/constants";
import type {
  SubmissionCreated,
  SubmissionDetail,
  SubmissionSummary,
} from "@lecode/types";

export const mySubmissionsKey = (questionId?: string) =>
  ["submissions", "mine", questionId ?? "all"] as const;
export const submissionKey = (id: string) => ["submissions", id] as const;

export interface CreateSubmissionInput {
  solution: string;
  languageID: string;
  questionID: string;
}

export const createSubmissionAPI = async (
  input: CreateSubmissionInput,
): Promise<SubmissionCreated> => {
  const { data } = await http.post<SubmissionCreated>("/submissions", input);
  return data;
};

export const getSubmissionAPI = async (id: string): Promise<SubmissionDetail> => {
  const { data } = await http.get<SubmissionDetail>(`/submissions/${id}`);
  return data;
};

export const listMySubmissionsAPI = async (
  questionId?: string,
): Promise<SubmissionSummary[]> => {
  const { data } = await http.get<SubmissionSummary[]>("/submissions", {
    params: questionId ? { questionId } : undefined,
  });
  return data;
};

export const useCreateSubmission = () =>
  useMutation({ mutationFn: createSubmissionAPI });

export const useMySubmissions = (questionId?: string) =>
  useQuery({
    queryKey: mySubmissionsKey(questionId),
    queryFn: () => listMySubmissionsAPI(questionId),
  });

// Polls while the verdict is still pending; stops the moment it is terminal.
export const useSubmission = (id: string | undefined) =>
  useQuery({
    queryKey: submissionKey(id ?? ""),
    queryFn: () => getSubmissionAPI(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && isPending(data.status) ? 1500 : false;
    },
  });
