import { client } from "./redis.js";
import { pool } from "./db/db.js";
import { SUBMISSION_RESULT } from "./constants/channels.js";

export const worker = async () => {
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe(SUBMISSION_RESULT, async (message) => {
    // save the output to the db
    const { submissionID, status, output } = JSON.parse(message);

    try {
      const text =
        "UPDATE submissions SET status = $1, output = $2 WHERE id = $3 RETURNING *";
      const values = [status, output, submissionID];

      const dbRes = await pool.query(text, values);
      console.log(dbRes.rows[0]);
    } catch (err) {
      console.error(err);
    }
  });
};
