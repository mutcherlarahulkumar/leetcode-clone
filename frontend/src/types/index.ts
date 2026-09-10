// Mirrors the backend enums and row shapes. Kept in one place so every layer
// (api, validations, components) speaks the same vocabulary as the server.

export const Role = { user: "user", admin: "admin" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SubmissionStatus = {
  not_applicable: "not_applicable",
  pending: "pending",
  accepted: "accepted",
  wrong_answer: "wrong_answer",
  compile_error: "compile_error",
  runtime_error: "runtime_error",
  timeout: "timeout",
  memory_exceeded: "memory_exceeded",
  error: "error",
} as const;
export type SubmissionStatus =
  (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const QuestionStatus = {
  draft: "draft",
  generating: "generating",
  ready: "ready",
  generation_failed: "generation_failed",
} as const;
export type QuestionStatus =
  (typeof QuestionStatus)[keyof typeof QuestionStatus];

export const TestCaseKind = { sample: "sample", hidden: "hidden" } as const;
export type TestCaseKind = (typeof TestCaseKind)[keyof typeof TestCaseKind];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Language {
  id: string;
  name: string;
  version: string;
  is_enabled: boolean;
}

export interface QuestionSummary {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

export interface SampleCase {
  id: string;
  input: string;
  expected_output: string;
  explanation: string | null;
  position: number;
}

// Public template: the languages a solver can pick + the starter stub. The
// harness is never sent to the client.
export interface QuestionTemplatePublic {
  language_id: string;
  language_name: string;
  language_slug: string;
  language_version: string;
  stub: string;
}

export interface QuestionDetail {
  id: string;
  title: string;
  slug: string;
  statement: string;
  hints: Record<string, unknown> | null;
  created_at: string;
  samples: SampleCase[];
  templates: QuestionTemplatePublic[];
}

// one entry inside a submission's judged results
export interface CaseResult {
  id: string;
  kind: TestCaseKind;
  status: SubmissionStatus;
  input?: string; // sample only
  expected?: string; // sample only
  actual?: string; // sample only
}

export interface SubmissionResults {
  cases: CaseResult[];
  totalMs: number;
}

export interface SubmissionSummary {
  id: string;
  question_id: string;
  title: string;
  language: string;
  status: SubmissionStatus;
  passed_count: number;
  total_count: number;
  created_at: string;
}

export interface SubmissionDetail {
  id: string;
  status: SubmissionStatus;
  output: string | null;
  passed_count: number;
  total_count: number;
  results: SubmissionResults | null;
  question_id: string;
  user_id: string;
}

export interface SubmissionCreated {
  submissionID: string;
  status: SubmissionStatus;
}

// Result of a "Run" against sample cases only (nothing saved).
export interface RunCase {
  id: string;
  input: string;
  expected: string;
  actual: string;
  status: SubmissionStatus;
}

export interface RunResult {
  compiled: boolean;
  compileOutput: string;
  cases: RunCase[];
  totalMs: number;
}

// --- admin shapes ---

export interface AdminQuestionListItem {
  id: string;
  title: string;
  slug: string;
  status: QuestionStatus;
  created_at: string;
}

export interface AdminTestCase {
  id: string;
  kind: TestCaseKind;
  input: string;
  expected_output: string | null;
  explanation: string | null;
  position: number;
}

export interface AdminSolution {
  id: string;
  language_id: string;
  is_reference: boolean;
  metrics: Record<string, unknown> | null;
  status: SubmissionStatus;
  created_at: string;
}

export interface AdminTemplate {
  id: string;
  language_id: string;
  language_name: string;
  language_slug: string;
  stub: string;
  harness: string;
}

export interface AdminQuestionDetail extends AdminQuestionListItem {
  statement: string;
  hints: Record<string, unknown> | null;
  testCases: AdminTestCase[];
  solutions: AdminSolution[];
  templates: AdminTemplate[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  submission_count: number;
}

export interface AdminSubmission {
  id: string;
  status: SubmissionStatus;
  passed_count: number;
  total_count: number;
  created_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
  question_id: string;
  question_title: string;
  language: string;
}

export interface ApiError {
  errors: string[];
}
