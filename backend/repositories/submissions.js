import { pool } from "../db/db.js";
import { Status } from "../models/status.js";

// A new submission is always pending; that is a rule about the data, not
// something each caller should have to remember to pass in.
export const createSubmission = async ({
  code,
  questionID,
  language,
  userID,
}) => {
  const { rows } = await pool.query(
    "INSERT INTO submissions(code, status, question_id, language, user_id) VALUES($1, $2, $3, $4, $5) RETURNING id, status",
    [code, Status.pending, questionID, language, userID],
  );
  return rows[0];
};

// user_id comes back so the caller can check ownership without a second query.
export const findSubmissionByID = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, status, output, user_id FROM submissions WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
};

export const saveSubmissionResult = async ({ id, status, output }) => {
  const { rows } = await pool.query(
    "UPDATE submissions SET status = $1, output = $2 WHERE id = $3 RETURNING id, status, output",
    [status, output, id],
  );
  return rows[0] ?? null;
};
