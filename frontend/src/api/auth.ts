import { useMutation } from "@tanstack/react-query";
import { http } from "@lecode/lib/axios";
import type { AuthResponse } from "@lecode/types";
import type { LoginValues, RegisterValues } from "@lecode/validations/auth";

// The backend is stateless JWT: login/register return the user + token, and
// there is no /me endpoint. The AuthContext persists what comes back here.
export const loginAPI = async (values: LoginValues): Promise<AuthResponse> => {
  const { data } = await http.post<AuthResponse>("/auth/login", values);
  return data;
};

export const registerAPI = async (values: RegisterValues): Promise<AuthResponse> => {
  const { data } = await http.post<AuthResponse>("/auth/register", values);
  return data;
};

export const useLoginAPI = () => useMutation({ mutationFn: loginAPI });
export const useRegisterAPI = () => useMutation({ mutationFn: registerAPI });
