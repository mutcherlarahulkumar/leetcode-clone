import express from "express";
import { worker } from "./pubsub.js";
import { connectToDB, closeDB } from "./db/db.js";
import { client } from "./redis.js";
import { authRouter } from "./routes/auth.js";
import { submissionsRouter } from "./routes/submissions.js";
import { languagesRouter } from "./routes/languages.js";
import { questionsRouter } from "./routes/questions.js";
import { adminRouter } from "./routes/admin.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import { cors } from "./middleware/cors.js";

const app = express();

await connectToDB();

// CORS first, so preflight is answered before body parsing or routing
app.use(cors);

// the default 100kb would reject a solution near MAX_SOLUTION_LENGTH
app.use(express.json({ limit: "1mb" }));

app.use("/auth", authRouter);
app.use("/submissions", submissionsRouter);
app.use("/languages", languagesRouter);
app.use("/questions", questionsRouter);
app.use("/admin", adminRouter);

// order matters: unknown route first, then the catch-all error handler last
app.use(notFound);
app.use(errorHandler);

const server = app.listen(process.env.PORT ?? 3000);

worker();

// The `defer`-equivalent: stop taking requests, then hand back the pool and the
// redis connection instead of letting the process die holding them open.
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close();
  await Promise.allSettled([closeDB(), client.quit()]);
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
