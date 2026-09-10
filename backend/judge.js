import { Status } from "./models/status.js";

// The worker reports one of these per case; it never decides accepted/wrong.
const CASE_OK = "ok";

// A non-ok case maps straight onto a submission_status.
const failStatus = (caseStatus) =>
  ({
    timeout: Status.timeout,
    memory_exceeded: Status.memory_exceeded,
    runtime_error: Status.runtime_error,
  })[caseStatus] ?? Status.error;

// Exact comparison, trailing whitespace trimmed on both sides. The admin owns
// the I/O harness (the submitter edits only a function), and expected outputs
// are produced by the reference solution through this same sandbox, so outputs
// match by construction -- the only slack needed is a stray final newline.
const matches = (actual, expected) =>
  String(actual).replace(/\s+$/, "") === String(expected).replace(/\s+$/, "");

/**
 * Judge a user submission against the stored expected outputs.
 * @param {{compiled:boolean, compileOutput:string, cases:{id,status,output}[], totalMs:number}} result
 * @param {Map<string,string>} expectedById  test case id -> expected_output
 */
export const judgeSubmission = (result, expectedById) => {
  if (!result.compiled) {
    return {
      status: Status.compile_error,
      passedCount: 0,
      totalCount: expectedById.size,
      results: [],
      output: result.compileOutput ?? "",
      metrics: { totalMs: result.totalMs },
    };
  }

  let passed = 0;
  let firstFail = null;
  const results = result.cases.map((c) => {
    let verdict;
    if (c.status !== CASE_OK) verdict = failStatus(c.status);
    else if (matches(c.output, expectedById.get(c.id))) {
      verdict = Status.accepted;
      passed++;
    } else verdict = Status.wrong_answer;

    if (verdict !== Status.accepted && !firstFail) firstFail = verdict;
    return { id: c.id, status: verdict };
  });

  return {
    // the first failing case decides the overall verdict, like leetcode
    status: firstFail ?? Status.accepted,
    passedCount: passed,
    totalCount: result.cases.length,
    results,
    output: "",
    metrics: { totalMs: result.totalMs },
  };
};

/**
 * Evaluate a reference solution run. If it passes cleanly its outputs become the
 * questions's expected outputs; otherwise the question cannot go ready.
 */
export const evaluateGeneration = (result) => {
  if (!result.compiled) {
    return { ok: false, solutionStatus: Status.compile_error, output: result.compileOutput ?? "" };
  }
  const bad = result.cases.find((c) => c.status !== CASE_OK);
  if (bad) {
    return { ok: false, solutionStatus: failStatus(bad.status), output: "" };
  }
  return {
    ok: true,
    solutionStatus: Status.accepted,
    outputs: result.cases.map((c) => ({ id: c.id, output: c.output })),
    metrics: { totalMs: result.totalMs },
  };
};
