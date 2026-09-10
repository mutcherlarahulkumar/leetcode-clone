import { client } from "../redis.js";
import { SUBMISSION_RESULT } from "../constants/channels.js";

// Publishes the whole result envelope. The backend routes on `kind` and does
// all comparison -- the worker only reports what ran.
//
// TODO: pub/sub is fire-and-forget. If no backend replica is subscribed at this
// instant (mid-deploy, restart), the result is dropped and the row stays
// pending. A list or stream would hold it until someone takes it.
export const publishResult = async (envelope) => {
  await client.publish(SUBMISSION_RESULT, JSON.stringify(envelope));
};
