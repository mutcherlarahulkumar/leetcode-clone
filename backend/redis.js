import { createClient } from "redis";

// Own module so routes and pubsub can share it without importing index.js back.
export const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();
