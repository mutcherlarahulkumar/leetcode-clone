import { client } from "./index.js";
import { DBClientConnection } from "./db/db.js";

export const worker = async () => {
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("submissionresult", async (message) => {
    // save the output to the db
    const { submissionID, status, output } = JSON.parse(message);

    try {
      const text =
        "UPDATE submissions SET status = $1, output = $2 WHERE id = $3 RETURNING *";
      const values = [status, output, submissionID];

      const dbRes = await DBClientConnection.query(text, values);
      console.log(dbRes.rows[0]);
    } catch (err) {
      console.error(err);
    }
  });
};
