import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// A single Client is one TCP connection: when Neon drops it while idle, every
// later query fails and there is nothing to reconnect it. A Pool hands out a
// connection per query and replaces dead ones on its own.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Without this, a connection dying while idle in the pool is an unhandled
// 'error' event, which takes the whole process down.
// err carries the whole Client object, so log only the message.
pool.on("error", (err) => {
  console.error("idle database client error:", err.message);
});

export const connectToDB = async () => {
  await pool.query("SELECT 1");
  console.log("Client connected successfull");
};

export const closeDB = () => pool.end();
