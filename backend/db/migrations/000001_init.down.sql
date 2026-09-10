-- reverse dependency order: submissions -> languages/users
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS submission_status;
