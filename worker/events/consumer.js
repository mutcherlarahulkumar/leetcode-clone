import { setTimeout as sleep } from "node:timers/promises";
import { client } from "../redis.js";
import { SUBMISSION_QUEUE } from "../constants/channels.js";

const IDLE_POLL_MS = 1000;

export const consumeSubmissions = async (handleSubmission) => {
  while (true) {
    const raw = await client.rPop(SUBMISSION_QUEUE);

    if (!raw) {
      await sleep(IDLE_POLL_MS);
      continue;
    }
    try {
      await handleSubmission(JSON.parse(raw));
    } catch (err) {
      // handleSubmission owns reporting failures; anything reaching here means
      // the handler itself broke, and swallowing it keeps the loop alive.
      console.error("submission handler threw:", err);
    }
  }
};
