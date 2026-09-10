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

const slugRule = "must be lowercase letters, digits and hyphens";

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
  questionID: {
    required: "question id is required",
    uuid: "question id must be a valid uuid",
    unknown: "question not found",
    notReady: "question is not open for submissions",
  },
  title: {
    required: "title is required",
    max: `title cannot exceed ${MAX_TITLE_LENGTH} characters`,
  },
  slug: {
    format: `slug ${slugRule}`,
    max: `slug cannot exceed ${MAX_SLUG_LENGTH} characters`,
  },
  statement: {
    required: "statement is required",
    max: `statement cannot exceed ${MAX_STATEMENT_LENGTH} characters`,
  },
  hints: { type: "hints must be an object" },
  testCase: {
    kind: "kind must be 'sample' or 'hidden'",
    input: "input is required",
    inputMax: `input cannot exceed ${MAX_TEST_INPUT_LENGTH} characters`,
    explanationRequired: "a sample case needs an explanation",
    explanationMax: `explanation cannot exceed ${MAX_EXPLANATION_LENGTH} characters`,
  },
  code: {
    required: "code is required",
    blank: "code cannot be blank",
    max: `code cannot exceed ${MAX_SOLUTION_LENGTH} characters`,
  },
  language: {
    slugRequired: "slug is required",
    slugFormat: `slug ${slugRule}`,
    slugMax: `slug cannot exceed ${MAX_LANG_SLUG_LENGTH} characters`,
    nameRequired: "name is required",
    nameMax: `name cannot exceed ${MAX_LANG_NAME_LENGTH} characters`,
    versionRequired: "version is required",
    versionMax: `version cannot exceed ${MAX_LANG_VERSION_LENGTH} characters`,
  },
};
