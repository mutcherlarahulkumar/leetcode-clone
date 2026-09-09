// Mirrors the submission_status enum in Postgres.
export const Status = Object.freeze({
  pending: "pending",
  not_applicable: "not_applicable",
  accepted: "accepted",
  error: "error",
});
