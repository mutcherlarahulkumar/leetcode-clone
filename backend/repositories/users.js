import { pool } from "../db/db.js";

// Returns null when the email is taken, so routes never have to know that
// 23505 is postgres for "unique violation".
export const createUser = async ({ name, email, passwordHash }) => {
  try {
    const { rows } = await pool.query(
      "INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id, name, email, role",
      [name, email, passwordHash],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") return null;
    throw err;
  }
};

// Admin oversight: everyone, with how many submissions each has made.
export const listUsers = async () => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role,
            count(s.id)::int AS submission_count
       FROM users u
       LEFT JOIN submissions s ON s.user_id = u.id
      GROUP BY u.id
      ORDER BY u.name`,
  );
  return rows;
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [email],
  );
  return rows[0] ?? null;
};
