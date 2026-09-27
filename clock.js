// clock.js：扫一圈找可替换的格子（基线：一律给零号格）
export function sweepOnce(refs, cursor) {
  return { slot: 0, cursor: cursor, cleared: 0 };
}
