/* ============================================================
   cart.js — ตะกร้าสินค้าที่ใช้ร่วมกันทุกหน้า (localStorage)
   โครงสร้าง cart = [{ id: productId, qty: number }, ...]
   ============================================================ */
const CART_KEY = "minicase_cart";

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// เพิ่มสินค้า: if-else ตรวจว่ามีอยู่แล้วหรือยัง (ตรรกะพื้นฐาน)
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
  return cart;
}

function setQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((c) => c.id !== productId);
  } else {
    const item = cart.find((c) => c.id === productId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
  return cart;
}

function removeFromCart(productId) {
  const cart = getCart().filter((c) => c.id !== productId);
  saveCart(cart);
  return cart;
}

// เซตของ id สินค้าที่อยู่ในตะกร้า (ใช้ has()/includes() ตรวจสอบซ้ำที่อื่น)
function cartIdSet() {
  return new Set(getCart().map((c) => c.id));
}

function cartCount() {
  return getCart().reduce((sum, c) => sum + c.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((sum, c) => {
    const p = findProduct(c.id);
    return p ? sum + p.price * c.qty : sum;
  }, 0);
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cartCount();
  });
}

function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
