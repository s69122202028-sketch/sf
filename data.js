/* ============================================================
   data.js
   ข้อมูลสินค้าทั้งหมดของร้าน + ตัวสร้างภาพประกอบเคส (SVG)
   ทุกชิ้นถือเป็นสมาชิกของ "เซตสินค้าทั้งหมด" (Universal Set: PRODUCTS)
   ============================================================ */

// รุ่น iPhone ที่ขาย -> แต่ละรุ่นมี "โทนสีประจำตัว" ของตัวเอง (design signature)
const MODELS = [
  { id: "ip11", name: "iPhone 11", color: "#F6C9D0" },
  { id: "ip12", name: "iPhone 12", color: "#C9E4CA" },
  { id: "ip13", name: "iPhone 13", color: "#FCE1A8" },
  { id: "ip14", name: "iPhone 14", color: "#B8D8E8" },
  { id: "ip15", name: "iPhone 15", color: "#E3C9F0" },
  { id: "ip16", name: "iPhone 16", color: "#F7D9C4" },
  { id: "ip17", name: "iPhone 17", color: "#CFE0C3" },
];

// หมวดหมู่เคส (ใช้เป็นสมาชิกของเซตหมวดหมู่ใน Home / ตัวกรองใน Products)
const TYPES = {
  soft:    { label: "เคสนิ่ม ซิลิโคน/TPU",        icon: "🍡", price: 290 },
  hard:    { label: "เคสแข็ง พลาสติก PC",          icon: "🧊", price: 320 },
  thick:   { label: "เคสกันกระแทกหนาพิเศษ",        icon: "🐻", price: 450 },
  flip:    { label: "เคสฝาพับ",                    icon: "📖", price: 590 },
  fashion: { label: "เคสแฟชั่นใส / มีลาย",          icon: "🎀", price: 390 },
};

// ลายบนเคส (สไตล์) — ใช้เป็นเซตที่สองสำหรับสาธิต Union / Intersection / Difference
const STYLES = {
  minimal: { label: "มินิมอลเรียบ",      priceAdj: 0 },
  cute:    { label: "น่ารักการ์ตูนหมี",  priceAdj: 30 },
  floral:  { label: "ลายดอกไม้มินิ",     priceAdj: 20 },
  clear:   { label: "ใสเรียบพิมพ์ลาย",   priceAdj: 10 },
};

// ชนิด x ลาย ที่มีขายจริง (กำหนดคู่ที่สมเหตุสมผลไว้ล่วงหน้า)
const TYPE_STYLE_MAP = {
  soft:    ["minimal", "cute"],
  hard:    ["minimal", "floral"],
  thick:   ["cute", "minimal"],
  flip:    ["minimal", "floral"],
  fashion: ["minimal", "clear", "floral"],
};

