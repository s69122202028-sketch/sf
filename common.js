/* ============================================================
   common.js — ส่วนที่ใช้ร่วมกันทุกหน้า: การ์ดสินค้า + ปุ่มเพิ่มลงตะกร้า
   ============================================================ */

function productCardHTML(p) {
  return `
  <div class="pcard">
    <a class="thumb" href="products.html?model=${p.model}" style="background:linear-gradient(160deg, ${p.color}55, transparent)">
      ${getProductSVG(p)}
    </a>
    <div class="info">
      <div class="tagrow">
        <span class="tag">${TYPES[p.type].label}</span>
        <span class="tag">${STYLES[p.style].label}</span>
      </div>
      <h4>${p.name}</h4>
      <div class="model">${p.modelName}</div>
      <div class="pricerow">
        <span class="price">฿${p.price}</span>
        <button class="add-btn" data-add="${p.id}" title="เพิ่มลงตะกร้า">+</button>
      </div>
    </div>
  </div>`;
}

function bindAddButtons(scope = document) {
  scope.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-add");
      addToCart(id, 1);
      btn.classList.add("added");
      btn.textContent = "✓";
      showToast("เพิ่มลงตะกร้าแล้ว 🎀");
      setTimeout(() => {
        btn.classList.remove("added");
        btn.textContent = "+";
      }, 1000);
    });
  });
}
