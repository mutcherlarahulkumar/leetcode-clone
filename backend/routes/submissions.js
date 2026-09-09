import { Router } from "express";
import { pool } from "../db/db.js";
import { client } from "../redis.js";
import { Status } from "../models/status.js";
import { SUBMISSION_QUEUE } from "../constants/channels.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createSubmissionSchema,
  submissionIDSchema,
} from "../validation/schemas.js";

export const submissionsRouter = Router();

// every route below belongs to the caller, so authenticate once here
submissionsRouter.use(requireAuth);

let count = 0;

submissionsRouter.post(
  "/",
  validateBody(createSubmissionSchema),
  async (req, res) => {
    const { solution, language } = req.body;
    const userID = req.user.id;
    // placeholder until there is a questions table to pick from
    const questionID = "57d77c90-2d26-4c35-a160-2cfaa1fe7c80";

    let rowID;
    try {
      const dbRes = await pool.query(
        "INSERT INTO submissions(code, status, question_id, language, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [solution, Status.pending, questionID, language, userID],
      );
      rowID = dbRes.rows[0].id;
    } catch (err) {
      console.error(err);
      return res.status(500).json({ errors: ["could not save submission"] });
    }

    await client.lPush(
      SUBMISSION_QUEUE,
      JSON.stringify({
        userID,
        submissionID: rowID,
        questionID,
        solution,
        language,
      }),
    );

    count++;
    console.log("requests sent from this system", count);

    res.status(202).json({ submissionID: rowID, status: Status.pending });
  },
);

submissionsRouter.get(
  "/:id",
  validateParams(submissionIDSchema),
  async (req, res) => {
    try {
      // fetch user_id in the same round trip and compare here, rather than
      // spending a second query just to find out who owns the row
      const dbRes = await pool.query(
        "SELECT id, status, output, user_id FROM submissions WHERE id = $1",
        [req.params.id],
      );

      const submission = dbRes.rows[0];
      if (!submission) {
        return res.status(404).json({ errors: ["submission not found"] });
      }
      if (submission.user_id !== req.user.id) {
        return res.status(403).json({ errors: ["not your submission"] });
      }

      const { user_id, ...body } = submission;
      res.status(200).json(body);
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: ["could not fetch submission"] });
    }
  },
);
