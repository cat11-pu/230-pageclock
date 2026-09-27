// clock.js：扫一圈找可替换的格子（二次机会：引用位为一先清零前进，遇到零就停下）
export function sweepOnce(refs, cursor) {
  const total = refs.length;
  let cleared = 0;
  for (let step = 0; step < total; step += 1) {
    const slot = (cursor + step) % total;
    if (refs[slot]) {
      refs[slot] = false;
      cleared += 1;
    } else {
      return { slot: slot, cursor: slot, cleared: cleared };
    }
  }
  return { slot: -1, cursor: cursor, cleared: cleared };
}
