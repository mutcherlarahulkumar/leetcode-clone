import { Router } from "express";
import {
  createSubmission,
  findSubmissionByID,
} from "../repositories/submissions.js";
import { findLanguageByID } from "../repositories/languages.js";
import { findQuestionByID } from "../repositories/questions.js";
import { QuestionStatus } from "../models/questionStatus.js";
import { messages } from "../validation/messages.js";
import { client } from "../redis.js";
import { SUBMISSION_QUEUE } from "../constants/channels.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createSubmissionSchema,
  submissionIDSchema,
} from "../validation/schemas.js";

export const submissionsRouter = Router();

// every route below belongs to the caller, so authenticate once here
submissionsRouter.use(requireAuth);

let count = 0;

submissionsRouter.post(
  "/",
  validateBody(createSubmissionSchema),
  async (req, res) => {
    const { solution, languageID, questionID } = req.body;
    const userID = req.user.id;

    const question = await findQuestionByID(questionID);
    if (!question) {
      return res.status(404).json({ errors: [messages.questionID.unknown] });
    }
    // only a live question accepts submissions; a draft has no expected outputs
    if (question.status !== QuestionStatus.ready) {
      return res.status(409).json({ errors: [messages.questionID.notReady] });
    }

    const language = await findLanguageByID(languageID);
    if (!language || !language.is_enabled) {
      return res.status(400).json({ errors: [messages.languageID.unknown] });
    }

    let submission;
    try {
      submission = await createSubmission({
        code: solution,
        questionID,
        languageID: language.id,
        userID,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ errors: ["could not save submission"] });
    }

    await client.lPush(
      SUBMISSION_QUEUE,
      JSON.stringify({
        userID,
        submissionID: submission.id,
        questionID,
        solution,
        // the worker keys its images on the slug, exactly as before
        language: language.slug,
      }),
    );

    count++;
    console.log("requests sent from this system", count);

    res
      .status(202)
      .json({ submissionID: submission.id, status: submission.status });
  },
);

submissionsRouter.get(
  "/:id",
  validateParams(submissionIDSchema),
  async (req, res) => {
    try {
      const submission = await findSubmissionByID(req.params.id);

      if (!submission) {
        return res.status(404).json({ errors: ["submission not found"] });
      }
      if (submission.user_id !== req.user.id) {
        return res.status(403).json({ errors: ["not your submission"] });
      }

      const { user_id, ...body } = submission;
      res.status(200).json(body);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not fetch submission"] });
    }
  },
);
