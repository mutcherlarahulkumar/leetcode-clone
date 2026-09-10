import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { IMAGES } from "../constants/images.js";

const exec = promisify(execFile);

// language -> "gcc@sha256:...", filled in by ensureImages()
const resolved = new Map();

const docker = (args) => exec("docker", args, { timeout: 30_000 });

// Streams progress to our stdout instead of buffering it: a pull is slow and
// silent output looks like a hang.
const pull = (image) =>
  new Promise((resolve, reject) => {
    const child = spawn("docker", ["pull", image], { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`docker pull ${image} exited ${code}`)),
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

// A tag is a moving target -- whoever owns it can repoint it at new content.
// The digest is content-addressed, so running it means running exactly what we
// verified at startup.
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
    // locally built images have no registry digest; fall back to the tag
    console.warn(`no digest for ${image}, falling back to the tag`);
    return image;
  }
  return repoDigest;
};

/**
 * Pull every language image and pin it to a digest. Call once at startup:
 * doing it here means the first submission does not pay for a multi-hundred-MB
 * download, and a missing image or a dead docker daemon fails the worker at
 * boot rather than surfacing as a mysterious failed submission later.
 */
export const ensureImages = async () => {
  try {
    const { stdout } = await docker(["version", "--format", "{{.Server.Version}}"]);
    console.log("docker daemon", stdout.trim());
  } catch (err) {
    throw new Error(
      `docker daemon is not reachable: ${err.message.split("\n")[0]}`,
    );
  }

  for (const [language, image] of Object.entries(IMAGES)) {
    // Skip the registry round trip when the image is already local, so restarts
    // are instant and a network blip does not stop the worker booting.
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

/** The digest-pinned image to run for a language. */
export const imageFor = (language) => {
  const image = resolved.get(language);
  if (!image) {
    // either ensureImages() was never awaited, or the language is not supported
    throw new Error(`no image prepared for language: ${language}`);
  }
  return image;
};
