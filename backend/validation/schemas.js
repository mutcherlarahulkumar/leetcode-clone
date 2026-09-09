import * as yup from "yup";
import { Language } from "../models/language.js";
import {
  MAX_SOLUTION_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
} from "../constants/limits.js";
import { messages } from "./messages.js";

export const createSubmissionSchema = yup.object({
  // Source code: store it byte for byte. No trim, no coercion, no casing rules --
  // indentation and trailing newlines are part of the program.
  solution: yup
    .string()
    .strict(true)
    .typeError(messages.solution.type)
    .required(messages.solution.required)
    .max(MAX_SOLUTION_LENGTH, messages.solution.max)
    // empty/missing is .required()'s job, don't report it twice
    .test(
      "not-blank",
      messages.solution.blank,
      (value) => !value || value.trim().length > 0,
    ),
  language: yup
    .string()
    .strict(true)
    .typeError(messages.language.oneOf)
    .oneOf(Object.keys(Language), messages.language.oneOf)
    .required(messages.language.required),
});

// Passwords are not trimmed -- leading/trailing spaces are the user's choice.
const password = yup
  .string()
  .strict(true)
  .min(MIN_PASSWORD_LENGTH, messages.password.min)
  .max(MAX_PASSWORD_LENGTH, messages.password.max)
  .required(messages.password.required);

// lowercased so "A@b.com" and "a@b.com" are the same account
const email = yup
  .string()
  .trim()
  .lowercase()
  .email(messages.email.invalid)
  .required(messages.email.required);

export const registerSchema = yup.object({
  // not strict: trim() has to transform here, strict would reject " Rahul " outright
  name: yup
    .string()
    .trim()
    .max(MAX_NAME_LENGTH, messages.name.max)
    .required(messages.name.required),
  email,
  password,
});

export const loginSchema = yup.object({ email, password });

export const submissionIDSchema = yup.object({
  id: yup
    .string()
    .uuid(messages.submissionID.uuid)
    .required(messages.submissionID.required),
});

// yup throws on the first failure unless abortEarly is off; we want every error.
export const validate = (schema, value) =>
  schema.validate(value, { abortEarly: false, stripUnknown: true });
