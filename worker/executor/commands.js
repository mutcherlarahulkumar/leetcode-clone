import { RUN_TIMEOUT_MS } from "../constants/limits.js";

const RUN_SECONDS = Math.ceil(RUN_TIMEOUT_MS / 1000);

// Per language: file extension, an optional compile step, and how to run the
// built program. Single self-contained files only -- there is no network, so
// nothing can be fetched or installed.
const LANGUAGES = {
  cpp: {
    ext: "cpp",
    compile: "g++ -O2 -o /tmp/prog /tmp/src.cpp",
    run: "/tmp/prog",
    env: {},
  },
  // node strips TypeScript types rather than checking them: no compile step,
  // and a type error simply is not detected.
  ts: {
    ext: "ts",
    compile: null,
    run: "node /tmp/src.ts",
    env: {},
  },
  // the toolchain writes caches and the rootfs is read-only, so point them at tmpfs
  go: {
    ext: "go",
    compile: "cd /tmp && go build -o /tmp/prog /tmp/src.go",
    run: "/tmp/prog",
    env: { HOME: "/tmp", GOCACHE: "/tmp/.gocache", GOPATH: "/tmp/.go" },
  },
};

// The driver runs inside the container. It compiles once, then runs the program
// once per test case, feeding that case's input on stdin and capturing its
// stdout. Every line it emits is a marker the Node side parses:
//   ##COMPILE## <base64 stderr>     compile failed, no cases run
//   ##CASE## <index> <rc> <base64 stdout>
// The program's own stdout goes to a file, never mixed with these markers.
// base64 is piped through `tr -d` because busybox base64 wraps by default.
const buildScript = ({ ext, compile, run }) => {
  // subshell around the compile so a compound command (e.g. go's "cd && build")
  // is negated as a whole -- `if ! cd && build` would parse as `(! cd) && build`
  // and never run the build.
  const compileBlock = compile
    ? `if ! ( ${compile} ) 2>/tmp/cerr; then
  printf '##COMPILE## '
  base64 /tmp/cerr | tr -d '\\n'
  printf '\\n'
  exit 0
fi
`
    : "";

  return `set -u
echo "$SOURCE_B64" | base64 -d > /tmp/src.${ext}
${compileBlock}i=0
printf '%s\\n' "$INPUTS_B64" | while IFS= read -r line; do
  printf '%s' "$line" | base64 -d > /tmp/in
  timeout -k 1 ${RUN_SECONDS} sh -c '${run} < /tmp/in > /tmp/out 2>/tmp/err'
  rc=$?
  [ $rc -eq 124 ] && rc=92
  [ $rc -eq 143 ] && rc=92
  printf '##CASE## %s %s ' "$i" "$rc"
  base64 /tmp/out | tr -d '\\n'
  printf '\\n'
  i=$((i + 1))
done
`;
};

export const commandFor = (language) => {
  const entry = LANGUAGES[language];
  if (!entry) throw new Error(`no run command for language: ${language}`);
  return { env: entry.env, script: buildScript(entry) };
};
