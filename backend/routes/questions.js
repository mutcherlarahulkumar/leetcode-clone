import { Router } from "express";
import { validateParams } from "../middleware/validate.js";
import { idParamSchema } from "../validation/schemas.js";
import {
  listReadyQuestions,
  findReadyQuestionByID,
} from "../repositories/questions.js";
import { listSampleTestCases } from "../repositories/testCases.js";

export const questionsRouter = Router();

// Public: the catalogue a solver browses. Only ready questions are visible;
// drafts and their hidden test cases never appear here.
questionsRouter.get("/", async (req, res) => {
  try {
    res.status(200).json(await listReadyQuestions());
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not list questions"] });
  }
});

questionsRouter.get("/:id", validateParams(idParamSchema), async (req, res) => {
  try {
    const question = await findReadyQuestionByID(req.params.id);
    if (!question) return res.status(404).json({ errors: ["question not found"] });
    // sample cases only -- hidden inputs/outputs stay on the server
    const samples = await listSampleTestCases(question.id);
    res.status(200).json({ ...question, samples });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not fetch question"] });
  }
});
