/* ========= بقالتي - تتبع مصاريف البقالة (قسم مستقل داخل محفظتي) =========
   بيانات منفصلة بالكامل عن ميزانية محفظتي، مخزّنة محلياً بمفتاح خاص. */

const GROCERY_STORAGE_KEY = "mahfazti-groceries-v1";
const GROCERY_CATEGORIES = ["فواكه", "خضروات", "لحوم", "ألبان", "مشروبات", "زيوت", "حبوب ودقيق", "أخرى"];
const GROCERY_CATEGORY_COLORS = {
  "فواكه": "#C97B3D", "خضروات": "#3E7C5A", "لحوم": "#B3483B", "ألبان": "#3E6B8A",
  "مشروبات": "#8C5B8F", "زيوت": "#C99A3A", "حبوب ودقيق": "#6B6456", "أخرى": "#1B3B34",
};
const GROCERY_STORES = ["بنده", "الدانوب", "كارفور", "الرشيد", "أسواق العثيم"];
const GROCERY_UNITS = ["كجم", "حبة", "لتر", "مل"];

const GROCERY_SEED = [
  { product: "تفاح رويال جالا", date: "2026-02-07", totalPrice: 5.78, store: "أسواق العثيم", category: "فواكه", quantity: 0.724, unit: "كجم", unitPrice: 7.99 },
  { product: "خيار", date: "2026-02-07", totalPrice: 2.4, store: "أسواق العثيم", category: "خضروات", quantity: 0.804, unit: "كجم", unitPrice: 2.99 },
  { product: "عنب أبيض", date: "2026-02-07", totalPrice: 12.2, store: "أسواق العثيم", category: "فواكه", quantity: 0.718, unit: "كجم", unitPrice: 16.99 },
  { product: "كلمنتينا", date: "2026-02-07", totalPrice: 1.62, store: "أسواق العثيم", category: "فواكه", quantity: 0.542, unit: "كجم", unitPrice: 2.99 },
  { product: "فراولة علبة", date: "2026-02-07", totalPrice: 5, store: "أسواق العثيم", category: "فواكه", quantity: 2, unit: "حبة", unitPrice: 2.5 },
  { product: "موز", date: "2026-02-07", totalPrice: 3.58, store: "أسواق العثيم", category: "فواكه", quantity: 0.896, unit: "كجم", unitPrice: 4 },
  { product: "طماطم محمي", date: "2026-02-07", totalPrice: 5.78, store: "أسواق العثيم", category: "خضروات", quantity: 1.448, unit: "كجم", unitPrice: 3.99 },
  { product: "برتقال ابوصرة", date: "2026-02-07", totalPrice: 4.61, store: "أسواق العثيم", category: "فواكه", quantity: 1.542, unit: "كجم", unitPrice: 2.99 },
  { product: "جرجير أخضر حزمة", date: "2026-02-07", totalPrice: 0.99, store: "أسواق العثيم", category: "خضروات", quantity: 1, unit: "حبة", unitPrice: 0.99 },
  { product: "سميد تيك تات 700جم", date: "2026-01-31", totalPrice: 8.95, store: "الرشيد", category: "حبوب ودقيق", quantity: 1, unit: "حبة", unitPrice: 8.95 },
  { product: "زبادي المراعي كامل الدسم 1كجم", date: "2026-01-31", totalPrice: 8, store: "الرشيد", category: "ألبان", quantity: 1, unit: "كجم", unitPrice: 8 },
  { product: "قفازات بشفين 70 حبة", date: "2026-01-31", totalPrice: 4.5, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 4.5 },
  { product: "جبنة كرافت تشيدر مطبوخة 100 جرام", date: "2026-01-31", totalPrice: 18, store: "الرشيد", category: "ألبان", quantity: 4, unit: "حبة", unitPrice: 4.5 },
  { product: "فوستر كلاركس نشا الذرة 200جم", date: "2026-01-31", totalPrice: 4, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 4 },
  { product: "لبن المراعي جي تي كامل الدسم 1لتر", date: "2026-01-31", totalPrice: 6, store: "الرشيد", category: "ألبان", quantity: 1, unit: "لتر", unitPrice: 6 },
  { product: "جيلي جرينز فواكه مشكلة 80جم", date: "2026-01-31", totalPrice: 2.75, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 2.75 },
  { product: "خبز توست هرفي نخالة 600جرام", date: "2026-01-31", totalPrice: 5.95, store: "الرشيد", category: "حبوب ودقيق", quantity: 1, unit: "حبة", unitPrice: 5.95 },
  { product: "حليب لونا مبخر علب 170 جرام", date: "2026-01-31", totalPrice: 5, store: "الرشيد", category: "ألبان", quantity: 2, unit: "حبة", unitPrice: 2.5 },
  { product: "جزر استرالي", date: "2026-01-31", totalPrice: 3.25, store: "الرشيد", category: "خضروات", quantity: 0.565, unit: "كجم", unitPrice: 5.75 },
  { product: "حليب مكثف محلي نستله 370جرام", date: "2026-01-31", totalPrice: 15, store: "الرشيد", category: "ألبان", quantity: 2, unit: "حبة", unitPrice: 7.5 },
  { product: "بيض اللولو اكس لارج", date: "2026-01-31", totalPrice: 21.5, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 21.5 },
  { product: "خليط لقمة القاضي العلالي 453جم", date: "2026-01-31", totalPrice: 5.95, store: "الرشيد", category: "حبوب ودقيق", quantity: 1, unit: "حبة", unitPrice: 5.95 },
  { product: "باكنج باودر غذائي 100جم", date: "2026-01-31", totalPrice: 11.5, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 11.5 },
  { product: "جيلي جرينز التوت 80جم", date: "2026-01-31", totalPrice: 5.5, store: "الرشيد", category: "أخرى", quantity: 2, unit: "حبة", unitPrice: 2.75 },
  { product: "مانجو يمني", date: "2026-01-31", totalPrice: 8.03, store: "الرشيد", category: "فواكه", quantity: 0.67, unit: "كجم", unitPrice: 11.99 },
  { product: "طماطم القصيم كبير", date: "2026-01-31", totalPrice: 2.5, store: "الرشيد", category: "خضروات", quantity: 0.715, unit: "كجم", unitPrice: 3.5 },
  { product: "شبيهة القشطة نادك سادة 170جرام", date: "2026-01-31", totalPrice: 20, store: "الرشيد", category: "ألبان", quantity: 8, unit: "حبة", unitPrice: 2.5 },
  { product: "رول نايلون ركس 30سم×1كجم", date: "2026-01-31", totalPrice: 16.5, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 16.5 },
  { product: "دريم ويب مزيج كريمة التزيين 72 جم", date: "2026-01-31", totalPrice: 18, store: "الرشيد", category: "أخرى", quantity: 3, unit: "حبة", unitPrice: 6 },
  { product: "خيار الرياض", date: "2026-01-31", totalPrice: 3.25, store: "الرشيد", category: "خضروات", quantity: 1, unit: "حبة", unitPrice: 3.25 },
  { product: "تفاح امريكي", date: "2026-01-31", totalPrice: 10.69, store: "الرشيد", category: "فواكه", quantity: 1.125, unit: "كجم", unitPrice: 9.5 },
  { product: "كليجا ميني الرشيد", date: "2026-01-31", totalPrice: 13.75, store: "الرشيد", category: "أخرى", quantity: 0.55, unit: "كجم", unitPrice: 25 },
  { product: "شبية الجبن كيري قابلة للدهن 500جم", date: "2026-01-31", totalPrice: 33.5, store: "الرشيد", category: "ألبان", quantity: 2, unit: "حبة", unitPrice: 16.75 },
  { product: "سفرة اورى 110×100", date: "2026-01-31", totalPrice: 9.25, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 9.25 },
  { product: "فلفل بارد أخضر الرياض", date: "2026-01-31", totalPrice: 3.41, store: "الرشيد", category: "خضروات", quantity: 0.545, unit: "كجم", unitPrice: 6.25 },
  { product: "كاكاو غذائي صغير 125جم", date: "2026-01-31", totalPrice: 5.5, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 5.5 },
  { product: "طحين كويتي فاخر مطاحن الدقيق 1 كيلو", date: "2026-01-31", totalPrice: 48.95, store: "الرشيد", category: "حبوب ودقيق", quantity: 1, unit: "حبة", unitPrice: 48.95 },
  { product: "برتقال ابو صرة فرش", date: "2026-01-31", totalPrice: 4.39, store: "الرشيد", category: "فواكه", quantity: 1.255, unit: "كجم", unitPrice: 3.5 },
  { product: "جيلي فوستر كلاركس مانجو 80 جرام", date: "2026-01-31", totalPrice: 5, store: "الرشيد", category: "أخرى", quantity: 2, unit: "حبة", unitPrice: 2.5 },
  { product: "بطاطا حلوة", date: "2026-01-31", totalPrice: 4.25, store: "الرشيد", category: "خضروات", quantity: 1.065, unit: "كجم", unitPrice: 3.99 },
  { product: "موز كبير", date: "2026-01-31", totalPrice: 6.41, store: "الرشيد", category: "فواكه", quantity: 1.35, unit: "كجم", unitPrice: 4.75 },
  { product: "افندي مصري درجة اولى", date: "2026-01-31", totalPrice: 5.39, store: "الرشيد", category: "فواكه", quantity: 0.625, unit: "كجم", unitPrice: 7.5 },
  { product: "فانيليا بودرة العلالي 20 غم", date: "2026-01-31", totalPrice: 11.95, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 11.95 },
  { product: "جيلي جرينز الكرز 80جم", date: "2026-01-31", totalPrice: 2.75, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 2.75 },
  { product: "كوسة الرياض", date: "2026-01-31", totalPrice: 3.36, store: "الرشيد", category: "خضروات", quantity: 0.895, unit: "كجم", unitPrice: 3.75 },
  { product: "قرع امريكي رقم 2", date: "2026-01-31", totalPrice: 3.41, store: "الرشيد", category: "خضروات", quantity: 0.855, unit: "كجم", unitPrice: 3.99 },
  { product: "بيكربونات الصوديوم رياض فود 100غ", date: "2026-01-31", totalPrice: 5, store: "الرشيد", category: "أخرى", quantity: 2, unit: "حبة", unitPrice: 2.5 },
  { product: "ورق سندوتش الاصلي M 4", date: "2026-01-31", totalPrice: 3.99, store: "الرشيد", category: "أخرى", quantity: 1, unit: "حبة", unitPrice: 3.99 },
  { product: "ذرة", date: "2026-01-24", totalPrice: 7.21, store: "بنده", category: "خضروات", quantity: 1.807, unit: "كجم", unitPrice: 3.99 },
  { product: "دقيق كويتي 1كجم", date: "2026-01-24", totalPrice: 4.04, store: "بنده", category: "حبوب ودقيق", quantity: 1, unit: "كجم", unitPrice: 4.04 },
  { product: "دقيق كويتي 1كجم", date: "2026-01-24", totalPrice: 5.95, store: "بنده", category: "حبوب ودقيق", quantity: 1, unit: "كجم", unitPrice: 5.95 },
  { product: "ليمون محلي", date: "2026-01-24", totalPrice: 5.66, store: "بنده", category: "فواكه", quantity: 0.63, unit: "كجم", unitPrice: 8.98 },
  { product: "بقدونس", date: "2026-01-24", totalPrice: 2.97, store: "بنده", category: "خضروات", quantity: 1, unit: "حبة", unitPrice: 2.97 },
  { product: "خيار طازج", date: "2026-01-24", totalPrice: 2.58, store: "بنده", category: "خضروات", quantity: 0.574, unit: "كجم", unitPrice: 4.5 },
  { product: "تفاح كاوانا", date: "2026-01-24", totalPrice: 8.51, store: "بنده", category: "فواكه", quantity: 0.71, unit: "كجم", unitPrice: 11.99 },
  { product: "برتقال أبو سرة", date: "2026-01-24", totalPrice: 2.76, store: "بنده", category: "فواكه", quantity: 0.923, unit: "كجم", unitPrice: 2.99 },
  { product: "زيت زيتون الوطنية عضوي بكر ممتاز 500مل", date: "2026-01-24", totalPrice: 19.99, store: "بنده", category: "زيوت", quantity: 1, unit: "مل", unitPrice: 19.99 },
  { product: "فراولة مصري", date: "2026-01-24", totalPrice: 3.5, store: "بنده", category: "فواكه", quantity: 1, unit: "حبة", unitPrice: 3.5 },
  { product: "خس روماني", date: "2026-01-24", totalPrice: 1.91, store: "بنده", category: "خضروات", quantity: 0.383, unit: "كجم", unitPrice: 4.99 },
  { product: "مشمش", date: "2026-01-24", totalPrice: 6.15, store: "بنده", category: "فواكه", quantity: 0.362, unit: "كجم", unitPrice: 16.99 },
  { product: "طماطم أحمر", date: "2026-01-24", totalPrice: 11.6, store: "بنده", category: "خضروات", quantity: 1.452, unit: "كجم", unitPrice: 7.99 },
];

