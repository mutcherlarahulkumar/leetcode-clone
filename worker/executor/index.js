import { spawn, execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  MEMORY_MB,
  CPUS,
  PIDS_LIMIT,
  COMPILE_TIMEOUT_MS,
  RUN_TIMEOUT_MS,
  MAX_OUTPUT_BYTES,
} from "../constants/limits.js";
import { imageFor } from "./images.js";
import { commandFor } from "./commands.js";

export const CONTAINER_LABEL = "judge=1";

// Per-case run status the worker reports. The backend maps these onto
// submission_status; the worker never decides accepted/wrong_answer because it
// has no expected outputs.
export const CaseStatus = Object.freeze({
  ok: "ok",
  timeout: "timeout",
  memory_exceeded: "memory_exceeded",
  runtime_error: "runtime_error",
});

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");

const flags = (name, env) => [
  "run",
  "--rm",
  "-i",
  "--name",
  name,
  "--label",
  CONTAINER_LABEL,
  "--network",
  "none",
  "--memory",
  `${MEMORY_MB}m`,
  "--memory-swap",
  `${MEMORY_MB}m`,
  "--cpus",
  String(CPUS),
  "--pids-limit",
  String(PIDS_LIMIT),
  "--read-only",
  // `exec` is required: --tmpfs defaults to noexec, which makes a compiled
  // binary refuse to run.
  "--tmpfs",
  "/tmp:rw,exec,nosuid,size=256m",
  "--cap-drop",
  "ALL",
  "--security-opt",
  "no-new-privileges",
  "--user",
  "65534:65534",
  ...Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]),
];

const statusFromRc = (rc) => {
  if (rc === 0) return CaseStatus.ok;
  if (rc === 92) return CaseStatus.timeout; // driver normalises 124/143 -> 92
  if (rc === 137) return CaseStatus.memory_exceeded; // cgroup OOM kill
  return CaseStatus.runtime_error;
};

const kill = (name) =>
  new Promise((resolve) => execFile("docker", ["kill", name], () => resolve()));

/**
 * Compile once, then run the program against every test case input.
 *
 * @param {object} job
 * @param {string} job.language           slug: cpp | ts | go
 * @param {string} job.code               submitted source, byte for byte
 * @param {{id: string, input: string}[]} job.testCases
 * @returns {Promise<{compiled: boolean, compileOutput: string,
 *   cases: {id: string, status: string, output: string}[], totalMs: number}>}
 *
 * Throws only on our failure (missing docker, unknown language). Never decides
 * pass/fail -- that is the backend's job, with the expected outputs it holds.
 */
export const runInSandbox = async ({ language, code, testCases }) => {
  const image = imageFor(language);
  const { env, script } = commandFor(language);
  const name = `judge-${randomUUID()}`;
  const started = Date.now();

  const inputsB64 = testCases.map((tc) => b64(tc.input ?? "")).join("\n");
  // one output cap for the whole job: base64 inflates ~33%, and each case's
  // stdout is capped again by size after decode
  const streamCap = (MAX_OUTPUT_BYTES * (testCases.length + 1) * 2) | 0;

  const child = spawn("docker", [
    ...flags(name, { ...env, SOURCE_B64: b64(code), INPUTS_B64: inputsB64 }),
    image,
    "sh",
    "-c",
    script,
  ]);

  let stdout = "";
  let bytes = 0;
  let overflowed = false;
  let hitDeadline = false;

  child.stdout.on("data", (chunk) => {
    bytes += chunk.length;
    if (bytes > streamCap) {
      if (!overflowed) {
        overflowed = true;
        kill(name);
      }
      return;
    }
    stdout += chunk.toString();
  });
  child.stderr.on("data", () => {}); // diagnostics only; ignored

  const deadline = setTimeout(
    () => {
      hitDeadline = true;
      kill(name);
      child.kill("SIGKILL");
    },
    COMPILE_TIMEOUT_MS + RUN_TIMEOUT_MS * testCases.length + 10_000,
  );

  await new Promise((resolve, reject) => {
    child.on("error", reject); // docker missing: ours, not the submitter's
    child.on("close", resolve);
  }).finally(() => clearTimeout(deadline));

  const totalMs = Date.now() - started;

  // whole job blew the time budget -> report every case as a timeout
  if (hitDeadline) {
    return {
      compiled: true,
      compileOutput: "",
      cases: testCases.map((tc) => ({
        id: tc.id,
        status: CaseStatus.timeout,
        output: "",
      })),
      totalMs,
    };
  }

  const lines = stdout.split("\n");

  const compileLine = lines.find((l) => l.startsWith("##COMPILE## "));
  if (compileLine) {
    const enc = compileLine.slice("##COMPILE## ".length);
    return {
      compiled: false,
      compileOutput: Buffer.from(enc, "base64").toString("utf8"),
      cases: [],
      totalMs,
    };
  }

  // map each ##CASE## line back to its test case by index
  const byIndex = new Map();
  for (const line of lines) {
    if (!line.startsWith("##CASE## ")) continue;
    const rest = line.slice("##CASE## ".length);
    const sp1 = rest.indexOf(" ");
    const sp2 = rest.indexOf(" ", sp1 + 1);
    const index = Number(rest.slice(0, sp1));
    const rc = Number(rest.slice(sp1 + 1, sp2));
    const out = Buffer.from(rest.slice(sp2 + 1), "base64").toString("utf8");
    byIndex.set(index, { rc, out });
  }

  const cases = testCases.map((tc, i) => {
    const got = byIndex.get(i);
    if (!got) {
      // never emitted -> the container died before reaching this case
      return { id: tc.id, status: CaseStatus.runtime_error, output: "" };
    }
    const tooBig = got.out.length > MAX_OUTPUT_BYTES;
    return {
      id: tc.id,
      status: tooBig ? CaseStatus.runtime_error : statusFromRc(got.rc),
      output: tooBig ? got.out.slice(0, MAX_OUTPUT_BYTES) : got.out,
    };
  });

  return { compiled: true, compileOutput: "", cases, totalMs };
};
