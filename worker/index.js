import { ensureImages } from "./executor/images.js";
import { consumeSubmissions } from "./events/consumer.js";
import { publishResult } from "./events/publisher.js";
import { runInSandbox } from "./executor/index.js";

// A job is either a user submission or an admin reference-solution generation.
// Both run identically here: compile once, run every test case, report raw
// outputs. The backend decides accepted/wrong or stores the expected outputs.
const handleJob = async (job) => {
  const { kind, id, questionID, language, code, testCases } = job;

  try {
    const r = await runInSandbox({ language, code, testCases });
    await publishResult({
      kind,
      id,
      questionID,
      compiled: r.compiled,
      compileOutput: r.compileOutput,
      cases: r.cases,
      totalMs: r.totalMs,
    });
  } catch (err) {
    // the sandbox never produced a verdict -- our failure, not the submitter's
    console.error(`job ${id} (${kind}) failed to run:`, err.message);
    await publishResult({ kind, id, questionID, error: true });
  }
};

// Before the queue, not lazily on first use: a broken docker setup should stop
// the worker starting, not quietly fail one submitter's run.
await ensureImages();
await consumeSubmissions(handleJob);
