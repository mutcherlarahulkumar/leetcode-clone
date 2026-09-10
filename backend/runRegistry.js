import { randomUUID } from "node:crypto";

// A "Run" (test against sample cases, no saved submission) is async: the HTTP
// request waits here for the worker's result, which arrives later on the result
// channel. Pub/sub broadcasts to every backend replica, so whichever replica
// holds the pending run resolves it and the others no-op.
const pending = new Map(); // runId -> { resolve, timer }

export const newRunId = () => randomUUID();

export const awaitRun = (runId, timeoutMs) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(runId);
      reject(new Error("run timed out"));
    }, timeoutMs);
    pending.set(runId, { resolve, timer });
  });

// Returns false when no request on this replica is waiting for the id.
export const resolveRun = (runId, result) => {
  const entry = pending.get(runId);
  if (!entry) return false;
  clearTimeout(entry.timer);
  pending.delete(runId);
  entry.resolve(result);
  return true;
};
