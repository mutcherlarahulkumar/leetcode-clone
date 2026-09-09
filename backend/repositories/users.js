import { pool } from "../db/db.js";

// Returns null when the email is taken, so routes never have to know that
// 23505 is postgres for "unique violation".
export const createUser = async ({ name, email, passwordHash }) => {
  try {
    const { rows } = await pool.query(
      "INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") return null;
    throw err;
  }
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  return rows[0] ?? null;
};
