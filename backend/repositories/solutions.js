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

// The reference solution plus the language slug the worker keys on -- everything
// needed to enqueue a generation run.
export const findReferenceSolution = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.code, s.language_id, l.slug AS language
       FROM solutions s
       JOIN languages l ON l.id = s.language_id
      WHERE s.question_id = $1 AND s.is_reference`,
    [questionID],
  );
  return rows[0] ?? null;
};

export const deleteSolution = async ({ questionID, id }) => {
  const { rows } = await pool.query(
    "DELETE FROM solutions WHERE id = $1 AND question_id = $2 RETURNING id",
    [id, questionID],
  );
  return rows[0] ?? null;
};

// Throws 23505 if is_reference is set true while another reference exists; the
// route maps that to 409.
export const updateSolution = async ({ questionID, id, code, isReference }) => {
  const { rows } = await pool.query(
    `UPDATE solutions
        SET code = COALESCE($3, code),
            is_reference = COALESCE($4, is_reference)
      WHERE id = $1 AND question_id = $2
      RETURNING id, language_id, is_reference, status, created_at`,
    [id, questionID, code ?? null, isReference ?? null],
  );
  return rows[0] ?? null;
};

export const setSolutionResult = async ({ id, status, metrics }) => {
  const { rows } = await pool.query(
    "UPDATE solutions SET status = $2, metrics = $3 WHERE id = $1 RETURNING id, status",
    [id, status, metrics ?? null],
  );
  return rows[0] ?? null;
};
