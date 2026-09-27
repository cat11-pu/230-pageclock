// clock.js：扫一圈找可替换的格子（二次机会：引用位为一先清零并前进）
export function sweepOnce(refs, cursor) {
  const n = refs.length;
  if (n === 0) {
    return { slot: -1, cursor: cursor, cleared: 0 };
  }
  let pos = ((cursor % n) + n) % n;
  let cleared = 0;
  for (let steps = 0; steps < n; steps += 1) {
    if (refs[pos]) {
      refs[pos] = false;
      cleared += 1;
      pos = (pos + 1) % n;
    } else {
      return { slot: pos, cursor: pos, cleared: cleared };
    }
  }
  return { slot: -1, cursor: pos, cleared: cleared };
}