let groceryData = { items: [], settings: { monthlyBudget: 0 } };
let groceryTab = "overview";

function loadGroceryData() {
  try {
    const raw = localStorage.getItem(GROCERY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      groceryData = { items: parsed.items || [], settings: { monthlyBudget: 0, ...(parsed.settings || {}) } };
    }
  } catch (e) { /* keep defaults */ }
}
function saveGroceryData() {
  try { localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify(groceryData)); }
  catch (e) { alert("تعذر حفظ بيانات البقالة محلياً — تأكد من توفر مساحة تخزين بالجهاز."); }
}
function importGrocerySeed() {
  if (!confirm(`بيستورد ${GROCERY_SEED.length} عنصر من بيانات Notion السابقة. تكمل؟`)) return;
  GROCERY_SEED.forEach((it) => groceryData.items.unshift({ id: uid(), ...it }));
  saveGroceryData();
  renderGroceries();
}

function enterGroceries() {
  window.__mode = "groceries";
  saveUiState();
  renderGroceries();
}
function exitGroceries() {
  window.__mode = "budget";
  saveUiState();
  render();
}

/* bridge for firebase-sync.js (a module script, can't see this file's `let groceryData` binding directly) */
function __getGroceryState() { return groceryData; }
function __setGroceryState(data) { groceryData = data; }

