import { Router } from "express";
import { pool } from "../db/db.js";
import { hashPassword, verifyPassword } from "../password.js";
import { signToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validation/schemas.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const dbRes = await pool.query(
      "INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id, name, email",
      [name, email, await hashPassword(password)],
    );

    const user = dbRes.rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    // 23505 = unique violation on the email index
    if (err.code === "23505") {
      return res.status(409).json({ errors: ["email is already registered"] });
    }
    console.error(err);
    res.status(500).json({ errors: ["could not register"] });
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const dbRes = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email],
    );

    const user = dbRes.rows[0];
    // same response whether the email is unknown or the password is wrong
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ errors: ["invalid email or password"] });
    }

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      token: signToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not log in"] });
  }
});
