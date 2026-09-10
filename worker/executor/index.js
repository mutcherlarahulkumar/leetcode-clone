export const runInSandbox = async ({ language, code, stdin = "" }) => {
  // TODO: implement the docker driver, then export it from executor/docker.js
  // and select it here by env (EXECUTOR=stub|docker) so it can be rolled back
  // without a redeploy.
  //
  // 1. IMAGE, one per language, pinned by digest not tag. Pre-pull on worker
  //    start so the first submission does not pay for an image download.
  //
  // 2. SPAWN. `docker run --rm -i` with, at minimum:
  //      --network none                      no egress at all
  //      --memory 256m --memory-swap 256m    equal, or it swaps past the cap
  //      --cpus 0.5
  //      --pids-limit 64                     fork bombs
  //      --read-only
  //      --tmpfs /tmp:rw,exec,nosuid,size=64m   `exec` is required, see below
  //      --cap-drop ALL
  //      --security-opt no-new-privileges
  //      --user 65534:65534                  never root
  //      --label judge=1                     so orphans can be swept
  //    Pass code and stdin in over stdin; read stdout/stderr back.
  //
  //    GOTCHA, confirmed on docker 26: --tmpfs defaults to noexec, and listing
  //    your own options does NOT drop it. Without an explicit `exec` a C++ or
  //    Go binary compiles fine and then dies with "Permission denied" on the
  //    run step. Compile and execute inside that tmpfs, rootfs stays read-only.
  //
  // 3. TIMEOUTS, three layers, because each one can fail on its own:
  //      a) `timeout` inside the container around the run step
  //      b) this process's wall clock -> docker kill
  //      c) spawn timeout -> SIGKILL the docker CLI itself
  //    Compile and run need separate budgets, see constants/limits.js.
  //
  // 4. OUTPUT CAP. Count bytes as they stream and kill the container past
  //    MAX_OUTPUT_BYTES. Do not buffer everything and truncate afterwards --
  //    that is the same out-of-memory this is meant to prevent.
  //
  // 5. MAP THE OUTCOME to a Status:
  //      compiler exited non-zero        -> compile_error
  //      killed by the timeout           -> timeout
  //      OOM-killed (exit 137 / cgroup)  -> memory_exceeded
  //      ran, non-zero exit              -> runtime_error
  //      ran, exit 0                     -> accepted for now; once test cases
  //                                         exist, compare against the expected
  //                                         output and pick accepted or
  //                                         wrong_answer
  //      docker itself failed            -> error, that one is ours not theirs
  //
  // 6. ORPHANS. --rm covers a normal exit, but a worker killed mid-run leaves
  //    the container behind. Sweep `--filter label=judge=1` on startup and
  //    periodically, killing anything older than the max deadline.
  //
  // SECURITY BOUNDARY: whatever holds the docker socket is root on the host, so
  // it must never be the thing running user code. Keep this process as the
  // supervisor -- it spawns the sandbox and never evaluates anything itself.
  throw new Error(`executor not implemented (language: ${language})`);
};