/* ---------------- mutations ---------------- */
function addGroceryItem(it) { groceryData.items.unshift({ id: uid(), ...it }); saveGroceryData(); }
function updateGroceryItem(id, patch) {
  groceryData.items = groceryData.items.map((it) => (it.id === id ? { ...it, ...patch } : it));
  saveGroceryData();
}
function deleteGroceryItem(id) {
  if (!confirm("تحذف هذا العنصر؟")) return;
  groceryData.items = groceryData.items.filter((x) => x.id !== id);
  saveGroceryData(); renderGroceries();
}
/* ---------------- derived ---------------- */
function groceryMonthItems(ym) { return groceryData.items.filter((it) => it.date.startsWith(ym)); }
function grocerySpentByCategory(items) {
  const map = {};
  items.forEach((it) => { map[it.category] = (map[it.category] || 0) + it.totalPrice; });
  return map;
}
function grocerySpentByStore(items) {
  const map = {};
  items.forEach((it) => { map[it.store] = (map[it.store] || 0) + it.totalPrice; });
  return map;
}
function groceryProductStats() {
  const map = {};
  groceryData.items.forEach((it) => {
    const key = it.product.trim();
    if (!map[key]) map[key] = [];
    map[key].push(it);
  });
  return Object.entries(map).map(([product, purchases]) => {
    const sorted = purchases.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const cheapest = purchases.slice().sort((a, b) => a.unitPrice - b.unitPrice)[0];
    const avgUnit = purchases.reduce((s, x) => s + x.unitPrice, 0) / purchases.length;
    return { product, purchases: sorted, count: purchases.length, last: sorted[0], avgUnit, cheapest };
  }).sort((a, b) => b.count - a.count);
}
function findLastGroceryEntry(product) {
  const norm = product.trim().toLowerCase();
  return groceryData.items.find((it) => it.product.trim().toLowerCase() === norm);
}

