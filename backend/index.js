import express from "express";
import { worker } from "./pubsub.js";
import { connectToDB, closeDB } from "./db/db.js";
import { client } from "./redis.js";
import { authRouter } from "./routes/auth.js";
import { submissionsRouter } from "./routes/submissions.js";

const app = express();

await connectToDB();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/submissions", submissionsRouter);

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
