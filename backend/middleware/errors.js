import { ERRORS } from "../constants/errors.js";

export const notFound = (req, res) => {
  res.status(404).json({ errors: [ERRORS.notFound] });
};

// Last middleware in the stack. Express's built-in handler replies with the
// stack trace, so anything that reaches it raw leaks internals to the client.
// Must keep all four arguments or express treats it as normal middleware.
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // a response already started streaming, express has to finish it
  if (res.headersSent) return next(err);

  // body-parser: unparseable json, and a body over the express.json limit
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ errors: [ERRORS.malformedJSON] });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ errors: [ERRORS.payloadTooLarge] });
  }

  // never err.message here -- that is where driver and library detail hides
  res.status(500).json({ errors: [ERRORS.internal] });
};
