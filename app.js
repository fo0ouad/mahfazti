/* ========= محفظتي - تطبيق إدارة المصاريف =========
   بيانات محلية بالكامل (localStorage) - PWA حقيقي قابل للتثبيت والعمل بدون نت */

const STORAGE_KEY = "mahfazti-data-v1";

const COLORS = {
  ink: "#1B3B34", gold: "#C99A3A", paper: "#F6F2E9", card: "#FFFFFF",
  border: "#E4DDC9", sub: "#8A8272", danger: "#B3483B", success: "#3E7C5A", warn: "#C99A3A",
};

const DEFAULT_CATEGORIES = [
  { id: "food", name: "أكل ومطاعم", icon: "utensils", color: "#C97B3D", budget: 1200 },
  { id: "transport", name: "مواصلات", icon: "car", color: "#3E6B8A", budget: 500 },
  { id: "bills", name: "فواتير", icon: "receipt", color: "#8C5B8F", budget: 800 },
  { id: "shopping", name: "تسوق", icon: "shoppingBag", color: "#B3483B", budget: 600 },
  { id: "health", name: "صحة", icon: "heartPulse", color: "#3E7C5A", budget: 300 },
  { id: "other", name: "أخرى", icon: "moreHorizontal", color: "#6B6456", budget: 200 },
];

/* ---------------- icons (feather-style inline svg) ---------------- */
function svg(inner, color, size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
const ICONS = {
  wallet: (c, s) => svg(`<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 7h16a1 1 0 0 1 1 1v3H16a2 2 0 1 0 0 4h4"/>`, c, s),
  utensils: (c, s) => svg(`<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M18 3c-1.5 1.5-2 3-2 5s.5 3.5 2 5v8"/>`, c, s),
  car: (c, s) => svg(`<path d="M4 16V9l2-4h12l2 4v7"/><path d="M4 16h16v3H4z"/><circle cx="7.5" cy="19" r="1.6"/><circle cx="16.5" cy="19" r="1.6"/>`, c, s),
  receipt: (c, s) => svg(`<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>`, c, s),
  shoppingBag: (c, s) => svg(`<path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>`, c, s),
  heartPulse: (c, s) => svg(`<path d="M20.8 8.6a4.6 4.6 0 0 0-7.8-3.3L12 6.3l-1-1a4.6 4.6 0 0 0-7.8 3.3c0 2.4 1.6 4 3.2 5.6L12 20l5.6-6.1c1.6-1.6 3.2-3.2 3.2-5.3z"/><path d="M6 12h2l1.5-3L11 15l1.5-3H15"/>`, c, s),
  moreHorizontal: (c, s) => svg(`<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>`, c, s),
  creditCard: (c, s) => svg(`<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 10h19M6 15h4"/>`, c, s),
  plus: (c, s) => svg(`<path d="M12 5v14M5 12h14"/>`, c, s),
  x: (c, s) => svg(`<path d="M6 6l12 12M18 6L6 18"/>`, c, s),
  trash: (c, s) => svg(`<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7"/>`, c, s),
  download: (c, s) => svg(`<path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16"/>`, c, s),
  chevronRight: (c, s) => svg(`<path d="M9 5l7 7-7 7"/>`, c, s),
  chevronLeft: (c, s) => svg(`<path d="M15 5l-7 7 7 7"/>`, c, s),
  check: (c, s) => svg(`<path d="M5 12l5 5L20 7"/>`, c, s),
  pencil: (c, s) => svg(`<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/>`, c, s),
  trendingUp: (c, s) => svg(`<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>`, c, s),
  alertTriangle: (c, s) => svg(`<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.1"/>`, c, s),
};
function icon(name, color, size = 20) {
  return (ICONS[name] || ICONS.moreHorizontal)(color, size);
}
function iconBadge(name, color, size = 20) {
  return `<div class="icon-badge" style="width:${size * 2}px;height:${size * 2}px;background:${color}1F">${icon(name, color, size)}</div>`;
}

/* ---------------- helpers ---------------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function ymNow() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
const MONTH_NAMES = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
function monthLabel(ym) { const [y, m] = ym.split("-").map(Number); return `${MONTH_NAMES[m - 1]} ${y}`; }
function shiftMonth(ym, delta) {
  let [y, m] = ym.split("-").map(Number);
  m += delta;
  if (m < 1) { m = 12; y -= 1; }
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}
function fmt(n) { return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(Math.round(n || 0)); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function esc(str) { return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ---------------- state ---------------- */
let state = {
  data: { categories: DEFAULT_CATEGORIES, expenses: [], debts: [] },
  tab: "overview",
  month: ymNow(),
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.data = {
        categories: parsed.categories || DEFAULT_CATEGORIES,
        expenses: parsed.expenses || [],
        debts: parsed.debts || [],
      };
    }
  } catch (e) { /* keep defaults */ }
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); }
  catch (e) { alert("تعذر حفظ البيانات محلياً — تأكد من توفر مساحة تخزين بالجهاز."); }
}

