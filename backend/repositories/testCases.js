import { pool } from "../db/db.js";

// position is assigned as (max for this question) + 1, so the admin never has to
// supply one and the UNIQUE(question_id, position) constraint can't clash.
export const createTestCase = async ({
  questionID,
  kind,
  input,
  explanation,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO test_cases(question_id, kind, input, explanation, position)
     VALUES($1, $2, $3, $4,
            COALESCE((SELECT max(position) FROM test_cases WHERE question_id = $1), 0) + 1)
     RETURNING id, kind, input, explanation, position`,
    [questionID, kind, input, explanation ?? null],
  );
  return rows[0];
};

// Admin view: every case, expected_output included.
export const listTestCases = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT id, kind, input, expected_output, explanation, position
       FROM test_cases WHERE question_id = $1 ORDER BY position`,
    [questionID],
  );
  return rows;
};

// Deletes only within the given question, so a stray id from another question
// cannot be removed. Returns the deleted id, or null if it did not match.
export const deleteTestCase = async ({ questionID, id }) => {
  const { rows } = await pool.query(
    "DELETE FROM test_cases WHERE id = $1 AND question_id = $2 RETURNING id",
    [id, questionID],
  );
  return rows[0] ?? null;
};

// Public: sample cases only. Hidden cases (input and expected output) must
// never leave the backend to a solver.
export const listSampleTestCases = async (questionID) => {
  const { rows } = await pool.query(
    `SELECT id, input, expected_output, explanation, position
       FROM test_cases WHERE question_id = $1 AND kind = 'sample' ORDER BY position`,
    [questionID],
  );
  return rows;
};

// Just what the worker needs: id + input, ordered, for every case. The worker
// gets no expected outputs -- comparison happens back here.
export const listRunnableTestCases = async (questionID) => {
  const { rows } = await pool.query(
    "SELECT id, input FROM test_cases WHERE question_id = $1 ORDER BY position",
    [questionID],
  );
  return rows;
};

// Everything judging needs per case, keyed by id: the kind decides how much of
// this the result may expose (sample = show input/expected/actual, hidden =
// pass/fail only), the expected output decides the verdict.
export const caseDataFor = async (questionID) => {
  const { rows } = await pool.query(
    "SELECT id, kind, input, expected_output FROM test_cases WHERE question_id = $1",
    [questionID],
  );
  return new Map(
    rows.map((r) => [
      r.id,
      { kind: r.kind, input: r.input, expected: r.expected_output },
    ]),
  );
};

// Store the reference solution's outputs as the expected outputs, all or
// nothing. Called once when a question is generated.
export const setExpectedOutputs = async (outputs) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const { id, output } of outputs) {
      await client.query("UPDATE test_cases SET expected_output = $2 WHERE id = $1", [
        id,
        output,
      ]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// counts by kind, so the route can enforce "at least 3 samples" before generating
export const countByKind = async (questionID) => {
  const { rows } = await pool.query(
    "SELECT kind, count(*)::int AS n FROM test_cases WHERE question_id = $1 GROUP BY kind",
    [questionID],
  );
  const counts = { sample: 0, hidden: 0 };
  for (const r of rows) counts[r.kind] = r.n;
  return counts;
};
