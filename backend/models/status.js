// Mirrors the submission_status enum in Postgres.
export const Status = Object.freeze({
  not_applicable: "not_applicable",
  pending: "pending",
  accepted: "accepted",
  wrong_answer: "wrong_answer",
  compile_error: "compile_error",
  runtime_error: "runtime_error",
  timeout: "timeout",
  memory_exceeded: "memory_exceeded",
  error: "error",
});
