import { pool } from "../db/db.js";

// position is assigned as (max for this question) + 1, so the admin never has to
// supply one and the UNIQUE(question_id, position) constraint can't clash.
export const createTestCase = async ({
  questionID,
  kind,
  input,
  explanation,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO test_cases(question_id, kind, input, explanation, position)
     VALUES($1, $2, $3, $4,
            COALESCE((SELECT max(position) FROM test_cases WHERE question_id = $1), 0) + 1)
     RETURNING id, kind, input, explanation, position`,
    [questionID, kind, input, explanation ?? null],
  );
  return rows[0];
};

// Admin view: every case, expected_output included.
export const listTestCases = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT id, kind, input, expected_output, explanation, position
       FROM test_cases WHERE question_id = $1 ORDER BY position`,
    [questionID],
  );
  return rows;
};

// Deletes only within the given question, so a stray id from another question
// cannot be removed. Returns the deleted id, or null if it did not match.
export const deleteTestCase = async ({ questionID, id }) => {
  const { rows } = await pool.query(
    "DELETE FROM test_cases WHERE id = $1 AND question_id = $2 RETURNING id",
    [id, questionID],
  );
  return rows[0] ?? null;
};
