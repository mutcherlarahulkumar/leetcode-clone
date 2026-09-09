import { createClient } from "redis";
import { Status } from "./models/status.js";
import {
  SUBMISSION_QUEUE,
  SUBMISSION_RESULT,
} from "./constants/channels.js";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const client = await createClient({ url: process.env.REDIS_URL }).on(
  "error",
  (err) => console.error("Redis Client Error", err),
);

let count = 0;

await client.connect();

async function performSomeAction() {
  while (1) {
    const currentSubmission = await client.rPop(SUBMISSION_QUEUE);
    if (!currentSubmission) {
      await setTimeout(() => {
        console.log("waiting to pick the submission");
      }, 100000);
      continue;
    }

    const redisPayload = JSON.parse(currentSubmission);

    console.log(redisPayload);
    console.log("Sending code to execute");
    await setTimeout(() => {
      console.log("executong the code for long time");
    }, 5000);
    console.log("code to execution completed");
    count++;
    console.log("Requests handled in this syatem", count);
    const submissionResult = {
      ...redisPayload,
      output: "some execution result",
      // placeholder: the real status comes from the executor's exit code
      status: Status.accepted,
    };
    await client.publish(SUBMISSION_RESULT, JSON.stringify(submissionResult));
  }
}

performSomeAction();
