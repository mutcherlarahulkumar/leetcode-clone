import { client } from "./redis.js";
import { saveSubmissionResult } from "./repositories/submissions.js";
import { SUBMISSION_RESULT } from "./constants/channels.js";

export const worker = async () => {
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe(SUBMISSION_RESULT, async (message) => {
    // save the output to the db
    const { submissionID, status, output } = JSON.parse(message);

    try {
      const updated = await saveSubmissionResult({
        id: submissionID,
        status,
        output,
      });
      console.log(updated);
    } catch (err) {
      console.error(err);
    }
  });
};
