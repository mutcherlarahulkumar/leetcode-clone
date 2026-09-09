import { Client } from "pg";

export const DBClientConnection = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_BOANDeV7l6Hc@ep-snowy-haze-a5qa5e67-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

export async function connectToDB() {
  await DBClientConnection.connect().then(() => {
    console.log("Client connected successfull ");
  });

  return DBClientConnection;
}

// try {
//   const res = await client.query("SELECT $1::text as message", [
//     "Hello world!",
//   ]);
//   console.log(res.rows[0].message); // Hello world!
// } catch (err) {
//   console.error(err);
// } finally {
//   await client.end();
// }

// const text = "INSERT INTO users(name, email) VALUES($1, $2) RETURNING *";
// const values = ["brianc", "brian.m.carlson@gmail.com"];

// const res = await client.query(text, values);
// console.log(res.rows[0]);
