import { pool } from "../db/db.js";

// Returns null on 23505: the partial unique index means that only fires when a
// second reference solution is added for the same question.
export const createSolution = async ({
  questionID,
  languageID,
  code,
  isReference,
}) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO solutions(question_id, language_id, code, is_reference)
       VALUES($1, $2, $3, $4)
       RETURNING id, language_id, is_reference, status, created_at`,
      [questionID, languageID, code, isReference ?? false],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") return null;
    throw err;
  }
};

export const listSolutions = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT id, language_id, is_reference, metrics, status, created_at
       FROM solutions WHERE question_id = $1 ORDER BY created_at`,
    [questionID],
  );
  return rows;
};
