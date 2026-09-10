import { pool } from "../db/db.js";

// Everything, disabled included: the UI shows the full list and greys out what
// is unavailable, rather than a language silently disappearing. slug stays out
// of this -- it is a worker detail, not something a client needs.
export const findAllLanguages = async () => {
  const { rows } = await pool.query(
    "SELECT id, name, version, is_enabled FROM languages ORDER BY name",
  );
  return rows;
};

export const findLanguageByID = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, slug, name, is_enabled FROM languages WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
};

// Created disabled: the row exists so it can be configured, but it must not be
// selectable until the matching worker image has been added by hand. Returns
// null when the slug is taken.
export const createLanguage = async ({ slug, name, version }) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO languages(slug, name, version, is_enabled)
       VALUES($1, $2, $3, false)
       RETURNING id, slug, name, version, is_enabled`,
      [slug, name, version],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") return null;
    throw err;
  }
};

// slug is intentionally not updatable -- it is the contract with the worker.
export const updateLanguage = async ({ id, name, version, isEnabled }) => {
  const { rows } = await pool.query(
    `UPDATE languages
        SET name = COALESCE($2, name),
            version = COALESCE($3, version),
            is_enabled = COALESCE($4, is_enabled)
      WHERE id = $1
      RETURNING id, slug, name, version, is_enabled`,
    [id, name ?? null, version ?? null, isEnabled ?? null],
  );
  return rows[0] ?? null;
};
