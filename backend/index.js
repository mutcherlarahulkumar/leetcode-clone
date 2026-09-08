import express from "express";
import { createClient } from "redis";
import { worker } from "./pubsub.js";

const app = express();

app.use(express.json());

let count = 0;

export const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

app.post("/submissions", (req, res) => {
  // parse details from body
  const userID = req.body.userID;
  const submissionID = req.body.submissionID;
  const questionID = req.body.questionID;
  const solution = req.body.solution;
  const language = req.body.language;

  // db call to save all the details
  // save all the details to db and the status of submission to be "Pending"

  // do an redis call to push on to the queue
  const redisPayload = JSON.stringify({
    userID,
    submissionID,
    questionID,
    solution,
    language,
  });
  client.lPush("submission", redisPayload);

  count++;

  console.log("requests sent from this system", count);

  res.status(200).json({
    body: "Submission Queued",
  });
});

app.get("/submissions/:id", async (req, res) => {
  const submissionID = req.params.id;

  // get status from db for that particular submissionid and give it to the frontend

  res.status(200).json({
    body: "submitted succesfully",
  });
});

app.listen(3000);
worker();
