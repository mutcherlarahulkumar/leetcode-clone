import { createClient } from "redis";
import { Status } from "./status.js";

const client = await createClient().on("error", (err) =>
  console.log("Redis Client Error", err),
);

let count = 0;

await client.connect();

async function performSomeAction() {
  while (1) {
    const currentSubmission = await client.rPop("submission");
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
    await client.publish("submissionresult", JSON.stringify(submissionResult));
  }
}

performSomeAction();
