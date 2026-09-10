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

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          varchar(90) NOT NULL,
    -- 254 is the practical RFC limit for an address
    email         varchar(254) NOT NULL UNIQUE,
    -- scrypt "salt:hash", hex
    password_hash text NOT NULL
);

CREATE TABLE languages (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug       varchar(20) NOT NULL UNIQUE,
    -- what the submitter sees in a dropdown
    name       varchar(50) NOT NULL,
    -- the toolchain version actually installed in the worker's image
    version    varchar(20) NOT NULL,
    -- retire a language without deleting rows that reference it
    is_enabled boolean NOT NULL DEFAULT true
);

CREATE TABLE submissions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text NOT NULL,
    status      submission_status NOT NULL DEFAULT 'not_applicable',
    question_id uuid,
    language_id uuid NOT NULL REFERENCES languages (id),
    output      text,
    user_id     uuid NOT NULL REFERENCES users (id)
);

-- Versions match the images the worker pulls in worker/constants/images.js.
INSERT INTO languages (slug, name, version) VALUES
    ('cpp', 'C++',        '14'),
    ('ts',  'TypeScript', '24'),
    ('go',  'Go',         '1.23');
