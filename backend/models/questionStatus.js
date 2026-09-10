// Mirrors the question_status enum in Postgres. A question only accepts
// submissions once its reference solution has produced every expected output.
export const QuestionStatus = Object.freeze({
  draft: "draft",
  generating: "generating",
  ready: "ready",
  generation_failed: "generation_failed",
});
