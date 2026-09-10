import { consumeSubmissions } from "./events/consumer.js";
import { publishResult } from "./events/publisher.js";
import { runInSandbox } from "./executor/index.js";
import { Status } from "./models/status.js";

const handleSubmission = async ({ submissionID, solution, language }) => {
  try {
    const { status, output } = await runInSandbox({
      language,
      code: solution,
      stdin: "",
    });

    await publishResult({ submissionID, status, output });
  } catch (err) {
    // Reaching here means the sandbox never produced a verdict, which is our
    // failure and not the submitter's -- hence error rather than runtime_error.
    console.error(`submission ${submissionID} failed to run:`, err.message);

    await publishResult({
      submissionID,
      status: Status.error,
      output: "the submission could not be executed",
    });
  }
};

await consumeSubmissions(handleSubmission);
