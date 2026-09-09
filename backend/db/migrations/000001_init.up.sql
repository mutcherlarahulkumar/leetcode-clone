CREATE TYPE submission_status AS ENUM (
    'not_applicable',
    'pending',
    'accepted',
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
    status      submission_status NOT NULL,
    question_id uuid,
    language    language,
    output      text,
    user_id     uuid NOT NULL REFERENCES users (id)
);
