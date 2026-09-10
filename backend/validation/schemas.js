import * as yup from "yup";
import {
  MAX_SOLUTION_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_SLUG_LENGTH,
  MAX_STATEMENT_LENGTH,
  MAX_TEST_INPUT_LENGTH,
  MAX_EXPLANATION_LENGTH,
  MAX_LANG_SLUG_LENGTH,
  MAX_LANG_NAME_LENGTH,
  MAX_LANG_VERSION_LENGTH,
} from "../constants/limits.js";
import { messages } from "./messages.js";
import { TestCaseKind } from "../models/testCaseKind.js";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Source code: byte for byte, no coercion, no trim -- reused for solutions too.
const sourceCode = (m) =>
  yup
    .string()
    .strict(true)
    .typeError(m.type ?? m.required)
    .required(m.required)
    .max(MAX_SOLUTION_LENGTH, m.max)
    .test("not-blank", m.blank, (v) => !v || v.trim().length > 0);

const languageIDField = yup
  .string()
  .uuid(messages.languageID.uuid)
  .required(messages.languageID.required);

export const createSubmissionSchema = yup.object({
  solution: sourceCode(messages.solution),
  languageID: languageIDField,
  questionID: yup
    .string()
    .uuid(messages.questionID.uuid)
    .required(messages.questionID.required),
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

// --- admin: questions ---

// slug is optional on create; the route derives it from the title when absent.
const slug = yup
  .string()
  .strict(true)
  .matches(SLUG_RE, messages.slug.format)
  .max(MAX_SLUG_LENGTH, messages.slug.max);

// hints is free-form jsonb. yup.object() with a shape would strip its keys under
// stripUnknown, so it is validated as a plain object with mixed().
const hints = yup
  .mixed()
  .test(
    "is-object",
    messages.hints.type,
    (v) => v == null || (typeof v === "object" && !Array.isArray(v)),
  );

export const createQuestionSchema = yup.object({
  title: yup
    .string()
    .trim()
    .max(MAX_TITLE_LENGTH, messages.title.max)
    .required(messages.title.required),
  slug: slug.notRequired(),
  statement: yup
    .string()
    .strict(true)
    .max(MAX_STATEMENT_LENGTH, messages.statement.max)
    .required(messages.statement.required)
    .test("not-blank", messages.statement.required, (v) => !v || v.trim().length > 0),
  hints,
});

// every field optional -- a partial edit
export const updateQuestionSchema = yup.object({
  title: yup.string().trim().max(MAX_TITLE_LENGTH, messages.title.max),
  slug: slug.notRequired(),
  statement: yup
    .string()
    .strict(true)
    .max(MAX_STATEMENT_LENGTH, messages.statement.max)
    .test("not-blank", messages.statement.required, (v) => v == null || v.trim().length > 0),
  hints,
});

// --- admin: test cases ---

export const createTestCaseSchema = yup.object({
  kind: yup
    .string()
    .oneOf(Object.values(TestCaseKind), messages.testCase.kind)
    .required(messages.testCase.kind),
  input: yup
    .string()
    .strict(true)
    .max(MAX_TEST_INPUT_LENGTH, messages.testCase.inputMax)
    .required(messages.testCase.input),
  // required for sample cases, ignored otherwise
  explanation: yup
    .string()
    .strict(true)
    .max(MAX_EXPLANATION_LENGTH, messages.testCase.explanationMax)
    .when("kind", {
      is: TestCaseKind.sample,
      then: (s) => s.required(messages.testCase.explanationRequired),
      otherwise: (s) => s.notRequired(),
    }),
});

// --- admin: solutions ---

export const createSolutionSchema = yup.object({
  languageID: languageIDField,
  code: sourceCode(messages.code),
  isReference: yup.boolean().default(false),
});

// --- admin: languages ---

export const createLanguageSchema = yup.object({
  slug: yup
    .string()
    .strict(true)
    .matches(SLUG_RE, messages.language.slugFormat)
    .max(MAX_LANG_SLUG_LENGTH, messages.language.slugMax)
    .required(messages.language.slugRequired),
  name: yup
    .string()
    .trim()
    .max(MAX_LANG_NAME_LENGTH, messages.language.nameMax)
    .required(messages.language.nameRequired),
  version: yup
    .string()
    .trim()
    .max(MAX_LANG_VERSION_LENGTH, messages.language.versionMax)
    .required(messages.language.versionRequired),
});

export const updateLanguageSchema = yup.object({
  name: yup.string().trim().max(MAX_LANG_NAME_LENGTH, messages.language.nameMax),
  version: yup
    .string()
    .trim()
    .max(MAX_LANG_VERSION_LENGTH, messages.language.versionMax),
  isEnabled: yup.boolean(),
});

// --- param schemas ---

export const idParamSchema = yup.object({
  id: yup.string().uuid("id must be a valid uuid").required(),
});

export const testCaseParamSchema = yup.object({
  id: yup.string().uuid("id must be a valid uuid").required(),
  tcId: yup.string().uuid("test case id must be a valid uuid").required(),
});

// yup throws on the first failure unless abortEarly is off; we want every error.
export const validate = (schema, value) =>
  schema.validate(value, { abortEarly: false, stripUnknown: true });
