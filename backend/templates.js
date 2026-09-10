// The token in a harness that the submitted code replaces. The admin's harness
// reads stdin, calls the solution, and prints the result; the user's function
// lands here. Assembly happens on the backend, so the worker keeps running a
// single complete program with no knowledge of templates.
export const SOLUTION_PLACEHOLDER = "{{SOLUTION}}";

export const harnessHasPlaceholder = (harness) =>
  harness.includes(SOLUTION_PLACEHOLDER);

export const assembleProgram = (harness, code) =>
  harness.split(SOLUTION_PLACEHOLDER).join(code);
