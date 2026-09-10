import { pool } from "../db/db.js";

// Insert or replace the (question, language) template. Editing is idempotent per
// language, so upsert rather than separate create/update.
export const upsertTemplate = async ({ questionID, languageID, stub, harness }) => {
  const { rows } = await pool.query(
    `INSERT INTO question_templates(question_id, language_id, stub, harness)
     VALUES($1, $2, $3, $4)
     ON CONFLICT (question_id, language_id)
       DO UPDATE SET stub = EXCLUDED.stub, harness = EXCLUDED.harness
     RETURNING id, language_id, stub, harness`,
    [questionID, languageID, stub, harness],
  );
  return rows[0];
};

export const deleteTemplate = async ({ questionID, languageID }) => {
  const { rows } = await pool.query(
    "DELETE FROM question_templates WHERE question_id = $1 AND language_id = $2 RETURNING id",
    [questionID, languageID],
  );
  return rows[0] ?? null;
};

// Admin view: includes the harness for editing.
export const listTemplatesForAdmin = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT t.id, t.language_id, l.name AS language_name, l.slug AS language_slug,
            t.stub, t.harness
       FROM question_templates t
       JOIN languages l ON l.id = t.language_id
      WHERE t.question_id = $1
      ORDER BY l.name`,
    [questionID],
  );
  return rows;
};

// Public view: the languages a solver may pick and the stub each starts with.
// Harness is never exposed. Disabled languages are hidden.
export const listTemplatesPublic = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT t.language_id, l.name AS language_name, l.slug AS language_slug,
            l.version AS language_version, t.stub
       FROM question_templates t
       JOIN languages l ON l.id = t.language_id
      WHERE t.question_id = $1 AND l.is_enabled
      ORDER BY l.name`,
    [questionID],
  );
  return rows;
};

// Everything needed to assemble and run: the harness plus the language slug the
// worker keys its image on.
export const findTemplate = async (questionID, languageID) => {
  const { rows } = await pool.query(
    `SELECT t.stub, t.harness, l.slug AS language_slug
       FROM question_templates t
       JOIN languages l ON l.id = t.language_id
      WHERE t.question_id = $1 AND t.language_id = $2`,
    [questionID, languageID],
  );
  return rows[0] ?? null;
};

export const countTemplates = async (questionID) => {
  const { rows } = await pool.query(
    "SELECT count(*)::int AS n FROM question_templates WHERE question_id = $1",
    [questionID],
  );
  return rows[0].n;
};