/* ---------------- shared donut chart (reused for category + could reuse elsewhere) ---------------- */
function donutChartHTML(entries, total, titleText) {
  if (!entries.length || total <= 0) {
    return `<div class="card"><div class="section-title" style="margin-top:0">${titleText}</div><div class="empty-state" style="padding:20px 0">لا يوجد بيانات بعد</div></div>`;
  }
  let cursor = 0;
  const stops = entries.map((e) => {
    const start = (cursor / total) * 100;
    cursor += e.amount;
    const end = (cursor / total) * 100;
    return `${e.color} ${start}% ${end}%`;
  }).join(", ");
  return `
    <div class="card">
      <div class="section-title" style="margin-top:0">${titleText}</div>
      <div class="pie-wrap">
        <div class="pie-donut" style="background:conic-gradient(${stops})"></div>
        <div class="pie-center"><div class="pie-total">${fmt(total)}</div><div class="pie-total-sub">ر.س</div></div>
      </div>
      <div class="pie-legend">
        ${entries.map((e) => `
          <div class="pie-legend-row">
            <span class="pie-dot" style="background:${e.color}"></span>
            <span class="pie-legend-name">${esc(e.label)}</span>
            <span class="pie-legend-amt">${fmt(e.amount)} ر.س · ${fmt(total > 0 ? (e.amount / total) * 100 : 0)}%</span>
          </div>`).join("")}
      </div>
    </div>`;
}

