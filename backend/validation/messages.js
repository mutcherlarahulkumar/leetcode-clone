import {
  MAX_SOLUTION_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
} from "../constants/limits.js";

export const messages = {
  solution: {
    required: "solution is required",
    type: "solution must be a string of source code",
    blank: "solution cannot be blank",
    max: `solution cannot exceed ${MAX_SOLUTION_LENGTH} characters`,
  },
  languageID: {
    required: "language id is required",
    uuid: "language id must be a valid uuid",
    unknown: "unknown or unsupported language",
  },
  submissionID: {
    required: "submission id is required",
    uuid: "submission id must be a valid uuid",
  },
  name: {
    required: "name is required",
    max: `name cannot exceed ${MAX_NAME_LENGTH} characters`,
  },
  email: {
    required: "email is required",
    invalid: "email must be a valid email address",
  },
  password: {
    required: "password is required",
    min: `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    max: `password cannot exceed ${MAX_PASSWORD_LENGTH} characters`,
  },
};
