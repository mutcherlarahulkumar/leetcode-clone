-- reverse dependency order
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS question_templates;
DROP TABLE IF EXISTS solutions;
DROP TABLE IF EXISTS test_cases;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS test_case_kind;
DROP TYPE IF EXISTS question_status;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS submission_status;
