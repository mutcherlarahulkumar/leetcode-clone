import { client } from "../redis.js";
import { SUBMISSION_RESULT } from "../constants/channels.js";

export const publishResult = async ({ submissionID, status, output }) => {
  await client.publish(
    SUBMISSION_RESULT,
    JSON.stringify({ submissionID, status, output }),
  );
};
