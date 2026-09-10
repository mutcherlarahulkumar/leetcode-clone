import * as yup from "yup";
import { LIMITS } from "@lecode/constants";

// The editor + language picker on the solve page. questionID comes from the
// route, so it is validated separately by the page, not the form.
export const submissionSchema = yup.object({
  solution: yup
    .string()
    .max(LIMITS.MAX_SOLUTION_LENGTH, `solution cannot exceed ${LIMITS.MAX_SOLUTION_LENGTH} characters`)
    .test("not-blank", "write some code first", (v) => !!v && v.trim().length > 0)
    .required("write some code first"),
  languageID: yup.string().uuid("pick a language").required("pick a language"),
});
export type SubmissionValues = yup.InferType<typeof submissionSchema>;
