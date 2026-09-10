import * as yup from "yup";
import { LIMITS } from "@lecode/constants";
import { TestCaseKind } from "@lecode/types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const notBlank = (v: string | undefined) => !!v && v.trim().length > 0;

export const createQuestionSchema = yup.object({
  title: yup
    .string()
    .trim()
    .max(LIMITS.MAX_TITLE_LENGTH, `title cannot exceed ${LIMITS.MAX_TITLE_LENGTH} characters`)
    .required("title is required"),
  slug: yup
    .string()
    .trim()
    .matches(SLUG_RE, { message: "slug must be lowercase letters, digits and hyphens", excludeEmptyString: true })
    .max(LIMITS.MAX_SLUG_LENGTH, `slug cannot exceed ${LIMITS.MAX_SLUG_LENGTH} characters`),
  statement: yup
    .string()
    .max(LIMITS.MAX_STATEMENT_LENGTH, `statement cannot exceed ${LIMITS.MAX_STATEMENT_LENGTH} characters`)
    .test("not-blank", "statement is required", notBlank)
    .required("statement is required"),
});
export type CreateQuestionValues = yup.InferType<typeof createQuestionSchema>;

export const testCaseSchema = yup.object({
  kind: yup
    .mixed<TestCaseKind>()
    .oneOf(Object.values(TestCaseKind), "kind must be sample or hidden")
    .required("kind is required"),
  input: yup
    .string()
    .max(LIMITS.MAX_TEST_INPUT_LENGTH, `input cannot exceed ${LIMITS.MAX_TEST_INPUT_LENGTH} characters`)
    .required("input is required"),
  explanation: yup
    .string()
    .max(LIMITS.MAX_EXPLANATION_LENGTH, `explanation cannot exceed ${LIMITS.MAX_EXPLANATION_LENGTH} characters`)
    .when("kind", {
      is: TestCaseKind.sample,
      then: (s) => s.required("a sample case needs an explanation"),
      otherwise: (s) => s.optional(),
    }),
});
export type TestCaseValues = yup.InferType<typeof testCaseSchema>;

export const solutionSchema = yup.object({
  languageID: yup.string().uuid("pick a language").required("pick a language"),
  code: yup
    .string()
    .max(LIMITS.MAX_SOLUTION_LENGTH, `code cannot exceed ${LIMITS.MAX_SOLUTION_LENGTH} characters`)
    .test("not-blank", "code is required", notBlank)
    .required("code is required"),
  isReference: yup.boolean().required(),
});
export type SolutionValues = yup.InferType<typeof solutionSchema>;

export const languageSchema = yup.object({
  slug: yup
    .string()
    .trim()
    .matches(SLUG_RE, "slug must be lowercase letters, digits and hyphens")
    .max(LIMITS.MAX_LANG_SLUG_LENGTH, `slug cannot exceed ${LIMITS.MAX_LANG_SLUG_LENGTH} characters`)
    .required("slug is required"),
  name: yup
    .string()
    .trim()
    .max(LIMITS.MAX_LANG_NAME_LENGTH, `name cannot exceed ${LIMITS.MAX_LANG_NAME_LENGTH} characters`)
    .required("name is required"),
  version: yup
    .string()
    .trim()
    .max(LIMITS.MAX_LANG_VERSION_LENGTH, `version cannot exceed ${LIMITS.MAX_LANG_VERSION_LENGTH} characters`)
    .required("version is required"),
});
export type LanguageValues = yup.InferType<typeof languageSchema>;