/* ---------------- rendering ---------------- */
function groceryHeaderHTML() {
  return `
    <div class="header">
      <div class="header-top">
        <div class="brand">${icon("shoppingBasket", COLORS.secondary, 20)} بقالتي</div>
        <button class="btn btn-ghost" onclick="exitGroceries()">${icon("chevronRight", COLORS.ink, 16)} رجوع لمحفظتي</button>
      </div>
    </div>`;
}
function groceryNavHTML() {
  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "wallet" },
    { id: "products", label: "المنتجات", icon: "shoppingBasket" },
    { id: "history", label: "السجل", icon: "receipt" },
  ];
  return `
    <div class="bottom-nav">
      ${tabs.map((t) => `
        <button class="nav-btn ${groceryTab === t.id ? "active" : ""}" onclick='setGroceryTab(${JSON.stringify(t.id)})'>
          ${icon(t.icon, groceryTab === t.id ? COLORS.secondary : COLORS.sub, 19)}
          <span>${t.label}</span>
        </button>`).join("")}
    </div>`;
}
function setGroceryTab(id) { groceryTab = id; saveUiState(); renderGroceries(); }

function groceryBudgetCardHTML(spent) {
  const budget = groceryData.settings.monthlyBudget || 0;
  const pctVal = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  return `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
        <div class="section-title" style="margin-top:0;margin-bottom:0">ميزانية البقالة الشهرية</div>
        <button class="btn btn-ghost" onclick="openGroceryBudgetSheet()">${icon("pencil", COLORS.sub, 13)}</button>
      </div>
      ${budget > 0 ? `
        <div style="display:flex;justify-content:space-between;font-size:14px;margin:8px 0">
          <span>صرفت ${fmt(spent)} من ${fmt(budget)} ر.س</span>
          <span style="color:${remaining < 0 ? COLORS.danger : COLORS.sub}">${remaining >= 0 ? `باقي ${fmt(remaining)}` : `تجاوزت ${fmt(-remaining)}`}</span>
        </div>
        ${progressBar(pctVal, remaining < 0 ? COLORS.danger : budgetUsageColor(pctVal, COLORS.success))}
      ` : `<div style="font-size:13px;color:${COLORS.sub};margin-top:8px">ما حددت ميزانية شهرية للبقالة بعد.</div>`}
    </div>`;
}
function openGroceryBudgetSheet() {
  const body = `
    <div class="field"><label>الميزانية الشهرية للبقالة (ر.س)</label><input id="g-budget" type="number" inputmode="decimal" value="${groceryData.settings.monthlyBudget || ""}" placeholder="مثال: 1200"/></div>
    <button class="btn btn-primary btn-block" onclick="saveGroceryBudget()">${icon("check", "#fff", 16)} حفظ</button>
  `;
  openSheetShell("ميزانية البقالة", body);
}
function saveGroceryBudget() {
  const val = parseFloat(document.getElementById("g-budget").value);
  groceryData.settings.monthlyBudget = isNaN(val) || val < 0 ? 0 : val;
  saveGroceryData();
  closeSheet(); renderGroceries();
}

function groceryOverviewHTML() {
  const ym = todayISO().slice(0, 7);
  const items = groceryMonthItems(ym);
  const total = items.reduce((s, it) => s + it.totalPrice, 0);
  const catMap = grocerySpentByCategory(items);
  const catEntries = Object.entries(catMap)
    .map(([cat, amt]) => ({ label: cat, amount: amt, color: GROCERY_CATEGORY_COLORS[cat] || COLORS.sub }))
    .sort((a, b) => b.amount - a.amount);
  const storeMap = grocerySpentByStore(items);
  const storeEntries = Object.entries(storeMap).sort((a, b) => b[1] - a[1]);
  const recent = groceryData.items.slice(0, 5);
  return `
    ${!groceryData.items.length ? `
    <div class="card" style="background:${COLORS.secondary};color:#fff">
      <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;margin-bottom:8px">🛒 ابدأ تتبع بقالتك</div>
      <div style="font-size:13px;line-height:1.8;color:#ffffffd9;margin-bottom:12px">عندك بيانات سابقة من Notion (${GROCERY_SEED.length} عنصر) — تقدر تستوردها دفعة وحدة، أو تبدأ تسجيل يدوي من الصفر.</div>
      <button class="btn" style="background:#fff;color:${COLORS.secondary};padding:9px 16px;font-size:13px;font-weight:700" onclick="importGrocerySeed()">استيراد بيانات Notion</button>
    </div>` : ""}
    <div class="card" style="background:${COLORS.secondaryTint};border-color:transparent">
      <div class="section-title" style="margin-top:0">إجمالي مشتريات هذا الشهر</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:26px;color:${COLORS.secondary}">${fmt(total)} <small style="font-size:13px;color:${COLORS.ink};font-weight:500">ر.س</small></div>
      <div style="font-size:12px;color:${COLORS.ink};margin-top:4px;opacity:.7">${items.length} عملية شراء</div>
    </div>
    ${groceryBudgetCardHTML(total)}
    ${donutChartHTML(catEntries, total, "التوزيع حسب الفئة")}
    ${storeEntries.length ? `
    <div class="card">
      <div class="section-title" style="margin-top:0">التوزيع حسب المتجر</div>
      <div class="alloc-rows">
        ${storeEntries.map(([store, amt]) => `
          <div class="alloc-row">
            <span class="alloc-dot" style="background:${COLORS.gold}"></span>
            <span class="alloc-label">${esc(store)}</span>
            <span class="alloc-amt">${fmt(amt)} ر.س<small> · ${fmt(total > 0 ? (amt / total) * 100 : 0)}%</small></span>
          </div>`).join("")}
      </div>
    </div>` : ""}
    ${recent.length ? `
    <div class="section-title">آخر المشتريات</div>
    ${recent.map(groceryItemRowHTML).join("")}
    ` : ""}
  `;
}
function groceryItemRowHTML(it) {
  const c = GROCERY_CATEGORY_COLORS[it.category] || COLORS.sub;
  return `
    <div class="tx-row">
      <div class="icon-badge" style="width:28px;height:28px;background:${c}1F">${icon("shoppingBag", c, 14)}</div>
      <div class="tx-main">
        <div class="tx-title">${esc(it.product)}</div>
        <div class="tx-sub">${it.date} · ${esc(it.store)} · ${esc(it.category)}</div>
      </div>
      <span class="tx-amount">${fmt(it.totalPrice)}</span>
    </div>`;
}

