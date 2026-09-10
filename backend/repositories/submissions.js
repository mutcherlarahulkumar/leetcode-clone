import { pool } from "../db/db.js";
import { Status } from "../models/status.js";

// A new submission is always pending; that is a rule about the data, not
// something each caller should have to remember to pass in.
export const createSubmission = async ({
  code,
  questionID,
  languageID,
  userID,
}) => {
  const { rows } = await pool.query(
    "INSERT INTO submissions(code, status, question_id, language_id, user_id) VALUES($1, $2, $3, $4, $5) RETURNING id, status",
    [code, Status.pending, questionID, languageID, userID],
  );
  return rows[0];
};

// user_id comes back so the caller can check ownership without a second query.
export const findSubmissionByID = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, status, output, passed_count, total_count, results, question_id, user_id
       FROM submissions WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

// A user's own submissions, newest first, optionally scoped to one question.
// List view: no code or per-case results, just the verdict summary.
export const listSubmissionsByUser = async (userID, questionID) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.question_id, q.title, l.slug AS language,
            s.status, s.passed_count, s.total_count, s.created_at
       FROM submissions s
       JOIN questions q ON q.id = s.question_id
       JOIN languages l ON l.id = s.language_id
      WHERE s.user_id = $1 AND ($2::uuid IS NULL OR s.question_id = $2)
      ORDER BY s.created_at DESC
      LIMIT 200`,
    [userID, questionID ?? null],
  );
  return rows;
};

// Admin oversight: submissions across all users, newest first, with who and
// which question. Optional filters, bounded.
export const listAllSubmissions = async ({ userID, questionID } = {}) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.status, s.passed_count, s.total_count, s.created_at,
            s.user_id, u.name AS user_name, u.email AS user_email,
            s.question_id, q.title AS question_title, l.slug AS language
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       JOIN questions q ON q.id = s.question_id
       JOIN languages l ON l.id = s.language_id
      WHERE ($1::uuid IS NULL OR s.user_id = $1)
        AND ($2::uuid IS NULL OR s.question_id = $2)
      ORDER BY s.created_at DESC
      LIMIT 200`,
    [userID ?? null, questionID ?? null],
  );
  return rows;
};

// Compare-and-set on status = pending: only a still-pending row is judged, so a
// duplicate delivery (or a race between backend replicas) writes exactly once.
export const saveJudgment = async ({
  id,
  status,
  passedCount,
  totalCount,
  results,
  output,
  totalMs,
}) => {
  const { rows } = await pool.query(
    `UPDATE submissions
        SET status = $2, output = $3, passed_count = $4, total_count = $5,
            results = $6
      WHERE id = $1 AND status = $7
      RETURNING id, status, passed_count, total_count`,
    [
      id,
      status,
      output ?? null,
      passedCount,
      totalCount,
      { cases: results, totalMs },
      Status.pending,
    ],
  );
  return rows[0] ?? null;
};
