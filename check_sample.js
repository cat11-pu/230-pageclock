import fs from "node:fs";
import { sweepOnce } from "./clock.js";
import { runVisits } from "./pager.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/visits.json", "utf8"));
const view = render(spec);

emit("命中次数 =", view.hits);
emit("缺页次数 =", view.misses);
emit("驱逐次数 =", view.evictions);
emit("驱逐页列表 =", JSON.stringify(view.evicted));
emit("驻留页列表 =", JSON.stringify(view.resident));
emit("收尾指针位置 =", view.cursor_end);
emit("访问次数 =", view.count);
emit("缓存复核 =", view.cache_ok);
emit("空引用位起扫 =", view.tail);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  runVisits({ capacity: 0, visits: [] });
  emit("容量写错的错误码", "没有报错");
} catch (error) {
  emit("容量写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  runVisits({ capacity: 2, visits: [-1] });
  emit("访问页写错的错误码", "没有报错");
} catch (error) {
  emit("访问页写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "命中次数": 2,
  "缺页次数": 6,
  "驱逐次数": 3,
  "驱逐页列表": [
    1,
    2,
    3
  ],
  "驻留页列表": [
    4,
    1,
    5
  ],
  "收尾指针位置": 0,
  "访问次数": 8,
  "缓存复核": true,
  "空引用位起扫": 0,
  "容量写错的错误码": "E_BAD_CAPACITY",
  "访问页写错的错误码": "E_BAD_PAGE"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
