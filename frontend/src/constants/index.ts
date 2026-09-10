import { SubmissionStatus, QuestionStatus } from "@lecode/types";

// Must match the backend validation limits so the client rejects the same
// inputs the server would.
export const LIMITS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 200,
  MAX_NAME_LENGTH: 100,
  MAX_SOLUTION_LENGTH: 100_000,
  MAX_TITLE_LENGTH: 200,
  MAX_SLUG_LENGTH: 200,
  MAX_STATEMENT_LENGTH: 50_000,
  MAX_TEST_INPUT_LENGTH: 100_000,
  MAX_EXPLANATION_LENGTH: 5_000,
  MAX_LANG_SLUG_LENGTH: 20,
  MAX_LANG_NAME_LENGTH: 50,
  MAX_LANG_VERSION_LENGTH: 20,
  MIN_SAMPLE_CASES: 3,
  MAX_TEST_CASES: 50,
} as const;

export const TERMINAL_SUBMISSION_STATUSES: SubmissionStatus[] = [
  SubmissionStatus.accepted,
  SubmissionStatus.wrong_answer,
  SubmissionStatus.compile_error,
  SubmissionStatus.runtime_error,
  SubmissionStatus.timeout,
  SubmissionStatus.memory_exceeded,
  SubmissionStatus.error,
];

export const isPending = (s: SubmissionStatus) =>
  s === SubmissionStatus.pending || s === SubmissionStatus.not_applicable;

// human labels for verdicts
export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  not_applicable: "Not started",
  pending: "Pending",
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  compile_error: "Compile Error",
  runtime_error: "Runtime Error",
  timeout: "Time Limit Exceeded",
  memory_exceeded: "Memory Limit Exceeded",
  error: "Judge Error",
};

// tailwind text colour per verdict; accepted is the only "good" one
export const STATUS_TONE: Record<SubmissionStatus, "good" | "bad" | "muted"> = {
  not_applicable: "muted",
  pending: "muted",
  accepted: "good",
  wrong_answer: "bad",
  compile_error: "bad",
  runtime_error: "bad",
  timeout: "bad",
  memory_exceeded: "bad",
  error: "bad",
};

export const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
  generation_failed: "Generation Failed",
};

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  problems: "/problems",
  problem: (id: string) => `/problems/${id}`,
  submissions: "/submissions",
  admin: "/admin",
  adminQuestions: "/admin/questions",
  adminQuestionNew: "/admin/questions/new",
  adminQuestion: (id: string) => `/admin/questions/${id}`,
  adminLanguages: "/admin/languages",
  adminUsers: "/admin/users",
  adminSubmissions: "/admin/submissions",
} as const;

export const TOKEN_STORAGE_KEY = "lecode.token";

// Map a language display name to a Monaco language id / slug. The public
// languages endpoint intentionally does not expose the slug.
export const LANG_SLUG: Record<string, string> = {
  "C++": "cpp",
  TypeScript: "ts",
  Go: "go",
  Python: "python",
};

// Starter code shown in the editor when the solver has not typed anything yet,
// keyed by slug. Reads stdin and prints stdout, matching the judge harness.
export const BOILERPLATE: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // read from stdin, write your answer to stdout
    return 0;
}
`,
  ts: `// read stdin if you need it, then print your answer with console.log
const input = require("fs").readFileSync(0, "utf8").trim();

console.log();
`,
  go: `package main

import "fmt"

func main() {
    // read from stdin with fmt.Scan, print your answer
    _ = fmt.Sprint
}
`,
  python: `import sys

data = sys.stdin.read().split()
# print your answer
print()
`,
};

