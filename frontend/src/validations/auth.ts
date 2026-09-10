import * as yup from "yup";
import { LIMITS } from "@lecode/constants";

// Mirrors the backend register/login schemas so the client rejects exactly what
// the server would, with the same messages.
const email = yup
  .string()
  .trim()
  .lowercase()
  .email("email must be a valid email address")
  .required("email is required");

const password = yup
  .string()
  .min(LIMITS.MIN_PASSWORD_LENGTH, `password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`)
  .max(LIMITS.MAX_PASSWORD_LENGTH, `password cannot exceed ${LIMITS.MAX_PASSWORD_LENGTH} characters`)
  .required("password is required");

export const loginSchema = yup.object({ email, password });
export type LoginValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .max(LIMITS.MAX_NAME_LENGTH, `name cannot exceed ${LIMITS.MAX_NAME_LENGTH} characters`)
    .required("name is required"),
  email,
  password,
});
export type RegisterValues = yup.InferType<typeof registerSchema>;