/* ---------------- derived ---------------- */
function monthExpenses() { return state.data.expenses.filter((e) => e.date.startsWith(state.month)); }
function totalBudget() { return state.data.categories.reduce((s, c) => s + (c.budget || 0), 0); }
function spentByCategory() {
  const map = {};
  monthExpenses().forEach((e) => { map[e.categoryId] = (map[e.categoryId] || 0) + e.amount; });
  return map;
}
function last6Months() {
  const arr = [];
  let m = state.month;
  for (let i = 0; i < 6; i++) { arr.unshift(m); m = shiftMonth(m, -1); }
  return arr.map((ym) => ({
    ym, label: monthLabel(ym).slice(0, 3),
    total: state.data.expenses.filter((e) => e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0),
  }));
}
function totalDebtRemaining() {
  return state.data.debts.reduce((s, d) => s + (d.totalAmount - (d.payments || []).reduce((p, x) => p + x.amount, 0)), 0);
}

/* ---------------- mutations ---------------- */
function addExpense(exp) { state.data.expenses.unshift({ id: uid(), ...exp }); saveData(); }
function deleteExpense(id) {
  if (!confirm("تحذف هذا المصروف؟")) return;
  state.data.expenses = state.data.expenses.filter((e) => e.id !== id);
  saveData(); render();
}
function upsertCategory(cat) {
  if (cat.id && state.data.categories.some((c) => c.id === cat.id)) {
    state.data.categories = state.data.categories.map((c) => (c.id === cat.id ? cat : c));
  } else {
    state.data.categories.push({ ...cat, id: uid() });
  }
  saveData();
}
function deleteCategory(id) {
  if (!confirm("تحذف هذي الفئة؟ العمليات المرتبطة فيها بتظل مسجلة.")) return;
  state.data.categories = state.data.categories.filter((c) => c.id !== id);
  saveData(); render();
}
function addDebt(debt) { state.data.debts.unshift({ id: uid(), payments: [], ...debt }); saveData(); }
function deleteDebt(id) {
  if (!confirm("تحذف هذا الدين؟")) return;
  state.data.debts = state.data.debts.filter((d) => d.id !== id);
  saveData(); render();
}
function payDebt(debtId, payment) {
  state.data.debts = state.data.debts.map((d) => d.id === debtId ? { ...d, payments: [...(d.payments || []), payment] } : d);
  saveData();
}

