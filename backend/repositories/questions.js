import { pool } from "../db/db.js";

// Returns null when the slug is taken (23505), so the route need not know the
// pg error code.
export const createQuestion = async ({
  title,
  slug,
  statement,
  hints,
  createdBy,
}) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO questions(title, slug, statement, hints, created_by)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, title, slug, status, created_at`,
      [title, slug, statement, hints ?? null, createdBy],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") return null;
    throw err;
  }
};

// COALESCE so a partial update only touches the fields that were sent. Throws on
// a slug clash (23505) for the route to map to 409; returns null if not found.
export const updateQuestion = async ({ id, title, slug, statement, hints }) => {
  const { rows } = await pool.query(
    `UPDATE questions
        SET title = COALESCE($2, title),
            slug = COALESCE($3, slug),
            statement = COALESCE($4, statement),
            hints = COALESCE($5, hints)
      WHERE id = $1
      RETURNING id, title, slug, status, created_at`,
    [id, title ?? null, slug ?? null, statement ?? null, hints ?? null],
  );
  return rows[0] ?? null;
};

export const listQuestions = async () => {
  const { rows } = await pool.query(
    "SELECT id, title, slug, status, created_at FROM questions ORDER BY created_at DESC",
  );
  return rows;
};

export const findQuestionByID = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, title, slug, statement, hints, status, created_at FROM questions WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
};

export const setQuestionStatus = async (id, status) => {
  const { rows } = await pool.query(
    "UPDATE questions SET status = $2 WHERE id = $1 RETURNING id, status",
    [id, status],
  );
  return rows[0] ?? null;
};
