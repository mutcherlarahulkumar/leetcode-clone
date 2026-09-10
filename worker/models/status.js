// Only the outcomes a worker can produce. Backend owns the full enum.
export const Status = Object.freeze({
  accepted: "accepted",
  wrong_answer: "wrong_answer",
  compile_error: "compile_error",
  runtime_error: "runtime_error",
  timeout: "timeout",
  memory_exceeded: "memory_exceeded",
  error: "error",
});
