// app.js：渲染结果
import { sweepOnce } from "./clock.js";
import { runVisits } from "./pager.js";

export function render(spec) {
  const capacity = spec.capacity || 0;
  const visits = spec.visits || [];
  const view = runVisits(spec);
  const resident = view.resident || [];
  const filled = resident.filter(function (page) { return page !== -1; }).length;
  return { hits: view.hits || 0, misses: view.misses || 0, evictions: view.evictions || 0,
           evicted: view.evicted || [], resident: resident, cursor_end: view.cursor_end || 0,
           count: visits.length,
           cache_ok: resident.length === capacity && filled <= capacity,
           tail: sweepOnce([false], 0).slot };
}
