/* ============================================================
   home.js — หน้าแรก
   • ใช้ Set รวบรวม "หมวดหมู่สินค้า" จากรายการสินค้าทั้งหมด
   • ใช้ if-else / Set.has() เพื่อกันสินค้ารุ่นซ้ำในโซนสินค้าแนะนำ
   ============================================================ */

function renderCategories() {
  // Set ของหมวดหมู่ที่ "มีอยู่จริง" ในสินค้าทั้งหมด (จะไม่มีค่าซ้ำโดยธรรมชาติของ Set)
  const categorySet = new Set(PRODUCTS.map((p) => p.type));
  const el = document.getElementById("cat-grid");
  const iconBg = { soft: "var(--sky)", hard: "var(--butter)", thick: "var(--rose)", flip: "var(--sage)", fashion: "var(--lilac)" };

  let html = "";
  categorySet.forEach((typeId) => {
    // ใช้ Array.filter() (มาจาก Set -> Array) นับจำนวนสินค้าต่อหมวด
    const count = PRODUCTS.filter((p) => p.type === typeId).length;
    html += `
      <a class="cat-card" href="products.html?type=${typeId}">
        <div class="icon" style="background:${iconBg[typeId]}">${TYPES[typeId].icon}</div>
        <h4>${TYPES[typeId].label}</h4>
        <span>${count} แบบ</span>
      </a>`;
  });
  el.innerHTML = html;
  document.getElementById("cat-total").textContent = categorySet.size;
}

function renderModelChips() {
  const el = document.getElementById("model-row");
  el.innerHTML = MODELS.map(
    (m) => `
    <a class="model-chip" href="products.html?model=${m.id}">
      <span class="swatch" style="background:${m.color}"></span>${m.name}
    </a>`
  ).join("");
}

function renderFeatured() {
  const el = document.getElementById("featured-grid");
  const chosen = [];
  const usedModels = new Set(); // กันไม่ให้สินค้าแนะนำเป็นรุ่นซ้ำกันเกินไป

  for (const p of PRODUCTS) {
    if (chosen.length >= 8) break;
    // if-else: เลือกสินค้าที่ตั้งค่า featured ไว้ และยังไม่เคยหยิบรุ่นนี้มาก่อน (หรือถ้าใกล้ครบให้ผ่อนเงื่อนไข)
    if (p.featured && !usedModels.has(p.model)) {
      chosen.push(p);
      usedModels.add(p.model);
    } else if (chosen.length < 4) {
      chosen.push(p);
    }
  }

  el.innerHTML = chosen.slice(0, 8).map(productCardHTML).join("");
  bindAddButtons(el);
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderModelChips();
  renderFeatured();
});