function exportCSV() {
  const rows = [["التاريخ", "الفئة", "المبلغ", "ملاحظة"]];
  state.data.expenses.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).forEach((e) => {
    const cat = state.data.categories.find((c) => c.id === e.categoryId);
    rows.push([e.date, cat ? cat.name : "غير محدد", e.amount, e.note || ""]);
  });
  rows.push([]);
  rows.push(["الديون"]);
  rows.push(["الاسم", "الإجمالي", "المسدد", "المتبقي"]);
  state.data.debts.forEach((d) => {
    const paid = (d.payments || []).reduce((s, p) => s + p.amount, 0);
    rows.push([d.name, d.totalAmount, paid, d.totalAmount - paid]);
  });
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `مصاريف-${state.month}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- rendering ---------------- */
function progressBar(pct, color) {
  const clamped = Math.min(pct, 100);
  const barColor = pct > 100 ? COLORS.danger : color;
  return `<div class="progress"><div style="width:${clamped}%;background:${barColor}"></div></div>`;
}

function gaugeHTML(spent, budget) {
  const overPct = budget > 0 ? (spent / budget) * 100 : 0;
  const pct = Math.min(overPct, 100);
  const r = 70, circumference = Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = overPct > 100 ? COLORS.danger : overPct > 85 ? COLORS.warn : COLORS.success;
  const remaining = budget - spent;
  return `
    <div class="gauge-wrap">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="${COLORS.border}" stroke-width="14" stroke-linecap="round"/>
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset .5s ease"/>
      </svg>
      <div class="gauge-value">${fmt(spent)} <small>ر.س</small></div>
      <div class="gauge-sub" style="color:${remaining < 0 ? COLORS.danger : COLORS.sub}">
        ${remaining >= 0 ? `متبقي ${fmt(remaining)} ر.س من ${fmt(budget)}` : `تجاوزت الميزانية بـ ${fmt(-remaining)} ر.س`}
      </div>
    </div>`;
}

function chartHTML() {
  const months = last6Months();
  const max = Math.max(1, ...months.map((m) => m.total));
  return `
    <div class="card">
      <div class="section-title" style="margin-top:0">${icon("trendingUp", COLORS.ink, 15)} اتجاه آخر 6 أشهر</div>
      <div class="chart-bars">
        ${months.map((m) => `
          <div class="chart-col">
            <div class="chart-bar" style="height:${Math.max(4, (m.total / max) * 90)}px" title="${fmt(m.total)} ر.س"></div>
            <div class="chart-col-label">${m.label}</div>
          </div>`).join("")}
      </div>
    </div>`;
}

function overviewHTML() {
  const spent = monthExpenses().reduce((s, e) => s + e.amount, 0);
  const spentMap = spentByCategory();
  const recent = monthExpenses().slice(0, 5);
  return `
    <div class="card">${gaugeHTML(spent, totalBudget())}</div>
    ${chartHTML()}
    <div class="section-title">الفئات هذا الشهر</div>
    ${state.data.categories.map((c) => {
      const cs = spentMap[c.id] || 0;
      const pct = c.budget > 0 ? (cs / c.budget) * 100 : 0;
      return `
        <div class="cat-card">
          <div class="row">
            ${iconBadge(c.icon, c.color, 16)}
            <div style="flex:1;min-width:0">
              <div class="cat-top">
                <span class="cat-name">${esc(c.name)}</span>
                <span class="cat-amounts" style="${pct > 100 ? `color:${COLORS.danger}` : ""}">${fmt(cs)} / ${fmt(c.budget)}</span>
              </div>
              ${progressBar(pct, c.color)}
            </div>
          </div>
        </div>`;
    }).join("")}
    ${recent.length ? `
      <div class="section-title">آخر العمليات</div>
      ${recent.map(txRowHTML).join("")}
    ` : ""}
  `;
}

function txRowHTML(e) {
  const cat = state.data.categories.find((c) => c.id === e.categoryId);
  return `
    <div class="tx-row">
      ${iconBadge(cat ? cat.icon : "moreHorizontal", cat ? cat.color : COLORS.sub, 14)}
      <div class="tx-main">
        <div class="tx-title">${esc(cat ? cat.name : "أخرى")}</div>
        <div class="tx-sub">${e.date}${e.note ? " · " + esc(e.note) : ""}</div>
      </div>
      <span class="tx-amount">${fmt(e.amount)}</span>
    </div>`;
}

function categoriesHTML() {
  const spentMap = spentByCategory();
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
      <div class="section-title" style="margin:0">الفئات وميزانياتها</div>
      <button class="btn btn-primary" onclick="openCategorySheet(null)">${icon("plus", "#fff", 14)} فئة جديدة</button>
    </div>
    ${state.data.categories.map((c) => {
      const cs = spentMap[c.id] || 0;
      const pct = c.budget > 0 ? (cs / c.budget) * 100 : 0;
      const remaining = c.budget - cs;
      return `
        <div class="cat-card">
          <div class="row" style="margin-bottom:8px">
            ${iconBadge(c.icon, c.color, 16)}
            <div style="flex:1">
              <div class="cat-name">${esc(c.name)}</div>
              <div class="cat-amounts" style="${remaining < 0 ? `color:${COLORS.danger}` : ""}">
                ${remaining >= 0 ? `متبقي ${fmt(remaining)} ر.س` : `تجاوز ${fmt(-remaining)} ر.س`}
              </div>
            </div>
            <button class="btn btn-ghost" onclick='openCategorySheet(${JSON.stringify(c.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
            <button class="btn btn-ghost" onclick='deleteCategory(${JSON.stringify(c.id)})'>${icon("trash", COLORS.danger, 13)}</button>
          </div>
          ${progressBar(pct, c.color)}
        </div>`;
    }).join("")}
  `;
}

