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