/* ---------- ตัวสร้างภาพประกอบเคสแบบ SVG (ไม่พึ่งรูปถ่ายจริง) ---------- */
function caseSVG({ color, style, type }) {
  const isThick = type === "thick";
  const isFlip  = type === "flip";
  const isClearFashion = type === "fashion" && style === "clear";
  const strokeW = isThick ? 6 : 2.5;
  const bodyFill = isClearFashion ? "rgba(255,255,255,.35)" : color;
  const bodyStroke = isThick ? "#4A4038" : "#ffffffaa";

  let deco = "";

  if (style === "cute") {
    // หูหมีน่ารักด้านบน + แก้มบุ๋ม
    deco += `
      <circle cx="46" cy="36" r="16" fill="${color}" stroke="#4A4038" stroke-width="2"/>
      <circle cx="154" cy="36" r="16" fill="${color}" stroke="#4A4038" stroke-width="2"/>
      <circle cx="46" cy="36" r="6" fill="#fff" opacity=".6"/>
      <circle cx="154" cy="36" r="6" fill="#fff" opacity=".6"/>
      <circle cx="70" cy="150" r="7" fill="#E8B4BC" opacity=".7"/>
      <circle cx="130" cy="150" r="7" fill="#E8B4BC" opacity=".7"/>
      <circle cx="82" cy="128" r="3" fill="#4A4038"/>
      <circle cx="118" cy="128" r="3" fill="#4A4038"/>
      <path d="M94 138 q6 6 12 0" stroke="#4A4038" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  }
  if (style === "floral") {
    const petals = [[60,210],[140,260],[55,320],[130,340]];
    petals.forEach(([x,y])=>{
      deco += `<g transform="translate(${x},${y})" opacity=".85">
        <circle cx="0" cy="-7" r="6" fill="#fff"/><circle cx="0" cy="7" r="6" fill="#fff"/>
        <circle cx="-7" cy="0" r="6" fill="#fff"/><circle cx="7" cy="0" r="6" fill="#fff"/>
        <circle cx="0" cy="0" r="5" fill="#F0D9A8"/>
      </g>`;
    });
  }
  if (isClearFashion) {
    deco += `
      <path d="M120 250 c10-14 30-4 22 12 c-6 12-22 20-22 20 s-16-8-22-20 c-8-16 12-26 22-12z" fill="#E8B4BC"/>
      <path d="M70 300 l4 10 10 2 -10 3 -4 10 -4-10 -10-3 10-2z" fill="#F0D9A8"/>`;
  }
  if (isFlip) {
    deco += `
      <rect x="14" y="18" width="66" height="364" rx="20" fill="${color}" stroke="#4A4038" stroke-width="2" opacity=".9"/>
      <circle cx="47" cy="200" r="7" fill="#fff" stroke="#4A4038" stroke-width="1.5"/>`;
  }

  return `
  <svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="${isFlip ? 86 : 20}" y="16" width="${isFlip ? 96 : 160}" height="368" rx="34"
      fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="${strokeW}"/>
    <rect x="${isFlip ? 96 : 30}" y="26" width="${isFlip ? 76 : 140}" height="348" rx="26"
      fill="none" stroke="#ffffff66" stroke-width="1.5"/>
    <rect x="${isFlip ? 104 : 40}" y="42" width="52" height="52" rx="16" fill="#4A4038" opacity=".18"/>
    <circle cx="${(isFlip?104:40)+16}" cy="58" r="9" fill="#4A4038" opacity=".35"/>
    <circle cx="${(isFlip?104:40)+38}" cy="58" r="5" fill="#4A4038" opacity=".25"/>
    ${deco}
  </svg>`;
}

/* ---------- สร้างเซตสินค้าทั้งหมด (PRODUCTS) จากการรวม Type x Style x Model ---------- */
const PRODUCTS = [];
let uid = 1;
Object.keys(TYPE_STYLE_MAP).forEach((typeId) => {
  TYPE_STYLE_MAP[typeId].forEach((styleId) => {
    MODELS.forEach((model, mi) => {
      const base = TYPES[typeId].price + STYLES[styleId].priceAdj + mi * 5;
      PRODUCTS.push({
        id: `${model.id}-${typeId}-${styleId}`,
        uid: uid++,
        model: model.id,
        modelName: model.name,
        type: typeId,
        style: styleId,
        color: model.color,
        price: base,
        name: `เคส ${model.name} ${TYPES[typeId].label} ลาย${STYLES[styleId].label}`,
        featured: (mi % 3 === 0), // เผื่อไว้ใช้เลือกสินค้าแนะนำแบบมี "เงื่อนไข"
      });
    });
  });
});

function getProductSVG(p) {
  return caseSVG({ color: p.color, style: p.style, type: p.type });
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/* ---------- Set operations ที่ใช้ร่วมกันหลายหน้า ---------- */
function union(a, b) {
  return new Set([...a, ...b]);
}
function intersection(a, b) {
  return new Set([...a].filter((x) => b.has(x)));
}
function difference(a, b) {
  return new Set([...a].filter((x) => !b.has(x)));
}
