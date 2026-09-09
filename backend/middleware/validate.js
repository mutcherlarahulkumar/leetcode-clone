import { validate } from "../validation/schemas.js";

export const validateBody = (schema) => async (req, res, next) => {
  try {
    req.body = await validate(schema, req.body);
    next();
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
};

export const validateParams = (schema) => async (req, res, next) => {
  try {
    req.params = await validate(schema, req.params);
    next();
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
};
