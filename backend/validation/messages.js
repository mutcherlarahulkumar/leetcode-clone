import { Language } from "../language.js";

// Generous for a single solution file, small enough to keep junk out of the db.
export const MAX_SOLUTION_LENGTH = 100_000;

export const messages = {
  solution: {
    required: "solution is required",
    type: "solution must be a string of source code",
    blank: "solution cannot be blank",
    max: `solution cannot exceed ${MAX_SOLUTION_LENGTH} characters`,
  },
  language: {
    required: "language is required",
    oneOf: `language must be one of: ${Object.keys(Language).join(", ")}`,
  },
  submissionID: {
    required: "submission id is required",
    uuid: "submission id must be a valid uuid",
  },
};
