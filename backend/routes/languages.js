import { Router } from "express";
import { findAllLanguages } from "../repositories/languages.js";

export const languagesRouter = Router();

// Unauthenticated: this is the list a submit form needs before anyone has
// logged in, and it is the same for everyone.
languagesRouter.get("/", async (req, res) => {
  try {
    res.status(200).json(await findAllLanguages());
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not fetch languages"] });
  }
});
