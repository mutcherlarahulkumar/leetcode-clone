// Minimal CORS for a token-in-header API (no cookies, so no credentials mode).
// Origins come from CORS_ORIGINS (comma-separated); the frontend dev server
// defaults in. The request Origin is echoed back only when it is allowed, so
// the allowlist is real rather than a blanket "*".
const ALLOWED = (process.env.CORS_ORIGINS ?? "http://localhost:3001")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const cors = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "600");
  }

  // preflight: answer and stop, before any route or body parsing runs
  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
};
