import { client } from "./index.js";

export const worker = async () => {
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("submissionresult", (message) => {
    console.log(message); // 'message'
  });

  // save to db the status
};
