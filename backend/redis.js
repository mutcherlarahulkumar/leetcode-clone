import { createClient } from "redis";

// Own module so routes and pubsub can share it without importing index.js back.
export const client = await createClient({ url: process.env.REDIS_URL })
  .on("error", (err) => console.error("Redis Client Error", err))
  .connect();
