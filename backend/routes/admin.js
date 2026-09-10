import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
  createTestCaseSchema,
  createSolutionSchema,
  createLanguageSchema,
  updateLanguageSchema,
  idParamSchema,
  testCaseParamSchema,
} from "../validation/schemas.js";
import { messages } from "../validation/messages.js";
import { QuestionStatus } from "../models/questionStatus.js";
import {
  createQuestion,
  updateQuestion,
  listQuestions,
  findQuestionByID,
  setQuestionStatus,
  deleteQuestion,
} from "../repositories/questions.js";
import {
  createTestCase,
  listTestCases,
  deleteTestCase,
  listRunnableTestCases,
  countByKind,
} from "../repositories/testCases.js";
import {
  createSolution,
  listSolutions,
  findReferenceSolution,
} from "../repositories/solutions.js";
import { listUsers } from "../repositories/users.js";
import { listAllSubmissions } from "../repositories/submissions.js";
import {
  createLanguage,
  updateLanguage,
  findLanguageByID,
} from "../repositories/languages.js";
import { client } from "../redis.js";
import { SUBMISSION_QUEUE } from "../constants/channels.js";
import { MIN_SAMPLE_CASES, MAX_TEST_CASES } from "../constants/limits.js";

export const adminRouter = Router();

// every admin route is authenticated and admin-gated, once, here
adminRouter.use(requireAuth, requireAdmin);

const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// The admin can edit at any stage. Any edit invalidates a published question --
// its stored expected outputs may no longer match the content -- so it drops
// back to draft and must be generated again to go live.
const revertToDraft = async (question) => {
  if (question.status !== QuestionStatus.draft) {
    await setQuestionStatus(question.id, QuestionStatus.draft);
  }
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

adminRouter.get("/users", async (req, res) => {
  try {
    res.status(200).json(await listUsers());
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not list users"] });
  }
});

// every submission across all users, newest first; ?userId / ?questionId filter
adminRouter.get("/submissions", async (req, res) => {
  const { userId, questionId } = req.query;
  for (const [k, v] of [
    ["userId", userId],
    ["questionId", questionId],
  ]) {
    if (v !== undefined && !UUID_RE.test(v)) {
      return res.status(400).json({ errors: [`${k} must be a valid uuid`] });
    }
  }
  try {
    res
      .status(200)
      .json(
        await listAllSubmissions({ userID: userId, questionID: questionId }),
      );
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not list submissions"] });
  }
});

// --- languages ---------------------------------------------------------------

adminRouter.post(
  "/languages",
  validateBody(createLanguageSchema),
  async (req, res) => {
    const { slug, name, version } = req.body;
    try {
      const lang = await createLanguage({ slug, name, version });
      if (!lang)
        return res.status(409).json({ errors: ["slug already exists"] });
      // created disabled on purpose; enable it only after the worker image exists
      res.status(201).json(lang);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not create language"] });
    }
  },
);

adminRouter.patch(
  "/languages/:id",
  validateParams(idParamSchema),
  validateBody(updateLanguageSchema),
  async (req, res) => {
    const { name, version, isEnabled } = req.body;
    try {
      const lang = await updateLanguage({
        id: req.params.id,
        name,
        version,
        isEnabled,
      });
      if (!lang)
        return res.status(404).json({ errors: ["language not found"] });
      res.status(200).json(lang);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not update language"] });
    }
  },
);

// --- questions ---------------------------------------------------------------

adminRouter.post(
  "/questions",
  validateBody(createQuestionSchema),
  async (req, res) => {
    const { title, statement, hints } = req.body;
    const slug = req.body.slug ?? slugify(title);
    if (!slug) return res.status(400).json({ errors: [messages.slug.format] });

    try {
      const question = await createQuestion({
        title,
        slug,
        statement,
        hints,
        createdBy: req.user.id,
      });
      if (!question)
        return res.status(409).json({ errors: ["slug already exists"] });
      res.status(201).json(question);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not create question"] });
    }
  },
);

adminRouter.get("/questions", async (req, res) => {
  try {
    res.status(200).json(await listQuestions());
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["could not list questions"] });
  }
});

// full view: statement + every test case (expected outputs included) + solutions
adminRouter.get(
  "/questions/:id",
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const question = await findQuestionByID(req.params.id);
      if (!question)
        return res.status(404).json({ errors: ["question not found"] });
      const [testCases, solutions] = await Promise.all([
        listTestCases(question.id),
        listSolutions(question.id),
      ]);
      res.status(200).json({ ...question, testCases, solutions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not fetch question"] });
    }
  },
);

adminRouter.patch(
  "/questions/:id",
  validateParams(idParamSchema),
  validateBody(updateQuestionSchema),
  async (req, res) => {
    const { title, slug, statement, hints } = req.body;
    try {
      const existing = await findQuestionByID(req.params.id);
      if (!existing)
        return res.status(404).json({ errors: ["question not found"] });
      const question = await updateQuestion({
        id: req.params.id,
        title,
        slug,
        statement,
        hints,
      });
      await revertToDraft(existing);
      res.status(200).json({ ...question, status: QuestionStatus.draft });
    } catch (err) {
      if (err.code === "23505")
        return res.status(409).json({ errors: ["slug already exists"] });
      console.error(err);
      res.status(500).json({ errors: ["could not update question"] });
    }
  },
);