function debtsHTML() {
  return `
    <div class="debt-summary">
      <div class="label">إجمالي المتبقي من الديون</div>
      <div class="value">${fmt(totalDebtRemaining())} <span style="font-size:14px;font-weight:500">ر.س</span></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
      <div class="section-title" style="margin:0">الديون</div>
      <button class="btn btn-primary" onclick="openDebtSheet()">${icon("plus", "#fff", 14)} دين جديد</button>
    </div>
    ${state.data.debts.length === 0 ? `<div class="empty-state">ماعندك ديون مسجلة</div>` : ""}
    ${state.data.debts.map((d) => {
      const paid = (d.payments || []).reduce((s, p) => s + p.amount, 0);
      const remaining = d.totalAmount - paid;
      const pct = d.totalAmount > 0 ? (paid / d.totalAmount) * 100 : 0;
      return `
        <div class="cat-card">
          <div class="row" style="margin-bottom:8px">
            ${iconBadge("creditCard", COLORS.gold, 16)}
            <div style="flex:1">
              <div class="cat-name">${esc(d.name)}</div>
              <div class="cat-amounts">سددت ${fmt(paid)} · متبقي ${fmt(remaining)} من ${fmt(d.totalAmount)}</div>
            </div>
            <button class="btn btn-ghost" onclick='deleteDebt(${JSON.stringify(d.id)})'>${icon("trash", COLORS.danger, 13)}</button>
          </div>
          ${progressBar(pct, COLORS.success)}
          ${remaining > 0 ? `<button class="btn" style="width:100%;justify-content:center;margin-top:10px;background:${COLORS.paper};color:${COLORS.ink};padding:9px;border-radius:12px" onclick='openPaySheet(${JSON.stringify(d.id)})'>تسجيل سداد</button>` : ""}
        </div>`;
    }).join("")}
  `;
}

function historyHTML() {
  const all = state.data.expenses.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
      <div class="section-title" style="margin:0">كل العمليات</div>
      <button class="btn btn-gold" onclick="exportCSV()">${icon("download", COLORS.ink, 14)} تصدير CSV</button>
    </div>
    ${all.length === 0 ? `<div class="empty-state">ماعندك عمليات مسجلة بعد</div>` : ""}
    ${all.map((e) => {
      const cat = state.data.categories.find((c) => c.id === e.categoryId);
      return `
        <div class="tx-row">
          ${iconBadge(cat ? cat.icon : "moreHorizontal", cat ? cat.color : COLORS.sub, 14)}
          <div class="tx-main">
            <div class="tx-title">${esc(cat ? cat.name : "أخرى")}</div>
            <div class="tx-sub">${e.date}${e.note ? " · " + esc(e.note) : ""}</div>
          </div>
          <span class="tx-amount">${fmt(e.amount)}</span>
          <button class="btn btn-ghost" onclick='deleteExpense(${JSON.stringify(e.id)})'>${icon("trash", COLORS.danger, 13)}</button>
        </div>`;
    }).join("")}
  `;
}

function headerHTML() {
  const atCurrentMonth = state.month >= ymNow();
  return `
    <div class="header">
      <div class="header-top">
        <div class="brand">${icon("wallet", COLORS.gold, 20)} محفظتي</div>
      </div>
      <div class="month-nav">
        <button onclick="changeMonth(-1)">${icon("chevronRight", "#fff", 16)}</button>
        <span class="month-label">${monthLabel(state.month)}</span>
        <button onclick="changeMonth(1)" ${atCurrentMonth ? "disabled" : ""}>${icon("chevronLeft", "#fff", 16)}</button>
      </div>
    </div>`;
}

function bottomNavHTML() {
  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "wallet" },
    { id: "categories", label: "الفئات", icon: "shoppingBag" },
    { id: "debts", label: "الديون", icon: "creditCard" },
    { id: "history", label: "السجل", icon: "receipt" },
  ];
  return `
    <div class="bottom-nav">
      ${tabs.map((t) => `
        <button class="nav-btn ${state.tab === t.id ? "active" : ""}" onclick='setTab(${JSON.stringify(t.id)})'>
          ${icon(t.icon, state.tab === t.id ? COLORS.ink : COLORS.sub, 19)}
          <span>${t.label}</span>
        </button>`).join("")}
    </div>`;
}

function render() {
  const app = document.getElementById("app");
  let body = "";
  if (state.tab === "overview") body = overviewHTML();
  else if (state.tab === "categories") body = categoriesHTML();
  else if (state.tab === "debts") body = debtsHTML();
  else if (state.tab === "history") body = historyHTML();

  app.innerHTML = `
    ${headerHTML()}
    <div class="content">${body}</div>
    <button class="fab" onclick="openExpenseSheet()">${icon("plus", COLORS.ink, 18)} إضافة مصروف</button>
    ${bottomNavHTML()}
  `;
}

function setTab(id) { state.tab = id; render(); }
function changeMonth(delta) { state.month = shiftMonth(state.month, delta); render(); }

/* ---------------- sheets (modals) ---------------- */
function closeSheet() {
  document.querySelectorAll(".overlay, .sheet").forEach((el) => el.remove());
}
function openSheetShell(title, bodyHTML) {
  closeSheet();
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.onclick = closeSheet;
  const sheet = document.createElement("div");
  sheet.className = "sheet";
  sheet.innerHTML = `
    <div class="sheet-header">
      <div class="sheet-title">${esc(title)}</div>
      <button class="btn btn-ghost" onclick="closeSheet()">${icon("x", COLORS.ink, 16)}</button>
    </div>
    <div id="sheetBody">${bodyHTML}</div>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
  return sheet;
}

