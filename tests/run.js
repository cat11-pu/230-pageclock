import assert from "node:assert";
import { sweepOnce } from "../clock.js";
import { runVisits } from "../pager.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("sweepOnce returns a slot", () => {
  assert.strictEqual(typeof sweepOnce([false], 0).slot, "number");
});

check("runVisits returns hits", () => {
  assert.strictEqual(typeof runVisits({ capacity: 1, visits: [] }).hits, "number");
});

check("runVisits returns evicted", () => {
  assert.ok(Array.isArray(runVisits({ capacity: 1, visits: [] }).evicted));
});

check("render counts visits", () => {
  assert.strictEqual(typeof render({ capacity: 1, visits: [] }).count, "number");
});

check("render exposes cache flag", () => {
  assert.strictEqual(typeof render({ capacity: 1, visits: [] }).cache_ok, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
