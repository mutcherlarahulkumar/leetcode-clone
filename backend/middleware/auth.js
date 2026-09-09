import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1d";

// Fail at boot, not on the first login, and never fall back to a baked-in secret.
if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export const signToken = (user) =>
  jwt.sign({ sub: user.id, name: user.name }, SECRET, {
    expiresIn: EXPIRES_IN,
  });

export const requireAuth = (req, res, next) => {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ errors: ["missing bearer token"] });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.sub, name: payload.name };
    next();
  } catch {
    // expired and forged tokens are both just "not authenticated" to the client
    res.status(401).json({ errors: ["invalid or expired token"] });
  }
};