/* -- add expense -- */
function openExpenseSheet() {
  let selectedCat = state.data.categories[0]?.id || null;
  const body = `
    <div class="field"><label>المبلغ (ر.س)</label><input id="f-amount" type="number" inputmode="decimal" placeholder="0"/></div>
    <div class="field"><label>الفئة</label>
      <div class="cat-grid" id="cat-grid">
        ${state.data.categories.map((c) => `
          <div class="cat-pick ${c.id === selectedCat ? "selected" : ""}" data-cat="${c.id}" style="--pick-color:${c.color}" onclick="pickExpenseCat(this,'${c.id}')">
            ${iconBadge(c.icon, c.color, 13)}<span>${esc(c.name)}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="field"><label>التاريخ</label><input id="f-date" type="date" value="${todayISO()}"/></div>
    <div class="field"><label>ملاحظة (اختياري)</label><input id="f-note" type="text" placeholder="مثال: غداء مع فريق العمل"/></div>
    <button class="btn btn-primary btn-block" onclick="submitExpense()">${icon("check", "#fff", 16)} حفظ المصروف</button>
  `;
  openSheetShell("إضافة مصروف", body);
  window.__selectedCat = selectedCat;
}
function pickExpenseCat(el, catId) {
  document.querySelectorAll("#cat-grid .cat-pick").forEach((n) => n.classList.remove("selected"));
  el.classList.add("selected");
  window.__selectedCat = catId;
}
function submitExpense() {
  const amount = parseFloat(document.getElementById("f-amount").value);
  const date = document.getElementById("f-date").value || todayISO();
  const note = document.getElementById("f-note").value.trim();
  const categoryId = window.__selectedCat;
  if (!amount || amount <= 0 || !categoryId) { alert("أدخل مبلغ صحيح واختر فئة"); return; }
  addExpense({ amount, categoryId, note, date });
  closeSheet(); render();
}

/* -- add/edit category -- */
const ICON_CHOICES = ["utensils", "car", "receipt", "shoppingBag", "heartPulse", "moreHorizontal", "creditCard", "wallet"];
const COLOR_CHOICES = ["#C97B3D", "#3E6B8A", "#8C5B8F", "#B3483B", "#3E7C5A", "#6B6456", "#C99A3A", "#1B3B34"];
function openCategorySheet(catId) {
  const cat = catId ? state.data.categories.find((c) => c.id === catId) : null;
  window.__catIcon = cat?.icon || "shoppingBag";
  window.__catColor = cat?.color || "#3E6B8A";
  const body = `
    <div class="field"><label>اسم الفئة</label><input id="f-catname" type="text" value="${esc(cat?.name || "")}" placeholder="مثال: تعليم"/></div>
    <div class="field"><label>الميزانية الشهرية (ر.س)</label><input id="f-catbudget" type="number" inputmode="decimal" value="${cat?.budget ?? ""}" placeholder="0"/></div>
    <div class="field"><label>الأيقونة</label>
      <div class="icon-choices" id="icon-choices">
        ${ICON_CHOICES.map((ic) => `<div class="icon-choice ${ic === window.__catIcon ? "selected" : ""}" data-icon="${ic}" onclick="pickCatIcon(this,'${ic}')">${iconBadge(ic, window.__catColor, 13)}</div>`).join("")}
      </div>
    </div>
    <div class="field"><label>اللون</label>
      <div class="color-swatches" id="color-swatches">
        ${COLOR_CHOICES.map((cl) => `<div class="swatch ${cl === window.__catColor ? "selected" : ""}" data-color="${cl}" style="background:${cl}" onclick="pickCatColor(this,'${cl}')"></div>`).join("")}
      </div>
    </div>
    <button class="btn btn-primary btn-block" onclick='submitCategory(${JSON.stringify(cat?.id || null)})'>${icon("check", "#fff", 16)} حفظ</button>
  `;
  openSheetShell(cat ? "تعديل الفئة" : "فئة جديدة", body);
}
function pickCatIcon(el, ic) {
  document.querySelectorAll("#icon-choices .icon-choice").forEach((n) => n.classList.remove("selected"));
  el.classList.add("selected");
  window.__catIcon = ic;
}
function pickCatColor(el, cl) {
  document.querySelectorAll("#color-swatches .swatch").forEach((n) => n.classList.remove("selected"));
  el.classList.add("selected");
  window.__catColor = cl;
  document.querySelectorAll("#icon-choices .icon-choice").forEach((n) => {
    n.innerHTML = iconBadge(n.dataset.icon, cl, 13);
  });
}
function submitCategory(catId) {
  const name = document.getElementById("f-catname").value.trim();
  const budget = parseFloat(document.getElementById("f-catbudget").value);
  if (!name || isNaN(budget) || budget < 0) { alert("أدخل اسم فئة وميزانية صحيحة"); return; }
  upsertCategory({ id: catId, name, budget, icon: window.__catIcon, color: window.__catColor });
  closeSheet(); render();
}

/* -- add debt -- */
function openDebtSheet() {
  const body = `
    <div class="field"><label>اسم الدين / الجهة</label><input id="f-debtname" type="text" placeholder="مثال: قرض بنكي"/></div>
    <div class="field"><label>المبلغ الإجمالي (ر.س)</label><input id="f-debttotal" type="number" inputmode="decimal" placeholder="0"/></div>
    <div class="field"><label>ملاحظة (اختياري)</label><input id="f-debtnote" type="text"/></div>
    <button class="btn btn-primary btn-block" onclick="submitDebt()">${icon("check", "#fff", 16)} حفظ الدين</button>
  `;
  openSheetShell("دين جديد", body);
}
function submitDebt() {
  const name = document.getElementById("f-debtname").value.trim();
  const totalAmount = parseFloat(document.getElementById("f-debttotal").value);
  const note = document.getElementById("f-debtnote").value.trim();
  if (!name || !totalAmount || totalAmount <= 0) { alert("أدخل اسم الدين ومبلغ صحيح"); return; }
  addDebt({ name, totalAmount, note });
  closeSheet(); render();
}

/* -- pay debt -- */
function openPaySheet(debtId) {
  const d = state.data.debts.find((x) => x.id === debtId);
  const paid = (d.payments || []).reduce((s, p) => s + p.amount, 0);
  const remaining = d.totalAmount - paid;
  const body = `
    <div style="font-size:14px;color:${COLORS.sub};margin-bottom:16px">المتبقي حالياً: ${fmt(remaining)} ر.س</div>
    <div class="field"><label>مبلغ السداد (ر.س)</label><input id="f-paymount" type="number" inputmode="decimal" placeholder="0"/></div>
    <button class="btn btn-block" style="background:${COLORS.success};color:#fff" onclick='submitPay(${JSON.stringify(debtId)})'>${icon("check", "#fff", 16)} تسجيل السداد</button>
  `;
  openSheetShell(`سداد: ${d.name}`, body);
}
function submitPay(debtId) {
  const amount = parseFloat(document.getElementById("f-paymount").value);
  if (!amount || amount <= 0) { alert("أدخل مبلغ سداد صحيح"); return; }
  payDebt(debtId, { amount, date: todayISO() });
  closeSheet(); render();
}

/* ---------------- init ---------------- */
loadData();
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
