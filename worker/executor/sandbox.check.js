// node --env-file=.env executor/sandbox.check.js
import assert from "node:assert";
import { ensureImages } from "./images.js";
import { runInSandbox, CaseStatus } from "./index.js";

await ensureImages();

const tc = (id, input) => ({ id, input });
let failures = 0;
const check = (label, cond, extra = "") => {
  if (cond) console.log(`ok   ${label}`);
  else {
    failures++;
    console.log(`FAIL ${label}  ${extra}`);
  }
};

// C++ sum-of-two, three cases
{
  const r = await runInSandbox({
    language: "cpp",
    code: "#include<iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b<<endl;}",
    testCases: [tc("a", "2 40"), tc("b", "10 5"), tc("c", "0 0")],
  });
  check("cpp compiled", r.compiled === true, r.compileOutput);
  check(
    "cpp 3 cases correct",
    r.cases.length === 3 &&
      r.cases[0].output.trim() === "42" &&
      r.cases[1].output.trim() === "15" &&
      r.cases[2].output.trim() === "0" &&
      r.cases.every((c) => c.status === CaseStatus.ok),
    JSON.stringify(r.cases),
  );
}

// Go reads stdin per case
{
  const r = await runInSandbox({
    language: "go",
    code: 'package main\nimport "fmt"\nfunc main(){var a,b int;fmt.Scan(&a,&b);fmt.Println(a*b)}',
    testCases: [tc("a", "6 7"), tc("b", "3 3")],
  });
  check(
    "go 2 cases correct",
    r.compiled && r.cases[0].output.trim() === "42" && r.cases[1].output.trim() === "9",
    JSON.stringify(r.cases),
  );
}

// TS reads stdin per case
{
  const r = await runInSandbox({
    language: "ts",
    code: 'const [a,b]=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number);console.log(a+b);',
    testCases: [tc("a", "20 22"), tc("b", "1 1")],
  });
  check(
    "ts 2 cases correct",
    r.cases[0].output.trim() === "42" && r.cases[1].output.trim() === "2",
    JSON.stringify(r.cases),
  );
}

// empty input is a valid case
{
  const r = await runInSandbox({
    language: "ts",
    code: 'const s=require("fs").readFileSync(0,"utf8");console.log("len="+s.length);',
    testCases: [tc("a", "")],
  });
  check("empty input handled", r.cases[0].output.trim() === "len=0", JSON.stringify(r.cases));
}

// compile error -> compiled:false, no cases
{
  const r = await runInSandbox({
    language: "cpp",
    code: "int main(){ this is broken }",
    testCases: [tc("a", "1")],
  });
  check("compile error reported", r.compiled === false && /error/i.test(r.compileOutput));
}

// per-case timeout: only the slow case times out, others run
{
  const r = await runInSandbox({
    language: "ts",
    code: 'const n=require("fs").readFileSync(0,"utf8").trim();if(n==="slow"){while(true){}}console.log("fast:"+n);',
    testCases: [tc("a", "1"), tc("b", "slow"), tc("c", "3")],
  });
  check(
    "timeout is per-case, not whole-job",
    r.cases[0].status === CaseStatus.ok &&
      r.cases[1].status === CaseStatus.timeout &&
      r.cases[2].status === CaseStatus.ok &&
      r.cases[2].output.trim() === "fast:3",
    JSON.stringify(r.cases.map((c) => c.status)),
  );
}

// runtime crash on one case
{
  const r = await runInSandbox({
    language: "ts",
    code: 'const n=require("fs").readFileSync(0,"utf8").trim();if(n==="boom")throw new Error("x");console.log(n);',
    testCases: [tc("a", "ok"), tc("b", "boom")],
  });
  check(
    "runtime error is per-case",
    r.cases[0].status === CaseStatus.ok && r.cases[1].status === CaseStatus.runtime_error,
    JSON.stringify(r.cases.map((c) => c.status)),
  );
}

console.log(failures === 0 ? "\nall executor checks passed" : `\n${failures} FAILED`);
assert.equal(failures, 0);
process.exit(0);