function groceryProductsHTML() {
  const stats = groceryProductStats();
  return `
    <div class="section-title" style="margin-top:16px">منتجاتك</div>
    ${!stats.length ? `<div class="empty-state">ما فيه منتجات مسجلة بعد</div>` : ""}
    ${stats.map((p) => `
      <div class="cat-card" onclick='openProductDetail(${JSON.stringify(p.product)})' style="cursor:pointer">
        <div class="row" style="margin-bottom:2px">
          <div style="flex:1;min-width:0">
            <div class="cat-name">${esc(p.product)}</div>
            <div class="cat-amounts">آخر سعر ${fmt(p.last.unitPrice)} ر.س/${esc(p.last.unit)} · ${p.count} مرة شراء</div>
          </div>
          <span style="font-size:11px;color:${COLORS.success};background:${COLORS.success}1F;padding:4px 8px;border-radius:999px;white-space:nowrap">أرخص: ${esc(p.cheapest.store)}</span>
        </div>
      </div>`).join("")}
  `;
}
function openProductDetail(product) {
  const stats = groceryProductStats().find((p) => p.product === product);
  if (!stats) return;
  const body = `
    <div style="font-size:13px;color:${COLORS.sub};margin-bottom:14px;line-height:1.8">
      متوسط سعر الوحدة: <strong style="color:${COLORS.ink}">${fmt(stats.avgUnit)} ر.س</strong><br/>
      أرخص سعر: <strong style="color:${COLORS.success}">${fmt(stats.cheapest.unitPrice)} ر.س</strong> من ${esc(stats.cheapest.store)}
    </div>
    ${stats.purchases.map((p) => `
      <div class="tx-row">
        <div class="tx-main">
          <div class="tx-title">${esc(p.store)}</div>
          <div class="tx-sub">${p.date} · ${p.quantity} ${esc(p.unit)}</div>
        </div>
        <span class="tx-amount">${fmt(p.unitPrice)}/${esc(p.unit)}</span>
        <button class="btn btn-ghost" onclick='closeSheet();openAddGroceryItemSheet(${JSON.stringify(p.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
      </div>`).join("")}
  `;
  openSheetShell(product, body);
}

