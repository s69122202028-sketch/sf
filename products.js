/* ============================================================
   products.js — หน้าสินค้า
   • ตัวกรองปกติ (รุ่น / ประเภทเคส / ลาย / คำค้นหา) รวมกันด้วย "Intersection"
   • ปุ่มลัด 3 ปุ่ม สาธิต Union / Intersection / Difference แบบตรงตัวโจทย์
   ============================================================ */

const state = {
  models: new Set(),   // เซตรุ่นที่เลือก
  types: new Set(),    // เซตประเภทเคสที่เลือก
  styles: new Set(),   // เซตลายที่เลือก
  search: "",
  setop: null,         // 'union' | 'intersection' | 'difference' | null
};

function initFromQuery() {
  const q = new URLSearchParams(location.search);
  if (q.get("type")) state.types.add(q.get("type"));
  if (q.get("model")) state.models.add(q.get("model"));
}

function renderFilterOptions() {
  const modelBox = document.getElementById("f-models");
  modelBox.innerHTML = MODELS.map(
    (m) => `
    <label class="opt">
      <input type="checkbox" value="${m.id}" data-fmodel ${state.models.has(m.id) ? "checked" : ""}/>
      <span class="swatch" style="width:10px;height:10px;border-radius:50%;background:${m.color};display:inline-block"></span>
      ${m.name}
    </label>`
  ).join("");

  const typeBox = document.getElementById("f-types");
  typeBox.innerHTML = Object.keys(TYPES).map(
    (t) => `
    <label class="opt">
      <input type="checkbox" value="${t}" data-ftype ${state.types.has(t) ? "checked" : ""}/>
      ${TYPES[t].icon} ${TYPES[t].label}
    </label>`
  ).join("");

  const styleBox = document.getElementById("f-styles");
  styleBox.innerHTML = Object.keys(STYLES).map(
    (s) => `
    <label class="opt">
      <input type="checkbox" value="${s}" data-fstyle ${state.styles.has(s) ? "checked" : ""}/>
      ${STYLES[s].label}
    </label>`
  ).join("");

  modelBox.querySelectorAll("[data-fmodel]").forEach((cb) =>
    cb.addEventListener("change", () => {
      toggleSetVal(state.models, cb.value, cb.checked);
      state.setop = null;
      renderAll();
    })
  );
  typeBox.querySelectorAll("[data-ftype]").forEach((cb) =>
    cb.addEventListener("change", () => {
      toggleSetVal(state.types, cb.value, cb.checked);
      state.setop = null;
      renderAll();
    })
  );
  styleBox.querySelectorAll("[data-fstyle]").forEach((cb) =>
    cb.addEventListener("change", () => {
      toggleSetVal(state.styles, cb.value, cb.checked);
      state.setop = null;
      renderAll();
    })
  );
}

function toggleSetVal(set, val, checked) {
  if (checked) set.add(val);
  else set.delete(val);
}

/* ---------- ตัวกรองหลัก: รวมเงื่อนไขด้วย AND (Intersection เชิงตรรกะ) ---------- */
function filterProducts() {
  const q = state.search.trim().toLowerCase();

  let list = PRODUCTS.filter((p) => {
    const passModel = state.models.size === 0 || state.models.has(p.model);
    const passType = state.types.size === 0 || state.types.has(p.type);
    const passStyle = state.styles.size === 0 || state.styles.has(p.style);
    const passSearch = !q || p.name.toLowerCase().includes(q) || p.modelName.toLowerCase().includes(q);
    return passModel && passType && passStyle && passSearch;
  });

  // ---------- ปุ่มสาธิต Set Operation แบบระบุชัดตามโจทย์ ----------
  if (state.setop === "union") {
    // สินค้าที่เป็น "ซิลิโคน/TPU" (soft) UNION "พลาสติก PC" (hard)
    const idsA = new Set(PRODUCTS.filter((p) => p.type === "soft").map((p) => p.id));
    const idsB = new Set(PRODUCTS.filter((p) => p.type === "hard").map((p) => p.id));
    const idsUnion = union(idsA, idsB);
    list = PRODUCTS.filter((p) => idsUnion.has(p.id));
  } else if (state.setop === "intersection") {
    // สินค้าที่เป็น "เคสแฟชั่น" AND ลาย "มินิมอลเรียบ" (Intersection)
    const idsA = new Set(PRODUCTS.filter((p) => p.type === "fashion").map((p) => p.id));
    const idsB = new Set(PRODUCTS.filter((p) => p.style === "minimal").map((p) => p.id));
    const idsInter = intersection(idsA, idsB);
    list = PRODUCTS.filter((p) => idsInter.has(p.id));
  } else if (state.setop === "difference") {
    // สินค้าที่เป็น "เคสแฟชั่น" แต่ไม่ใช่ลาย "มินิมอลเรียบ" (Difference)
    const idsA = new Set(PRODUCTS.filter((p) => p.type === "fashion").map((p) => p.id));
    const idsB = new Set(PRODUCTS.filter((p) => p.style === "minimal").map((p) => p.id));
    const idsDiff = difference(idsA, idsB);
    list = PRODUCTS.filter((p) => idsDiff.has(p.id));
  }

  return list;
}

function renderChips() {
  const box = document.getElementById("chipline");
  const chips = [];
  state.models.forEach((m) => chips.push({ label: MODELS.find((x) => x.id === m).name, clear: () => state.models.delete(m) }));
  state.types.forEach((t) => chips.push({ label: TYPES[t].label, clear: () => state.types.delete(t) }));
  state.styles.forEach((s) => chips.push({ label: STYLES[s].label, clear: () => state.styles.delete(s) }));
  if (state.search) chips.push({ label: `ค้นหา: ${state.search}`, clear: () => { state.search = ""; document.getElementById("search-input").value = ""; } });

  box.innerHTML = chips
    .map((c, i) => `<span class="rchip">${c.label}<button data-chip="${i}">✕</button></span>`)
    .join("");
  box.querySelectorAll("[data-chip]").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      chips[i].clear();
      renderAll();
    });
  });
}

function renderGrid() {
  const list = filterProducts();
  const grid = document.getElementById("product-grid");
  document.getElementById("result-count").innerHTML = `พบ <b>${list.length}</b> รายการ`;

  if (list.length === 0) {
    grid.innerHTML = "";
    document.getElementById("empty-state").style.display = "block";
  } else {
    document.getElementById("empty-state").style.display = "none";
    grid.innerHTML = list.map(productCardHTML).join("");
    bindAddButtons(grid);
  }
}

function renderSetopButtons() {
  document.querySelectorAll("[data-setop]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-setop") === state.setop);
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-setop");
      state.setop = state.setop === val ? null : val;
      renderAll();
    });
  });
}

function renderAll() {
  renderFilterOptions();
  renderChips();
  renderGrid();
  document.querySelectorAll("[data-setop]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-setop") === state.setop);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFromQuery();
  renderSetopButtons();
  document.getElementById("search-input").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderGrid();
    renderChips();
  });
  document.getElementById("clear-filters").addEventListener("click", (e) => {
    e.preventDefault();
    state.models.clear();
    state.types.clear();
    state.styles.clear();
    state.search = "";
    state.setop = null;
    document.getElementById("search-input").value = "";
    renderAll();
  });
  renderAll();
});
