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

CREATE TYPE user_role AS ENUM ('user', 'admin');

-- A question is not live until its reference solution has been run against every
-- test case to produce the expected outputs.
CREATE TYPE question_status AS ENUM (
    'draft',
    'generating',
    'ready',
    'generation_failed'
);

CREATE TYPE test_case_kind AS ENUM ('sample', 'hidden');

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          varchar(90) NOT NULL,
    -- 254 is the practical RFC limit for an address
    email         varchar(254) NOT NULL UNIQUE,
    -- scrypt "salt:hash", hex
    password_hash text NOT NULL,
    role          user_role NOT NULL DEFAULT 'user'
);

-- A table, not an enum, so a version can change and a language can be retired
-- without a migration. slug is the only field sent to the worker and must match
-- a key in worker/constants/images.js -- a new row does NOT make a language
-- runnable, the worker image is added manually.
CREATE TABLE languages (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug       varchar(20) NOT NULL UNIQUE,
    name       varchar(50) NOT NULL,
    version    varchar(20) NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true
);

-- The statement is stored whole as markdown: problem scenario (mermaid renders
-- on the frontend), key highlights, description, constraints. Sample cases are
-- NOT embedded here -- they are test_cases rows the frontend merges into the
-- rendered page. hints/misconceptions are optional structured data.
CREATE TABLE questions (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title      varchar(200) NOT NULL,
    slug       varchar(200) NOT NULL UNIQUE,
    statement  text NOT NULL,
    hints      jsonb,
    status     question_status NOT NULL DEFAULT 'draft',
    created_by uuid NOT NULL REFERENCES users (id),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE test_cases (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id     uuid NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    kind            test_case_kind NOT NULL,
    input           text NOT NULL,
    -- null until the reference solution has been run to generate it
    expected_output text,
    -- shown to submitters, for sample cases
    explanation     text,
    position        integer NOT NULL,
    UNIQUE (question_id, position)
);

CREATE INDEX test_cases_question_id_idx ON test_cases (question_id, position);

-- An admin can store many solutions per question. The reference one produces the
-- expected outputs; the rest are validated against them. metrics (per-test-case
-- time/memory) are filled when the solution is run.
CREATE TABLE solutions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id  uuid NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    language_id  uuid NOT NULL REFERENCES languages (id),
    code         text NOT NULL,
    is_reference boolean NOT NULL DEFAULT false,
    metrics      jsonb,
    status       submission_status NOT NULL DEFAULT 'not_applicable',
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- at most one reference solution per question
CREATE UNIQUE INDEX solutions_one_reference_idx
    ON solutions (question_id) WHERE is_reference;

CREATE TABLE submissions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code         text NOT NULL,
    status       submission_status NOT NULL DEFAULT 'not_applicable',
    question_id  uuid NOT NULL REFERENCES questions (id),
    language_id  uuid NOT NULL REFERENCES languages (id),
    output       text,
    -- filled when the submission is judged against the question's test cases
    passed_count integer NOT NULL DEFAULT 0,
    total_count  integer NOT NULL DEFAULT 0,
    results      jsonb,
    user_id      uuid NOT NULL REFERENCES users (id),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX submissions_user_id_idx ON submissions (user_id, created_at DESC);

-- Versions match the images the worker pulls in worker/constants/images.js.
INSERT INTO languages (slug, name, version) VALUES
    ('cpp', 'C++',        '14'),
    ('ts',  'TypeScript', '24'),
    ('go',  'Go',         '1.23');
