import { useQuery } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import type { Language } from "@lecode/types";

export const languagesKey = ["languages"] as const;

export const listLanguagesAPI = async (): Promise<Language[]> => {
  const { data } = await http.get<Language[]>("/languages");
  return data;
};

export const useLanguages = () =>
  useQuery({ queryKey: languagesKey, queryFn: listLanguagesAPI, staleTime: 60_000 });
