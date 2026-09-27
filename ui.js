// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "容量 " + (spec.capacity || 0) + "，访问 " + (spec.visits || []).length + " 次。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (view.resident || []).forEach(function (page, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "槽位 " + spot;
      row.appendChild(head);
      const mark = document.createElement("span");
      mark.className = "chip" + (spot === view.cursor_end ? " ok" : "");
      mark.textContent = page === -1 ? "空槽" : "驻留页 " + page;
      row.appendChild(mark);
      if (spot === view.cursor_end) {
        const flag = document.createElement("span");
        flag.className = "chip warn";
        flag.textContent = "指针在这";
        row.appendChild(flag);
      }
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "命中 " + view.hits + " 次，缺页 " + view.misses + " 次，驱逐 "
      + view.evictions + " 次";
    parts.log.textContent = view.count + " 次访问，驱逐顺序 " + JSON.stringify(view.evicted);
  }

  const pageInput = document.createElement("input");
  pageInput.type = "number";
  pageInput.value = "2";
  parts.controls.appendChild(pageInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "跑一遍";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一次访问";
  addButton.addEventListener("click", function () {
    const next = Number(pageInput.value);
    spec.visits = (spec.visits || []).concat([Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一次访问";
  dropButton.addEventListener("click", function () {
    spec.visits = (spec.visits || []).slice(0, Math.max(0, (spec.visits || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  const wideButton = document.createElement("button");
  wideButton.textContent = "容量加一";
  wideButton.addEventListener("click", function () {
    spec.capacity = (spec.capacity || 1) + 1;
    draw();
  });
  parts.controls.appendChild(wideButton);

  draw();
}
