import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

export const client = await createClient({ url: process.env.REDIS_URL })
  .on("error", (err) => console.error("Redis Client Error", err))
  .connect();
