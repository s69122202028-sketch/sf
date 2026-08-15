/* ============================================================
   checkout.js — ตะกร้าสินค้า / สรุปคำสั่งซื้อ
   • คำนวณราคาด้วย reduce()
   • ตรวจโปรโมชั่นด้วย if-else, &&, ||, !
   • แนะนำสินค้าเพิ่มเติมด้วย Set (ไม่ซ้ำของที่มีอยู่แล้ว + ตรงรุ่นในตะกร้า)
   ============================================================ */

const SHIP_FREE_THRESHOLD = 1000;
const SHIP_FEE = 50;

function renderCartList() {
  const cart = getCart();
  const wrap = document.getElementById("cart-list");
  const emptyEl = document.getElementById("empty-cart");
  const layoutEl = document.getElementById("checkout-layout");

  if (cart.length === 0) {
    layoutEl.style.display = "none";
    emptyEl.style.display = "block";
    renderRecommendations();
    return;
  }
  layoutEl.style.display = "grid";
  emptyEl.style.display = "none";

  wrap.innerHTML = cart
    .map((c) => {
      const p = findProduct(c.id);
      if (!p) return "";
      return `
      <div class="cart-item">
        <div class="thumb">${getProductSVG(p)}</div>
        <div>
          <h4>${p.name}</h4>
          <div class="model">${p.modelName} · ${TYPES[p.type].label}</div>
          <div class="qty">
            <button data-qty="-1" data-id="${p.id}">–</button>
            <span>${c.qty}</span>
            <button data-qty="1" data-id="${p.id}">+</button>
          </div>
        </div>
        <div class="item-side">
          <span class="price">฿${p.price * c.qty}</span>
          <a href="#" class="remove-link" data-remove="${p.id}">นำออก</a>
        </div>
      </div>`;
    })
    .join("");

  wrap.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const delta = parseInt(btn.getAttribute("data-qty"), 10);
      const item = getCart().find((c) => c.id === id);
      const nextQty = (item ? item.qty : 0) + delta;
      setQty(id, nextQty);
      renderAll();
    });
  });
  wrap.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      removeFromCart(btn.getAttribute("data-remove"));
      showToast("นำสินค้าออกจากตะกร้าแล้ว");
      renderAll();
    });
  });
}

/* ---------- ตรรกะโปรโมชั่น (if-else, &&, ||, !) ---------- */
function evaluatePromos() {
  const cart = getCart();
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cartSubtotal();
  const hasFlip = cart.some((c) => findProduct(c.id)?.type === "flip");
  const hasThick = cart.some((c) => findProduct(c.id)?.type === "thick");

  let discount = 0;
  const notes = [];

  // เงื่อนไข 1: ซื้อครบ 3 ชิ้นขึ้นไป -> ลด 10%
  if (totalQty >= 3) {
    discount += subtotal * 0.1;
    notes.push({ active: true, text: "🎉 ซื้อครบ 3 ชิ้นขึ้นไป ลดเพิ่ม 10%" });
  } else {
    notes.push({ active: false, text: "ซื้อครบ 3 ชิ้น รับส่วนลด 10% ทันที" });
  }

  // เงื่อนไข 2: มีเคสฝาพับ && มีเคสกันกระแทก -> ลดเพิ่ม 50 บาท (คู่ปกป้องสุดคุ้ม)
  if (hasFlip && hasThick) {
    discount += 50;
    notes.push({ active: true, text: "🛡️ คู่ฝาพับ + กันกระแทก ลดเพิ่ม 50 บาท" });
  } else {
    notes.push({ active: false, text: "ซื้อคู่ เคสฝาพับ + เคสกันกระแทก ลดเพิ่ม 50 บาท" });
  }

  // เงื่อนไข 3: ค่าส่ง — ฟรีเมื่อยอดถึงเกณฑ์ (|| , !)
  const freeShip = subtotal >= SHIP_FREE_THRESHOLD || totalQty === 0;
  const shipping = !freeShip && totalQty > 0 ? SHIP_FEE : 0;
  notes.push({
    active: freeShip && totalQty > 0,
    text: freeShip
      ? "🚚 ยอดซื้อถึง ฿" + SHIP_FREE_THRESHOLD + " ส่งฟรี!"
      : `ซื้อเพิ่มอีก ฿${SHIP_FREE_THRESHOLD - subtotal} เพื่อรับส่งฟรี`,
  });

  return { subtotal, discount: Math.round(discount), shipping, notes, total: Math.max(0, Math.round(subtotal - discount + shipping)) };
}

function renderSummary() {
  const { subtotal, discount, shipping, notes, total } = evaluatePromos();
  document.getElementById("sum-subtotal").textContent = `฿${subtotal}`;
  document.getElementById("sum-discount").textContent = `-฿${discount}`;
  document.getElementById("sum-shipping").textContent = shipping ? `฿${shipping}` : "ฟรี";
  document.getElementById("sum-total").textContent = `฿${total}`;

  document.getElementById("promo-list").innerHTML = notes
    .map(
      (n) => `<div class="promo-box ${n.active ? "" : "inactive"}">${n.active ? "✅" : "⬜"} <span>${n.text}</span></div>`
    )
    .join("");
}

/* ---------- แนะนำสินค้าเพิ่มเติมด้วย Set ---------- */
function renderRecommendations() {
  const cart = getCart();
  const inCartIds = cartIdSet(); // เซตของ id ที่มีอยู่แล้วในตะกร้า
  const cartModels = new Set(cart.map((c) => findProduct(c.id)?.model).filter(Boolean));

  let pool;
  if (cartModels.size > 0) {
    // สินค้าที่ "ตรงรุ่นในตะกร้า" แต่ "ไม่ซ้ำ" กับของที่มีอยู่แล้ว (Difference)
    const sameModelIds = new Set(PRODUCTS.filter((p) => cartModels.has(p.model)).map((p) => p.id));
    const recIds = difference(sameModelIds, inCartIds);
    pool = PRODUCTS.filter((p) => recIds.has(p.id));
  } else {
    pool = PRODUCTS.filter((p) => p.featured);
  }

  const picked = pool.slice(0, 4);
  const el = document.getElementById("rec-grid");
  el.innerHTML = picked.map(productCardHTML).join("");
  bindAddButtons(el);
}

function renderAll() {
  renderCartList();
  renderSummary();
  renderRecommendations();
  updateCartBadge();
}

document.addEventListener("DOMContentLoaded", renderAll);
