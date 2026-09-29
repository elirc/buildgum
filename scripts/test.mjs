import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
mkdirSync(".verification", { recursive: true });
const compile = spawnSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.test.json"],
  { encoding: "utf8", timeout: 180000 },
);
process.stdout.write(compile.stdout || "");
process.stderr.write(compile.stderr || "");
if (compile.status !== 0) process.exit(1);
writeFileSync(".verification/package.json", '{"type":"commonjs"}');
const result = spawnSync(
  process.execPath,
  ["--test", "--test-reporter=tap", "test/model.cjs"],
  { encoding: "utf8", timeout: 180000 },
);
const output = (result.stdout || "") + (result.stderr || "");
process.stdout.write(output);
writeFileSync(".verification/unit.log", output);
const total = Number(output.match(/# tests (\d+)/)?.[1] || 0);
const passed = Number(output.match(/# pass (\d+)/)?.[1] || 0);
writeFileSync(
  ".verification/unit-results.json",
  JSON.stringify(
    {
      passed: result.status === 0 && total > 0 && total === passed,
      total,
      passedTests: passed,
    },
    null,
    2,
  ),
);
process.exit(result.status === 0 && total > 0 ? 0 : 1);
