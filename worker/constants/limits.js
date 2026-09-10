// Per-submission sandbox budget. Every one of these needs a matching flag on
// the container -- a limit that only exists here is not a limit.
export const MEMORY_MB = 256;
export const CPUS = 0.5;
export const PIDS_LIMIT = 256;
export const COMPILE_TIMEOUT_MS = 40_000;
export const RUN_TIMEOUT_MS = 5_000;
export const MAX_OUTPUT_BYTES = 64 * 1024;
