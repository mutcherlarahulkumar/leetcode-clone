import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { IMAGES } from "../constants/images.js";

const exec = promisify(execFile);
const resolved = new Map(); // language -> "repo@sha256:..."
const docker = (args) => exec("docker", args, { timeout: 30_000 });

const pull = (image) =>
  new Promise((resolve, reject) => {
    const child = spawn("docker", ["pull", image], { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`docker pull ${image} exited ${code}`)),
    );
  });

const isPresent = async (image) => {
  try {
    await docker(["image", "inspect", image]);
    return true;
  } catch {
    return false;
  }
};

const digestFor = async (image) => {
  const { stdout } = await docker([
    "image",
    "inspect",
    "--format",
    "{{if .RepoDigests}}{{index .RepoDigests 0}}{{end}}",
    image,
  ]);
  const repoDigest = stdout.trim();
  if (!repoDigest) {
    console.warn(`no digest for ${image}, falling back to the tag`);
    return image;
  }
  return repoDigest;
};

// Pull every image and pin to a digest. Called once at startup so the first
// submission does not pay for a download and a broken docker setup fails the
// worker at boot rather than mid-submission.
export const ensureImages = async () => {
  try {
    const { stdout } = await docker(["version", "--format", "{{.Server.Version}}"]);
    console.log("docker daemon", stdout.trim());
  } catch (err) {
    throw new Error(`docker daemon is not reachable: ${err.message.split("\n")[0]}`);
  }

  for (const [language, image] of Object.entries(IMAGES)) {
    if (await isPresent(image)) {
      console.log(`${language}: ${image} already present`);
    } else {
      console.log(`${language}: pulling ${image} ...`);
      await pull(image);
    }
    resolved.set(language, await digestFor(image));
  }
  for (const [language, ref] of resolved) console.log(`${language} -> ${ref}`);
};

export const imageFor = (language) => {
  const image = resolved.get(language);
  if (!image) throw new Error(`no image prepared for language: ${language}`);
  return image;
};
