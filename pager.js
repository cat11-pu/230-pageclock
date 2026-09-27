// pager.js：二次机会页缓存（clock 置换）
import { sweepOnce } from "./clock.js";

function badCapacity() {
  const error = new Error("capacity must be a positive integer");
  error.code = "E_BAD_CAPACITY";
  return error;
}

function badPage() {
  const error = new Error("page must be a non-negative integer");
  error.code = "E_BAD_PAGE";
  return error;
}

export function runVisits(spec) {
  const source = spec == null ? {} : spec;
  const capacity = source.capacity;
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw badCapacity();
  }
  const visits = source.visits;
  if (!Array.isArray(visits)) {
    throw badPage();
  }
  for (const page of visits) {
    if (!Number.isInteger(page) || page < 0) {
      throw badPage();
    }
  }

  const pages = new Array(capacity).fill(-1);
  const refs = new Array(capacity).fill(false);
  const slotOf = new Map();
  let cursor = 0;
  let hits = 0;
  let misses = 0;
  let evictions = 0;
  const evicted = [];

  for (const page of visits) {
    const where = slotOf.has(page) ? slotOf.get(page) : -1;
    if (where !== -1) {
      refs[where] = true;
      hits += 1;
      continue;
    }

    misses += 1;
    let sweep = sweepOnce(refs, cursor);
    if (sweep.slot === -1) {
      sweep = sweepOnce(refs, sweep.cursor);
    }
    const slot = sweep.slot;
    if (pages[slot] !== -1) {
      evicted.push(pages[slot]);
      evictions += 1;
      slotOf.delete(pages[slot]);
    }
    pages[slot] = page;
    slotOf.set(page, slot);
    refs[slot] = true;
    cursor = (slot + 1) % capacity;
  }

  return {
    hits: hits,
    misses: misses,
    evictions: evictions,
    evicted: evicted,
    resident: pages.slice(),
    cursor_end: cursor
  };
}
