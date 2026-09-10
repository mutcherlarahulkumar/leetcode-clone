import { client } from "./redis.js";
import { SUBMISSION_RESULT } from "./constants/channels.js";
import { Status } from "./models/status.js";
import { QuestionStatus } from "./models/questionStatus.js";
import { judgeSubmission, evaluateGeneration } from "./judge.js";
import { caseDataFor, setExpectedOutputs } from "./repositories/testCases.js";
import { setSolutionResult } from "./repositories/solutions.js";
import { setQuestionStatus } from "./repositories/questions.js";
import { saveJudgment } from "./repositories/submissions.js";
import { resolveRun } from "./runRegistry.js";

// A reference-solution run: on a clean pass its outputs become the question's
// expected outputs and the question goes ready; otherwise it cannot.
const handleGeneration = async (r) => {
  const outcome = evaluateGeneration(r);
  if (!outcome.ok) {
    await setSolutionResult({
      id: r.id,
      status: outcome.solutionStatus,
      metrics: { totalMs: r.totalMs, output: outcome.output || null },
    });
    await setQuestionStatus(r.questionID, QuestionStatus.generation_failed);
    return;
  }
  await setExpectedOutputs(outcome.outputs);
  await setSolutionResult({ id: r.id, status: outcome.solutionStatus, metrics: outcome.metrics });
  await setQuestionStatus(r.questionID, QuestionStatus.ready);
};

// A user submission: compare each output to the stored expected output.
const handleSubmission = async (r) => {
  const caseData = await caseDataFor(r.questionID);
  const j = judgeSubmission(r, caseData);
  await saveJudgment({
    id: r.id,
    status: j.status,
    passedCount: j.passedCount,
    totalCount: j.totalCount,
    results: j.results,
    output: j.output,
    totalMs: j.metrics.totalMs,
  });
};

// the worker could not run the job at all (missing docker, unknown language):
// our failure, recorded as `error` without blaming the submitter
const handleWorkerError = async (r) => {
  if (r.kind === "generation") {
    await setSolutionResult({ id: r.id, status: Status.error, metrics: null });
    await setQuestionStatus(r.questionID, QuestionStatus.generation_failed);
  } else {
    await saveJudgment({
      id: r.id,
      status: Status.error,
      passedCount: 0,
      totalCount: 0,
      results: [],
      output: "the submission could not be executed",
      totalMs: 0,
    });
  }
};

export const worker = async () => {
  const subscriber = client.duplicate();
  await subscriber.connect();

  await subscriber.subscribe(SUBMISSION_RESULT, async (message) => {
    try {
      const r = JSON.parse(message);
      // a Run's result is handed to the waiting HTTP request, not the DB
      if (r.kind === "run") {
        if (r.error) resolveRun(r.id, { error: true });
        else resolveRun(r.id, r);
        return;
      }
      if (r.error) await handleWorkerError(r);
      else if (r.kind === "generation") await handleGeneration(r);
      else await handleSubmission(r);
    } catch (err) {
      console.error(err);
    }
  });
};
