// Generous for a single solution file, small enough to keep junk out of the db.
export const MAX_SOLUTION_LENGTH = 100_000;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;
export const MAX_NAME_LENGTH = 100;

// Question authoring
export const MAX_TITLE_LENGTH = 200;
export const MAX_SLUG_LENGTH = 200;
export const MAX_STATEMENT_LENGTH = 50_000;
export const MAX_TEST_INPUT_LENGTH = 100_000;
export const MAX_EXPLANATION_LENGTH = 5_000;

// Language slug/name/version (must fit the varchar columns)
export const MAX_LANG_SLUG_LENGTH = 20;
export const MAX_LANG_NAME_LENGTH = 50;
export const MAX_LANG_VERSION_LENGTH = 20;

// A question needs at least this many sample cases before it can be generated,
// and no more than this many cases total (bounds the per-job run time).
export const MIN_SAMPLE_CASES = 3;
export const MAX_TEST_CASES = 50;
