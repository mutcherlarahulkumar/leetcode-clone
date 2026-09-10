// One image per language slug. These slugs are the contract with the backend
// languages table -- a language row whose slug is not here cannot be run.
// Tags are the starting point; ensureImages() pins each to a digest at startup.
export const IMAGES = Object.freeze({
  cpp: "gcc:14-bookworm",
  ts: "node:24-alpine",
  go: "golang:1.23-alpine",
});