function groceryHistoryHTML() {
  const all = groceryData.items.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
      <div class="section-title" style="margin:0">كل المشتريات</div>
      <button class="btn btn-gold" onclick="exportGroceryCSV()">${icon("download", "#fff", 14)} تصدير CSV</button>
    </div>
    ${!all.length ? `<div class="empty-state">ما فيه عمليات مسجلة بعد</div>` : ""}
    ${all.map((it) => `
      <div class="tx-row">
        ${iconBadge("shoppingBag", GROCERY_CATEGORY_COLORS[it.category] || COLORS.sub, 14)}
        <div class="tx-main">
          <div class="tx-title">${esc(it.product)}</div>
          <div class="tx-sub">${it.date} · ${esc(it.store)} · ${esc(it.category)} · ${it.quantity} ${esc(it.unit)}</div>
        </div>
        <span class="tx-amount">${fmt(it.totalPrice)}</span>
        <button class="btn btn-ghost" onclick='openAddGroceryItemSheet(${JSON.stringify(it.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
        <button class="btn btn-ghost" onclick='deleteGroceryItem(${JSON.stringify(it.id)})'>${icon("trash", COLORS.danger, 13)}</button>
      </div>`).join("")}
  `;
}
function exportGroceryCSV() {
  const rows = [["التاريخ", "المنتج", "الفئة", "المتجر", "الكمية", "الوحدة", "سعر الوحدة", "السعر الإجمالي"]];
  groceryData.items.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).forEach((it) => {
    rows.push([it.date, it.product, it.category, it.store, it.quantity, it.unit, it.unitPrice, it.totalPrice]);
  });
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "بقالتي.csv"; a.click();
  URL.revokeObjectURL(url);
}

const GROCERY_TAB_TITLES = { overview: "نظرة عامة", products: "المنتجات", history: "سجل المشتريات" };

function renderGroceries() {
  const app = document.getElementById("app");
  let body = "";
  if (groceryTab === "overview") body = groceryOverviewHTML();
  else if (groceryTab === "products") body = groceryProductsHTML();
  else if (groceryTab === "history") body = groceryHistoryHTML();
  app.innerHTML = `
    ${appSidebarHTML()}
    <div class="app-main">
      ${groceryHeaderHTML()}
      <div class="page-title-row">
        <div class="page-title">${GROCERY_TAB_TITLES[groceryTab] || ""}</div>
      </div>
      <div class="fab-row">
        <button class="fab-secondary" onclick="openGroceryImportSheet()">${icon("clipboard", "#fff", 15)} استيراد قائمة</button>
        <button class="fab" style="background:${COLORS.secondary};color:#fff" onclick="openAddGroceryItemSheet()">${icon("plus", "#fff", 16)} إضافة عنصر</button>
      </div>
      <div class="content">${body}</div>
    </div>
    ${groceryNavHTML()}
  `;
}

/* -- add / edit item manually, with autofill from the last time this product was bought -- */
function openAddGroceryItemSheet(editId) {
  const editing = editId ? groceryData.items.find((it) => it.id === editId) : null;
  const productOptions = [...new Set(groceryData.items.map((it) => it.product))];
  const unitOptions = editing && !GROCERY_UNITS.includes(editing.unit) ? [...GROCERY_UNITS, editing.unit] : GROCERY_UNITS;
  const storeOptions = editing && !GROCERY_STORES.includes(editing.store) ? [...GROCERY_STORES, editing.store] : GROCERY_STORES;
  const body = `
    <div class="field">
      <label>اسم المنتج</label>
      <input id="g-product" list="g-product-list" type="text" placeholder="مثال: تفاح رويال جالا" value="${editing ? esc(editing.product) : ""}" oninput="groceryProductAutofill()"/>
      <datalist id="g-product-list">${productOptions.map((p) => `<option value="${esc(p)}"></option>`).join("")}</datalist>
    </div>
    <div class="field"><label>الفئة</label>
      <select id="g-category">${GROCERY_CATEGORIES.map((c) => `<option value="${esc(c)}" ${editing && editing.category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
    </div>
    <div class="field"><label>المتجر</label>
      <select id="g-store">${storeOptions.map((s) => `<option value="${esc(s)}" ${editing && editing.store === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>
    </div>
    <div style="display:flex;gap:10px">
      <div class="field" style="flex:1"><label>الكمية</label><input id="g-qty" type="number" inputmode="decimal" value="${editing ? editing.quantity : 1}" oninput="groceryComputeUnitPrice()"/></div>
      <div class="field" style="flex:1"><label>الوحدة</label>
        <select id="g-unit" onchange="groceryComputeUnitPrice()">${unitOptions.map((u) => `<option value="${esc(u)}" ${editing && editing.unit === u ? "selected" : ""}>${esc(u)}</option>`).join("")}</select>
      </div>
    </div>
    <div class="field"><label>السعر الإجمالي (ر.س)</label><input id="g-total" type="number" inputmode="decimal" placeholder="0" value="${editing ? editing.totalPrice : ""}" oninput="groceryComputeUnitPrice()"/></div>
    <div id="g-unitprice-hint" style="font-size:12px;color:${COLORS.sub};margin:-8px 0 16px"></div>
    <div class="field"><label>التاريخ</label><input id="g-date" type="date" value="${editing ? editing.date : todayISO()}"/></div>
    <input type="hidden" id="g-edit-id" value="${editing ? editing.id : ""}"/>
    <button class="btn btn-primary btn-block" onclick="submitGroceryItem()">${icon("check", "#fff", 16)} ${editing ? "حفظ التعديل" : "حفظ"}</button>
  `;
  openSheetShell(editing ? "تعديل عنصر" : "عنصر بقالة جديد", body);
  groceryComputeUnitPrice();
}
function groceryProductAutofill() {
  const last = findLastGroceryEntry(document.getElementById("g-product").value);
  if (!last) return;
  document.getElementById("g-category").value = last.category;
  document.getElementById("g-store").value = last.store;
  document.getElementById("g-unit").value = last.unit;
  groceryComputeUnitPrice();
}
function groceryComputeUnitPrice() {
  const qty = parseFloat(document.getElementById("g-qty").value) || 0;
  const total = parseFloat(document.getElementById("g-total").value) || 0;
  const hint = document.getElementById("g-unitprice-hint");
  hint.textContent = qty > 0 && total > 0 ? `سعر الوحدة: ${fmt(total / qty)} ر.س` : "";
}
function submitGroceryItem() {
  const editId = document.getElementById("g-edit-id").value;
  const product = document.getElementById("g-product").value.trim();
  const category = document.getElementById("g-category").value;
  const store = document.getElementById("g-store").value;
  const quantity = parseFloat(document.getElementById("g-qty").value);
  const unit = document.getElementById("g-unit").value;
  const totalPrice = parseFloat(document.getElementById("g-total").value);
  const date = document.getElementById("g-date").value || todayISO();
  if (!product || !quantity || quantity <= 0 || !totalPrice || totalPrice <= 0) { alert("أدخل اسم المنتج والكمية والسعر"); return; }
  const patch = { product, category, store, quantity, unit, totalPrice, unitPrice: totalPrice / quantity, date };
  if (editId) updateGroceryItem(editId, patch);
  else addGroceryItem(patch);
  closeSheet(); renderGroceries();
}

/* -- bulk import: paste a list (e.g. one you asked me to build from a receipt photo you sent in chat) -- */
function openGroceryImportSheet() {
  const body = `
    <div style="font-size:12px;color:${COLORS.sub};margin-bottom:12px;line-height:1.8">
      الصق قائمة عناصر — سطر لكل عنصر بهذا الترتيب:<br/>
      <code style="background:${COLORS.paper};padding:2px 6px;border-radius:6px">المنتج | الكمية | الوحدة | السعر الإجمالي | المتجر | الفئة</code><br/>
      المتجر والفئة اختياريين. مثال:<br/>
      <code style="background:${COLORS.paper};padding:2px 6px;border-radius:6px">تفاح | 1.2 | كجم | 9.5 | بنده | فواكه</code><br/><br/>
      💡 التطبيق ما يقرأ الصور مباشرة. صوّر الفاتورة وأرسلها لي هنا بالمحادثة، وأنا أطلع لك القائمة بهذي الصيغة تلصقها هنا.
    </div>
    <div class="field"><textarea id="g-import" rows="8" placeholder="تفاح | 1.2 | كجم | 9.5 | بنده | فواكه"></textarea></div>
    <button class="btn btn-primary btn-block" onclick="submitGroceryImport()">${icon("check", "#fff", 16)} استيراد</button>
  `;
  openSheetShell("استيراد قائمة عناصر", body);
}
function submitGroceryImport() {
  const text = document.getElementById("g-import").value.trim();
  if (!text) { alert("الصق قائمة العناصر أولاً"); return; }
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let added = 0;
  lines.forEach((line) => {
    const parts = line.split("|").map((p) => p.trim());
    const [product, qtyStr, unit, totalStr, store, category] = parts;
    const quantity = parseFloat(qtyStr);
    const totalPrice = parseFloat(totalStr);
    if (!product || !quantity || !totalPrice) return;
    addGroceryItem({
      product, quantity, unit: unit || "حبة", totalPrice,
      unitPrice: totalPrice / quantity,
      store: store || "غير محدد", category: category || "أخرى",
      date: todayISO(),
    });
    added++;
  });
  if (!added) { alert("ما قدرت أفهم أي سطر — تأكد من الصيغة وحاول مرة ثانية"); return; }
  closeSheet(); renderGroceries();
  alert(`تم إضافة ${added} عنصر`);
}

/* ---------------- init ---------------- */
loadGroceryData();
window.__mode = window.__mode || "budget";
restoreUiState(); // app.js already rendered once with defaults before this file finished loading; restore the real tab/mode and re-render
if (window.__mode === "groceries") renderGroceries(); else render();
