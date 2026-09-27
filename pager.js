// pager.js：二次机会页缓存（基线：一律给零）
import { sweepOnce } from "./clock.js";

export function runVisits(spec) {
  return { hits: 0, misses: 0, evictions: 0, evicted: [], resident: [], cursor_end: 0 };
}