adminRouter.delete(
  "/questions/:id",
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const deleted = await deleteQuestion(req.params.id);
      if (!deleted)
        return res.status(404).json({ errors: ["question not found"] });
      res.status(204).end();
    } catch (err) {
      // 23503: submissions reference this question, so it cannot be removed
      if (err.code === "23503") {
        return res
          .status(409)
          .json({ errors: ["question has submissions and cannot be deleted"] });
      }
      console.error(err);
      res.status(500).json({ errors: ["could not delete question"] });
    }
  },
);

// --- test cases (nested under a question) ------------------------------------

adminRouter.post(
  "/questions/:id/test-cases",
  validateParams(idParamSchema),
  validateBody(createTestCaseSchema),
  async (req, res) => {
    const { kind, input, explanation } = req.body;
    try {
      const question = await findQuestionByID(req.params.id);
      if (!question)
        return res.status(404).json({ errors: ["question not found"] });
      const counts = await countByKind(question.id);
      if (counts.sample + counts.hidden >= MAX_TEST_CASES) {
        return res
          .status(409)
          .json({
            errors: [
              `a question can have at most ${MAX_TEST_CASES} test cases`,
            ],
          });
      }
      const testCase = await createTestCase({
        questionID: question.id,
        kind,
        input,
        explanation,
      });
      await revertToDraft(question);
      res.status(201).json(testCase);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not create test case"] });
    }
  },
);

adminRouter.delete(
  "/questions/:id/test-cases/:tcId",
  validateParams(testCaseParamSchema),
  async (req, res) => {
    try {
      const question = await findQuestionByID(req.params.id);
      if (!question)
        return res.status(404).json({ errors: ["question not found"] });
      const deleted = await deleteTestCase({
        questionID: question.id,
        id: req.params.tcId,
      });
      if (!deleted)
        return res.status(404).json({ errors: ["test case not found"] });
      await revertToDraft(question);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not delete test case"] });
    }
  },
);

// --- solutions (nested under a question) -------------------------------------

adminRouter.post(
  "/questions/:id/solutions",
  validateParams(idParamSchema),
  validateBody(createSolutionSchema),
  async (req, res) => {
    const { languageID, code, isReference } = req.body;
    try {
      const question = await findQuestionByID(req.params.id);
      if (!question)
        return res.status(404).json({ errors: ["question not found"] });

      const language = await findLanguageByID(languageID);
      if (!language || !language.is_enabled) {
        return res.status(400).json({ errors: [messages.languageID.unknown] });
      }

      const solution = await createSolution({
        questionID: question.id,
        languageID: language.id,
        code,
        isReference,
      });
      // null means the partial unique index rejected a second reference solution
      if (!solution) {
        return res
          .status(409)
          .json({ errors: ["a reference solution already exists"] });
      }
      await revertToDraft(question);
      res.status(201).json(solution);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not create solution"] });
    }
  },
);

// --- generation: run the reference solution to produce expected outputs -------

adminRouter.post(
  "/questions/:id/generate",
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const question = await findQuestionByID(req.params.id);
      if (!question)
        return res.status(404).json({ errors: ["question not found"] });
      if (question.status === QuestionStatus.generating) {
        return res
          .status(409)
          .json({ errors: ["generation is already running"] });
      }

      const reference = await findReferenceSolution(question.id);
      if (!reference) {
        return res
          .status(400)
          .json({ errors: ["add a reference solution first"] });
      }

      const counts = await countByKind(question.id);
      if (counts.sample < MIN_SAMPLE_CASES) {
        return res
          .status(400)
          .json({
            errors: [
              `at least ${MIN_SAMPLE_CASES} sample test cases are required`,
            ],
          });
      }

      const testCases = await listRunnableTestCases(question.id);
      // move to 'generating' before enqueuing, so the state is honest even if the
      // worker picks it up instantly
      await setQuestionStatus(question.id, "generating");

      await client.lPush(
        SUBMISSION_QUEUE,
        JSON.stringify({
          kind: "generation",
          id: reference.id,
          questionID: question.id,
          language: reference.language,
          code: reference.code,
          testCases,
        }),
      );

      res.status(202).json({ questionID: question.id, status: "generating" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not start generation"] });
    }
  },
);

// Revert a ready (or stuck) question to draft so it can be edited and
// re-generated. Existing expected outputs stay until the next generate
// overwrites them; a draft accepts no new submissions, so they cannot be used.
adminRouter.post(
  "/questions/:id/unpublish",
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const question = await findQuestionByID(req.params.id);
      if (!question) return res.status(404).json({ errors: ["question not found"] });
      const updated = await setQuestionStatus(question.id, QuestionStatus.draft);
      res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not unpublish question"] });
    }
  },
);
