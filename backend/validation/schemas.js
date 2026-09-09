import * as yup from "yup";
import { Language } from "../language.js";
import { messages, MAX_SOLUTION_LENGTH } from "./messages.js";

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

export const submissionIDSchema = yup.object({
  id: yup
    .string()
    .uuid(messages.submissionID.uuid)
    .required(messages.submissionID.required),
});

// yup throws on the first failure unless abortEarly is off; we want every error.
export const validate = (schema, value) =>
  schema.validate(value, { abortEarly: false, stripUnknown: true });
