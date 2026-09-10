import { Router } from "express";
import {
  createSubmission,
  findSubmissionByID,
  listSubmissionsByUser,
} from "../repositories/submissions.js";
import { findLanguageByID } from "../repositories/languages.js";
import { findQuestionByID } from "../repositories/questions.js";
import {
  listRunnableTestCases,
  listSampleTestCases,
} from "../repositories/testCases.js";
import { findTemplate } from "../repositories/questionTemplates.js";
import { QuestionStatus } from "../models/questionStatus.js";
import { messages } from "../validation/messages.js";
import { judgeRun } from "../judge.js";
import { assembleProgram } from "../templates.js";
import { newRunId, awaitRun } from "../runRegistry.js";
import { client } from "../redis.js";
import { SUBMISSION_QUEUE } from "../constants/channels.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createSubmissionSchema,
  submissionIDSchema,
} from "../validation/schemas.js";

const RUN_TIMEOUT_MS = 30_000;

// shared: validate the submission body targets a ready question + enabled
// language, returning { question, language } or sending the error itself.
const resolveTarget = async (req, res) => {
  const { languageID, questionID } = req.body;
  const question = await findQuestionByID(questionID);
  if (!question) {
    res.status(404).json({ errors: [messages.questionID.unknown] });
    return null;
  }
  if (question.status !== QuestionStatus.ready) {
    res.status(409).json({ errors: [messages.questionID.notReady] });
    return null;
  }
  const language = await findLanguageByID(languageID);
  if (!language || !language.is_enabled) {
    res.status(400).json({ errors: [messages.languageID.unknown] });
    return null;
  }
  // function-mode: the language must have a template for this question, and its
  // harness is what makes the submitted function a runnable program
  const template = await findTemplate(question.id, language.id);
  if (!template) {
    res.status(400).json({ errors: ["this language is not available for this question"] });
    return null;
  }
  return { question, language, template };
};

export const submissionsRouter = Router();

// every route below belongs to the caller, so authenticate once here
submissionsRouter.use(requireAuth);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// the caller's own submission history, optionally scoped to one question
submissionsRouter.get("/", async (req, res) => {
  const questionId = req.query.questionId;
  if (questionId !== undefined && !UUID_RE.test(questionId)) {
    return res.status(400).json({ errors: ["questionId must be a valid uuid"] });
  }
  try {
    res.status(200).json(await listSubmissionsByUser(req.user.id, questionId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not list submissions"] });
  }
});

submissionsRouter.post(
  "/",
  validateBody(createSubmissionSchema),
  async (req, res) => {
    const { solution, questionID } = req.body;
    const userID = req.user.id;

    const target = await resolveTarget(req, res);
    if (!target) return;
    const { language, template } = target;

    let submission;
    try {
      // store what the user wrote (the function body), not the assembled program
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

    // the worker has no DB access, so the test case inputs travel with the job;
    // it returns raw outputs and the backend compares them here. The code sent
    // is the harness with the user's function injected.
    const testCases = await listRunnableTestCases(questionID);
    await client.lPush(
      SUBMISSION_QUEUE,
      JSON.stringify({
        kind: "submission",
        id: submission.id,
        questionID,
        language: language.slug, // worker keys its images on the slug
        code: assembleProgram(template.harness, solution),
        testCases,
      }),
    );

    res
      .status(202)
      .json({ submissionID: submission.id, status: submission.status });
  },
);

// Run against the sample cases only. Nothing is saved -- the HTTP request waits
// for the worker's result and returns per-case input/expected/actual.
submissionsRouter.post(
  "/run",
  validateBody(createSubmissionSchema),
  async (req, res) => {
    const { solution } = req.body;

    const target = await resolveTarget(req, res);
    if (!target) return;
    const { question, language, template } = target;

    const samples = await listSampleTestCases(question.id);
    const sampleById = new Map(
      samples.map((s) => [s.id, { input: s.input, expected: s.expected_output }]),
    );

    const runId = newRunId();
    await client.lPush(
      SUBMISSION_QUEUE,
      JSON.stringify({
        kind: "run",
        id: runId,
        questionID: question.id,
        language: language.slug,
        code: assembleProgram(template.harness, solution),
        testCases: samples.map((s) => ({ id: s.id, input: s.input })),
      }),
    );

    try {
      const result = await awaitRun(runId, RUN_TIMEOUT_MS);
      if (result.error) {
        return res.status(500).json({ errors: ["the run could not be executed"] });
      }
      res.status(200).json(judgeRun(result, sampleById));
    } catch {
      res.status(504).json({ errors: ["run timed out"] });
    }
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
