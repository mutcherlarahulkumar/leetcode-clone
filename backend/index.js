import express from "express";
import { worker } from "./pubsub.js";
import { connectToDB } from "./db/db.js";
import { authRouter } from "./routes/auth.js";
import { submissionsRouter } from "./routes/submissions.js";

const app = express();

await connectToDB();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/submissions", submissionsRouter);

app.listen(process.env.PORT ?? 3000);

worker();
