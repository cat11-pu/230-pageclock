// pager.js：二次机会页缓存
import { sweepOnce } from "./clock.js";

function badCapacity() {
  const error = new Error("capacity must be a positive integer");
  error.code = "E_BAD_CAPACITY";
  return error;
}

function badPage(page) {
  const error = new Error("page must be a non-negative integer: " + String(page));
  error.code = "E_BAD_PAGE";
  return error;
}

export function runVisits(spec) {
  const capacity = spec && spec.capacity;
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw badCapacity();
  }
  const visits = spec && Array.isArray(spec.visits) ? spec.visits : [];

  const pages = new Array(capacity).fill(-1);
  const refs = new Array(capacity).fill(false);
  const location = new Map();
  const evicted = [];
  let hits = 0;
  let misses = 0;
  let cursor = 0;

  for (const page of visits) {
    if (!Number.isInteger(page) || page < 0) {
      throw badPage(page);
    }

    const hitSlot = location.get(page);
    if (hitSlot !== undefined) {
      refs[hitSlot] = true;
      hits += 1;
      continue;
    }
    misses += 1;

    let sweep = sweepOnce(refs, cursor);
    if (sweep.slot === -1) {
      sweep = sweepOnce(refs, sweep.cursor);
    }
    const slot = sweep.slot;
    const oldPage = pages[slot];
    if (oldPage !== -1) {
      location.delete(oldPage);
      evicted.push(oldPage);
    }

    pages[slot] = page;
    refs[slot] = true;
    location.set(page, slot);
    cursor = (slot + 1) % capacity;
  }

  return {
    hits: hits,
    misses: misses,
    evictions: evicted.length,
    evicted: evicted,
    resident: pages,
    cursor_end: cursor
  };
}
