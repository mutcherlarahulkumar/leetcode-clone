CREATE TYPE submission_status AS ENUM (
    -- the row exists but nothing has been queued for it yet
    'not_applicable',
    -- queued, the code has not been run yet
    'pending',
    -- ran and matched the expected output on every test case
    'accepted',
    -- ran to completion but the output differed on at least one test case
    'wrong_answer',
    -- the code never built
    'compile_error',
    -- built, but crashed or exited non-zero while running
    'runtime_error',
    -- exceeded the wall clock limit and was killed
    'timeout',
    -- exceeded the memory limit and was killed
    'memory_exceeded',
    -- our failure, not the submitter's: the sandbox or the infrastructure broke
    'error'
);

CREATE TYPE language AS ENUM ('cpp', 'ts', 'go');

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          varchar(90) NOT NULL,
    -- 254 is the practical RFC limit for an address
    email         varchar(254) NOT NULL UNIQUE,
    -- scrypt "salt:hash", hex
    password_hash text NOT NULL
);

CREATE TABLE submissions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text NOT NULL,
    status      submission_status NOT NULL DEFAULT 'not_applicable',
    question_id uuid,
    language    language,
    output      text,
    user_id     uuid NOT NULL REFERENCES users (id)
);
