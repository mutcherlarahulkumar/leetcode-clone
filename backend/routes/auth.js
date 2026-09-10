import { Router } from "express";
import { createUser, findUserByEmail } from "../repositories/users.js";
import { hashPassword, verifyPassword } from "../password.js";
import { signToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validation/schemas.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await createUser({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    if (!user) {
      return res.status(409).json({ errors: ["email is already registered"] });
    }

    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not register"] });
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    // same response whether the email is unknown or the password is wrong
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ errors: ["invalid email or password"] });
    }

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: signToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not log in"] });
  }
});
