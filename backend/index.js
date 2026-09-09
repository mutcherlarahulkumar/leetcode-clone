import express from "express";
import { createClient } from "redis";
import { worker } from "./pubsub.js";
import { connectToDB, DBClientConnection } from "./db/db.js";
import { Status } from "./status.js";
import { SUBMISSION_QUEUE } from "./channels.js";
import {
  createSubmissionSchema,
  submissionIDSchema,
  validate,
} from "./validation/schemas.js";

const app = express();

await connectToDB();
app.use(express.json());

let count = 0;

export const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

app.post("/submissions", async (req, res) => {
  // parse details from body
  const userIDs = [
    "57d77c90-2d26-4c35-a160-2cfaa1fe7c80",
    "fd61356c-7c66-4949-8b8e-377f57fb09b5",
  ];
  const userID = userIDs[0];
  const questionIDs = [
    "57d77c90-2d26-4c35-a160-2cfaa1fe7c80",
    "fd61356c-7c66-4949-8b8e-377f57fb09b5",
  ];
  const questionID = questionIDs[0];
  let solution, language;
  try {
    ({ solution, language } = await validate(createSubmissionSchema, req.body));
  } catch (err) {
    return res.status(400).json({ errors: err.errors });
  }

  // db call to save all the details
  // save all the details to db and the status of submission to be "Pending"
  let rowID;
  try {
    const text =
      "INSERT INTO submissions(code, status, question_id, language, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const values = [solution, Status.pending, questionID, language, userID];

    const dbRes = await DBClientConnection.query(text, values);
    rowID = dbRes.rows[0].id;
    console.log(dbRes.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ body: "Could not save submission" });
  }

  // do an redis call to push on to the queue
  const redisPayload = JSON.stringify({
    userID,
    submissionID: rowID,
    questionID,
    solution,
    language,
  });
  await client.lPush(SUBMISSION_QUEUE, redisPayload);

  count++;

  console.log("requests sent from this system", count);

  res.status(202).json({
    submissionID: rowID,
    status: Status.pending,
  });
});

app.get("/submissions/:id", async (req, res) => {
  let submissionID;
  try {
    ({ id: submissionID } = await validate(submissionIDSchema, req.params));
  } catch (err) {
    return res.status(400).json({ errors: err.errors });
  }

  // get status from db for that particular submissionid and give it to the frontend
  try {
    const dbRes = await DBClientConnection.query(
      "SELECT id, status, output FROM submissions WHERE id = $1",
      [submissionID],
    );

    if (dbRes.rows.length === 0) {
      return res.status(404).json({ body: "Submission not found" });
    }

    res.status(200).json(dbRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ body: "Could not fetch submission" });
  }
});

app.listen(process.env.PORT ?? 3000);

worker();
