// One image per language. These are the official upstream images, which is the
// quickest way to get running -- later they become small purpose-built images
// with only a compiler and no shell, package manager or network tools.
//
// Tags here are only the starting point: ensureImages() resolves each one to a
// digest at startup and the sandbox runs the digest, so the image cannot change
// underneath a running worker.
export const IMAGES = Object.freeze({
  cpp: "gcc:14-bookworm",
  ts: "node:24-alpine",
  go: "golang:1.23-alpine",
});
