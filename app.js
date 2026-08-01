/* ========= محفظتي - تطبيق إدارة المصاريف =========
   بيانات محلية بالكامل (localStorage) - PWA حقيقي قابل للتثبيت والعمل بدون نت */

const STORAGE_KEY = "mahfazti-data-v1";

const COLORS = {
  ink: "#1A2233", sub: "#6B7280", tertiary: "#9AA1AC",
  border: "#E3E7EE", card: "#FFFFFF", surfaceMuted: "#EEF1F6", paper: "#F7F8FA",
  primary: "#2E5AAC", primaryDark: "#26468C", primaryTint: "#E8EDF9",
  secondary: "#C3652F", secondaryTint: "#FBEDE4",
  danger: "#DC4C3F", dangerBg: "#FBE9E7", warn: "#E2A93B", warnBg: "#FBF1DE",
  success: "#2F9E5C", successBg: "#E8F6ED",
  gold: "#2E5AAC", // legacy alias -> primary, kept so existing call sites don't need renaming
};
window.COLORS = COLORS; // COLORS is `const` (script-scope, not a window property by default) — firebase-sync.js is a module and needs window.COLORS to see it

const DEFAULT_CATEGORIES = [
  { id: "food", name: "أكل ومطاعم", icon: "utensils", color: "#C97B3D", budget: 1200 },
  { id: "transport", name: "مواصلات", icon: "car", color: "#3E6B8A", budget: 500 },
  { id: "bills", name: "فواتير", icon: "receipt", color: "#8C5B8F", budget: 800 },
  { id: "shopping", name: "تسوق", icon: "shoppingBag", color: "#B3483B", budget: 600 },
  { id: "health", name: "صحة", icon: "heartPulse", color: "#3E7C5A", budget: 300 },
  { id: "other", name: "أخرى", icon: "moreHorizontal", color: "#6B6456", budget: 200 },
];

const DEFAULT_SETTINGS = {
  cycleStartDay: 1,
  overallBudget: DEFAULT_CATEGORIES.reduce((s, c) => s + c.budget, 0),
  debtBudget: 0,
  savingsBudget: 0,
  onboardingDismissed: false,
};

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
  settings: (c, s) => svg(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`, c, s),
  barChart: (c, s) => svg(`<path d="M4 20V10M12 20V4M20 20v-7"/>`, c, s),
  clipboard: (c, s) => svg(`<rect x="7" y="3" width="10" height="4" rx="1"/><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M9 12h6M9 16h6"/>`, c, s),
  graduationCap: (c, s) => svg(`<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>`, c, s),
  home: (c, s) => svg(`<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>`, c, s),
  film: (c, s) => svg(`<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>`, c, s),
  send: (c, s) => svg(`<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-9Z"/>`, c, s),
  gift: (c, s) => svg(`<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-1.6 0-3-1-3-2.5S10.2 3 12 5c1.8-2 3-1 3 .5S13.6 8 12 8Z"/>`, c, s),
  smartphone: (c, s) => svg(`<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>`, c, s),
  coffee: (c, s) => svg(`<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/>`, c, s),
  fuel: (c, s) => svg(`<path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><path d="M3 21h12"/><path d="M14 8h2l3 3v6a1.5 1.5 0 0 1-3 0v-2a1.5 1.5 0 0 0-1.5-1.5H14"/>`, c, s),
  piggyBank: (c, s) => svg(`<path d="M11 5c-4 0-7 2.5-7 6 0 1.6.7 3 1.8 4.1L5 18h3l.7-1c.7.2 1.5.3 2.3.3s1.6-.1 2.3-.3l.7 1h3l-.8-2.9C18.3 14 19 12.6 19 11c0-.7-.1-1.3-.4-1.9L21 8l-2-1-1.2 1.2C16.4 6.7 13.9 5 11 5Z"/><circle cx="8" cy="10" r="1"/>`, c, s),
  cloud: (c, s) => svg(`<path d="M7 18a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 16.9 8.2 4 4 0 0 1 17.5 16"/><path d="M7 18h10.5"/>`, c, s),
  cloudCheck: (c, s) => svg(`<path d="M7 17a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 16.9 7.2 4 4 0 0 1 17.5 15"/><path d="M7 17h10.5"/><path d="M9.5 12.5l2 2 3.5-4"/>`, c, s),
  shoppingBasket: (c, s) => svg(`<path d="M4 9h16"/><path d="M4 9l1.4 10.2A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.8L20 9"/><path d="M7 9l9-6"/><path d="M17 9L8 3"/><path d="M9 12.5v5M12 12.5v5M15 12.5v5"/>`, c, s),
};
function icon(name, color, size = 20) {
  return (ICONS[name] || ICONS.moreHorizontal)(color, size);
}
function iconBadge(name, color, size = 20) {
  return `<div class="icon-badge" style="width:${size * 2}px;height:${size * 2}px;background:${color}1F">${icon(name, color, size)}</div>`;
}

/* ---------------- helpers ---------------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
const MONTH_NAMES = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
function shiftMonth(ym, delta) {
  let [y, m] = ym.split("-").map(Number);
  m += delta;
  if (m < 1) { m = 12; y -= 1; }
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}
function fmt(n) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n || 0)); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function esc(str) { return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ---------------- streak (any day you logged an expense or a grocery item) ---------------- */
function dateAddDays(iso, delta) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
function activeDatesSet() {
  const dates = new Set(state.data.expenses.map((e) => e.date));
  if (typeof groceryData !== "undefined" && groceryData.items) groceryData.items.forEach((it) => dates.add(it.date));
  return dates;
}
function loggedToday() { return activeDatesSet().has(todayISO()); }
function currentStreak() {
  const dates = activeDatesSet();
  let cursor = todayISO();
  if (!dates.has(cursor)) cursor = dateAddDays(cursor, -1);
  let streak = 0;
  while (dates.has(cursor)) { streak++; cursor = dateAddDays(cursor, -1); }
  return streak;
}
function bestStreak() {
  const dates = [...activeDatesSet()].sort();
  let best = 0, run = 0, prev = null;
  for (const d of dates) {
    run = prev && dateAddDays(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}
function streakBadgeHTML() {
  const streak = currentStreak();
  if (streak <= 0) return "";
  return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:700;color:${COLORS.warn};background:${COLORS.warnBg};padding:3px 9px;border-radius:999px">🔥 ${streak}</span>`;
}
function streakCardHTML() {
  const streak = currentStreak();
  const best = bestStreak();
  const today = loggedToday();
  const message = today
    ? "سجلت اليوم — استمر على نفس الوتيرة!"
    : streak > 0
      ? "سجّل مصروف أو عنصر بقالة اليوم قبل ما تفقد سلسلتك 😬"
      : "سجّل أول عملية اليوم وابدأ سلسلتك";
  return `
    <div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="font-size:32px;line-height:1;${streak > 0 ? "" : "filter:grayscale(1);opacity:.4"}">🔥</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:baseline;gap:6px">
          <span style="font-family:'Cairo',sans-serif;font-weight:800;font-size:22px">${streak}</span>
          <span style="font-size:13px;color:${COLORS.sub}">يوم متتالي${best > streak ? ` · أفضل رقم ${best} يوم` : ""}</span>
        </div>
        <div style="font-size:12.5px;color:${today ? COLORS.success : COLORS.warn};margin-top:2px;font-weight:600">${message}</div>
      </div>
    </div>`;
}

/* ---------------- budget cycle (supports starting mid-month, keeps working forever) ---------------- */
function getCycleStartDay() { return (state.data.settings && state.data.settings.cycleStartDay) || 1; }
function cycleKeyForDate(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  const startDay = getCycleStartDay();
  let y = d.getFullYear(), m = d.getMonth() + 1;
  if (d.getDate() < startDay) { m -= 1; if (m < 1) { m = 12; y -= 1; } }
  return `${y}-${String(m).padStart(2, "0")}`;
}
function cycleNow() { return cycleKeyForDate(todayISO()); }
function cycleRange(key) {
  const [y, m] = key.split("-").map(Number);
  const startDay = getCycleStartDay();
  const start = new Date(y, m - 1, startDay);
  const end = new Date(y, m, startDay);
  return { start, end };
}
function dateInCycle(dateISO, key) {
  const { start, end } = cycleRange(key);
  const d = new Date(dateISO + "T00:00:00");
  return d >= start && d < end;
}
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  if (getCycleStartDay() === 1) return `${MONTH_NAMES[m - 1]} ${y}`;
  const { start, end } = cycleRange(ym);
  const endInclusive = new Date(end);
  endInclusive.setDate(endInclusive.getDate() - 1);
  const short = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  return `${short(start)} – ${short(endInclusive)} ${endInclusive.getFullYear()}`;
}
function cycleWeeks(key) {
  const { start, end } = cycleRange(key);
  const totalDays = Math.round((end - start) / 86400000);
  const base = Math.floor(totalDays / 4);
  let cursor = new Date(start);
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const days = i === 3 ? (totalDays - base * 3) : base;
    const wStart = new Date(cursor);
    const wEnd = new Date(cursor); wEnd.setDate(wEnd.getDate() + days);
    weeks.push({ start: wStart, end: wEnd });
    cursor = wEnd;
  }
  return weeks;
}
function categoryWeeklyStatus(cat, key) {
  const weeks = cycleWeeks(key);
  const weeklyBudget = (cat.budget || 0) / 4;
  const today = new Date(todayISO() + "T00:00:00");
  const exps = state.data.expenses.filter((e) => e.categoryId === cat.id && dateInCycle(e.date, key));
  return weeks.map((w, i) => {
    const spent = exps
      .filter((e) => { const d = new Date(e.date + "T00:00:00"); return d >= w.start && d < w.end; })
      .reduce((s, e) => s + e.amount, 0);
    let status;
    if (today < w.start) status = "upcoming";
    else if (today >= w.end) status = spent <= weeklyBudget ? "done-ok" : "done-over";
    else {
      const totalDays = Math.max(1, Math.round((w.end - w.start) / 86400000));
      const elapsed = Math.min(totalDays, Math.max(1, Math.round((today - w.start) / 86400000) + 1));
      const expected = weeklyBudget * (elapsed / totalDays);
      status = spent <= expected * 1.15 ? "on-track" : "over";
    }
    return { index: i + 1, spent, budget: weeklyBudget, status };
  });
}

/* ---------------- state ---------------- */
let state = {
  data: { categories: DEFAULT_CATEGORIES, expenses: [], debts: [], settings: DEFAULT_SETTINGS, merchantMap: {}, savingsGoals: [] },
  tab: "overview",
  month: null,
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
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        merchantMap: parsed.merchantMap || {},
        savingsGoals: parsed.savingsGoals || [],
      };
    }
  } catch (e) { /* keep defaults */ }
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); }
  catch (e) { alert("تعذر حفظ البيانات محلياً — تأكد من توفر مساحة تخزين بالجهاز."); }
}

/* ---------------- derived ---------------- */
function monthExpenses() { return state.data.expenses.filter((e) => dateInCycle(e.date, state.month)); }
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
    total: state.data.expenses.filter((e) => dateInCycle(e.date, ym)).reduce((s, e) => s + e.amount, 0),
  }));
}
function totalDebtRemaining() {
  return state.data.debts.reduce((s, d) => s + (d.totalAmount - (d.payments || []).reduce((p, x) => p + x.amount, 0)), 0);
}

/* ---------------- mutations ---------------- */
/* bridge for firebase-sync.js (a module script, can't see this file's `let state` binding directly) */
function __getBudgetState() { return state.data; }
function __setBudgetState(data) { state.data = data; state.month = cycleNow(); }

function addExpense(exp) { state.data.expenses.unshift({ id: uid(), ...exp }); saveData(); }
function updateExpense(id, patch) {
  state.data.expenses = state.data.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveData();
}
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
function addSavingsGoal(goal) { state.data.savingsGoals.unshift({ id: uid(), contributions: [], ...goal }); saveData(); }
function deleteSavingsGoal(id) {
  if (!confirm("تحذف هذا الهدف؟")) return;
  state.data.savingsGoals = state.data.savingsGoals.filter((g) => g.id !== id);
  saveData(); render();
}
function addGoalContribution(goalId, contribution) {
  state.data.savingsGoals = state.data.savingsGoals.map((g) => g.id === goalId ? { ...g, contributions: [...(g.contributions || []), contribution] } : g);
  saveData();
}
function goalSaved(g) { return (g.contributions || []).reduce((s, c) => s + c.amount, 0); }
function goalMonthlyNeeded(g) {
  if (!g.targetDate) return null;
  const remaining = g.targetAmount - goalSaved(g);
  if (remaining <= 0) return 0;
  const today = new Date(todayISO() + "T00:00:00");
  const target = new Date(g.targetDate + "T00:00:00");
  const monthsLeft = Math.max(1, Math.ceil((target - today) / (30 * 86400000)));
  return remaining / monthsLeft;
}

/* ---------------- bank SMS parsing + merchant memory ---------------- */
function parseBankSMS(text) {
  const amountMatch =
    text.match(/(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|ر\.س|SAR|SR)/i) ||
    text.match(/(?:ريال|ر\.س|SAR|SR)\s*(\d[\d,]*(?:\.\d{1,2})?)/i) ||
    text.match(/(\d[\d,]*(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

  let merchant = null;
  const merchantMatch = text.match(/(?:لدى|في|Merchant[:：]?|at)\s*([A-Za-z؀-ۿ0-9 &._-]{2,40})/i);
  if (merchantMatch) {
    merchant = merchantMatch[1]
      .replace(/\s+(بتاريخ|تاريخ|الساعة|الوقت|رقم|حساب|بواسطة|SAR|SR|ريال|ر\.س)(?![A-Za-z؀-ۿ]).*/i, "")
      .trim()
      .replace(/\s+/g, " ");
  }

  let date = null;
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    let [, dd, mm, yyyy] = dateMatch;
    if (yyyy.length === 2) yyyy = "20" + yyyy;
    date = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return { amount, merchant, date };
}
function findCategoryByMerchant(merchant) {
  if (!merchant) return null;
  const norm = merchant.toLowerCase().trim();
  const map = state.data.merchantMap || {};
  if (map[norm]) return map[norm];
  for (const key in map) {
    if (norm.includes(key) || key.includes(norm)) return map[key];
  }
  return null;
}
function rememberMerchant(merchant, categoryId) {
  if (!merchant) return;
  const norm = merchant.toLowerCase().trim();
  state.data.merchantMap = state.data.merchantMap || {};
  state.data.merchantMap[norm] = categoryId;
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
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
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
function budgetUsageColor(pct, baseColor) { return pct >= 80 && pct <= 100 ? COLORS.warn : baseColor; }

function gaugeHTML(spent, budget) {
  const overPct = budget > 0 ? (spent / budget) * 100 : 0;
  const pct = Math.min(overPct, 100);
  const r = 70, circumference = Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = overPct > 100 ? "#FF8A80" : overPct > 85 ? "#FFD98A" : "#FFFFFF";
  const remaining = budget - spent;
  return `
    <div class="gauge-wrap">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#ffffff33" stroke-width="14" stroke-linecap="round"/>
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset .5s ease"/>
      </svg>
      <div class="gauge-value" style="color:#fff">${fmt(spent)} <small style="color:#ffffffb3">ر.س</small></div>
      <div class="gauge-sub" style="color:${remaining < 0 ? "#FFCDC7" : "#ffffffcc"}">
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
        ${months.map((m, i) => `
          <div class="chart-col">
            <div class="chart-bar" style="height:${Math.max(4, (m.total / max) * 90)}px;background:${i === months.length - 1 ? COLORS.primary : COLORS.primaryTint}" title="${fmt(m.total)} ر.س"></div>
            <div class="chart-col-label">${m.label}</div>
          </div>`).join("")}
      </div>
    </div>`;
}

function categoryPieHTML(spentMap) {
  const entries = state.data.categories
    .map((c) => ({ ...c, spent: spentMap[c.id] || 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const total = entries.reduce((s, c) => s + c.spent, 0);
  if (!entries.length) {
    return `
      <div class="card">
        <div class="section-title" style="margin-top:0">توزيع المصروفات</div>
        <div class="empty-state" style="padding:20px 0">ماعندك مصاريف مسجلة هذا الشهر بعد</div>
      </div>`;
  }
  let cursor = 0;
  const stops = entries.map((c) => {
    const start = (cursor / total) * 100;
    cursor += c.spent;
    const end = (cursor / total) * 100;
    return `${c.color} ${start}% ${end}%`;
  }).join(", ");
  return `
    <div class="card">
      <div class="section-title" style="margin-top:0">توزيع المصروفات</div>
      <div class="pie-wrap">
        <div class="pie-donut" style="background:conic-gradient(${stops})"></div>
        <div class="pie-center">
          <div class="pie-total">${fmt(total)}</div>
          <div class="pie-total-sub">ر.س</div>
        </div>
      </div>
      <div class="pie-legend">
        ${entries.map((c) => `
          <div class="pie-legend-row">
            <span class="pie-dot" style="background:${c.color}"></span>
            <span class="pie-legend-name">${esc(c.name)}</span>
            <span class="pie-legend-amt">${fmt(c.spent)} ر.س · ${fmt(total > 0 ? (c.spent / total) * 100 : 0)}%</span>
          </div>`).join("")}
      </div>
    </div>`;
}

function onboardingBannerHTML() {
  if (state.data.expenses.length > 0 || state.data.settings.onboardingDismissed) return "";
  return `
    <div class="card" style="background:${COLORS.primary};color:#fff">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px">
        <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px">👋 ابدأ إعداد ميزانيتك الشهرية</div>
        <button class="btn btn-ghost" style="background:#ffffff22;flex-shrink:0" onclick="dismissOnboarding()" title="تذكرني لاحقاً">${icon("x", "#fff", 13)}</button>
      </div>
      <ol style="font-size:13px;line-height:1.9;padding-inline-start:18px;margin:0 0 12px;color:#ffffffd9">
        <li>حدد يوم بداية شهرك المالي من الإعدادات ⚙️ (١ لبداية الشهر، أو يوم استلام راتبك لو بديت من نص الشهر)</li>
        <li>روح تبويب "الفئات" وحدد ميزانية شهرية لكل فئة تناسب وضعك</li>
        <li>سجّل مصاريفك أول بأول — يدوياً أو بلصق رسالة تنبيه البنك مباشرة</li>
        <li>تابع تقدمك الأسبوعي لكل فئة، والشهري من "نظرة عامة" و"التقارير"</li>
      </ol>
      <div class="row" style="gap:8px">
        <button class="btn btn-gold" onclick="openSettingsSheet()">ابدأ الإعداد</button>
        <button class="btn" style="background:#ffffff22;color:#fff" onclick="dismissOnboarding()">لاحقاً</button>
      </div>
    </div>`;
}
function dismissOnboarding() {
  state.data.settings.onboardingDismissed = true;
  saveData(); render();
}

function overviewHTML() {
  const spent = monthExpenses().reduce((s, e) => s + e.amount, 0);
  const budget = totalBudget();
  const spentMap = spentByCategory();
  const recent = monthExpenses().slice(0, 5);
  return `
    ${onboardingBannerHTML()}
    ${streakCardHTML()}
    <div class="mobile-only"><div class="card hero-gradient">${gaugeHTML(spent, budget)}</div></div>
    <div class="overview-grid-1 desktop-only">
      ${budgetRingCardHTML(spent, budget)}
      ${availableBalanceHeroHTML(spent, budget)}
    </div>
    <div class="mobile-only">${categoryPieHTML(spentMap)}</div>
    <div class="overview-grid-2 desktop-only">
      <div class="card">
        <div class="section-title" style="margin-top:0">آخر العمليات</div>
        ${recent.length ? recent.map(txRowHTML).join("") : `<div class="empty-state" style="padding:20px 0">ماعندك عمليات مسجلة بعد</div>`}
      </div>
      ${categoryStackedBarHTML(spentMap)}
    </div>
    ${debtBudgetStatHTML()}
    <div class="mobile-only">
      ${chartHTML()}
      <div class="section-title">الفئات هذا الشهر</div>
      ${state.data.categories.map((c) => {
        const cs = spentMap[c.id] || 0;
        const pct = c.budget > 0 ? (cs / c.budget) * 100 : 0;
        const nearLimit = c.budget > 0 && pct >= 80 && pct <= 100;
        return `
          <div class="cat-card">
            <div class="row">
              ${iconBadge(c.icon, c.color, 16)}
              <div style="flex:1;min-width:0">
                <div class="cat-top">
                  <span class="cat-name">${esc(c.name)}</span>
                  <span class="cat-amounts" style="${pct > 100 ? `color:${COLORS.danger}` : nearLimit ? `color:${COLORS.warn}` : ""}">${fmt(cs)} / ${fmt(c.budget)}${nearLimit ? " ⚠️" : ""}</span>
                </div>
                ${progressBar(pct, budgetUsageColor(pct, c.color))}
              </div>
            </div>
          </div>`;
      }).join("")}
      ${recent.length ? `
        <div class="section-title">آخر العمليات</div>
        ${recent.map(txRowHTML).join("")}
      ` : ""}
    </div>
  `;
}

function budgetRingCardHTML(spent, budget) {
  const overPct = budget > 0 ? (spent / budget) * 100 : 0;
  const pct = Math.min(overPct, 100);
  const r = 40, circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = overPct > 100 ? COLORS.danger : overPct > 85 ? COLORS.warn : COLORS.primary;
  return `
    <div class="card">
      <div class="row" style="gap:20px">
        <div style="flex:1">
          <div class="section-title" style="margin-top:0">الميزانية الشهرية</div>
          <div style="font-size:13px;color:${COLORS.sub}">${fmt(spent)} من ${fmt(budget)} ر.س مستخدَمة</div>
        </div>
        <div class="ring-wrap">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="${r}" fill="none" stroke="${COLORS.border}" stroke-width="10"/>
            <circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset .5s ease"/>
          </svg>
          <div class="ring-pct">${Math.round(overPct)}%</div>
        </div>
      </div>
    </div>`;
}
function availableBalanceHeroHTML(spent, budget) {
  const remaining = budget - spent;
  const prevMonth = shiftMonth(state.month, -1);
  const prevSpent = state.data.expenses.filter((e) => dateInCycle(e.date, prevMonth)).reduce((s, e) => s + e.amount, 0);
  const delta = remaining - (budget - prevSpent);
  const deltaText = delta >= 0 ? `أكثر بـ ${fmt(delta)} ر.س عن الشهر الماضي` : `أقل بـ ${fmt(Math.abs(delta))} ر.س عن الشهر الماضي`;
  return `
    <div class="card hero-gradient">
      <div style="font-size:13px;color:#ffffffcc">الرصيد المتاح من الميزانية</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:34px;color:#fff;margin-top:10px">${remaining < 0 ? "تجاوزت بـ " : ""}${fmt(Math.abs(remaining))} <small style="font-size:15px;font-weight:500;color:#ffffffcc">ر.س</small></div>
      <div class="delta-pill" style="margin-top:14px">${deltaText}</div>
    </div>`;
}
function categoryStackedBarHTML(spentMap) {
  const entries = state.data.categories
    .map((c) => ({ ...c, spent: spentMap[c.id] || 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const total = entries.reduce((s, c) => s + c.spent, 0);
  if (!entries.length) {
    return `<div class="card"><div class="section-title" style="margin-top:0">توزيع المصاريف</div><div class="empty-state" style="padding:20px 0">ماعندك مصاريف مسجلة هذا الشهر بعد</div></div>`;
  }
  return `
    <div class="card">
      <div class="section-title" style="margin-top:0">توزيع المصاريف</div>
      <div class="stack-bar">
        ${entries.map((c) => `<div style="width:${total > 0 ? (c.spent / total) * 100 : 0}%;background:${c.color}"></div>`).join("")}
      </div>
      <div class="alloc-rows">
        ${entries.map((c) => `
          <div class="alloc-row">
            <span class="alloc-dot" style="background:${c.color}"></span>
            <span class="alloc-label">${esc(c.name)}</span>
            <span class="alloc-amt">${fmt(c.spent)} ر.س</span>
          </div>`).join("")}
      </div>
    </div>`;
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

const WEEK_STATUS_COLOR = { "on-track": COLORS.success, over: COLORS.danger, "done-ok": COLORS.success, "done-over": COLORS.danger, upcoming: COLORS.border };
const WEEK_STATUS_LABEL = { "on-track": "على المسار", over: "متجاوز", "done-ok": "ملتزم", "done-over": "تجاوزت", upcoming: "قادم" };
function weeklyMiniHTML(cat) {
  if (!cat.budget) return `<div style="font-size:11px;color:${COLORS.sub};margin-top:8px">حدد ميزانية للفئة عشان يظهر تتبعها الأسبوعي</div>`;
  const weeks = categoryWeeklyStatus(cat, state.month);
  return `
    <div class="week-strip">
      ${weeks.map((w) => `
        <div class="week-seg" style="background:${WEEK_STATUS_COLOR[w.status]}22;border-color:${WEEK_STATUS_COLOR[w.status]}">
          <span class="week-num">أسبوع ${w.index}</span>
          <span class="week-amt">${fmt(w.spent)}/${fmt(w.budget)}</span>
          <span class="week-status" style="color:${WEEK_STATUS_COLOR[w.status]}">${WEEK_STATUS_LABEL[w.status]}</span>
        </div>`).join("")}
    </div>`;
}

function allocatedTotal() { return totalBudget() + (state.data.settings.debtBudget || 0) + (state.data.settings.savingsBudget || 0); }
function debtPaymentsThisCycle() {
  let total = 0;
  state.data.debts.forEach((d) => (d.payments || []).forEach((p) => { if (dateInCycle(p.date, state.month)) total += p.amount; }));
  return total;
}
function debtBudgetStatHTML() {
  const budget = state.data.settings.debtBudget || 0;
  if (!budget) return "";
  const paid = debtPaymentsThisCycle();
  const pct = budget > 0 ? (paid / budget) * 100 : 0;
  return `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;color:${COLORS.sub}">سداد الديون هذا الشهر</span>
        <span style="font-weight:700;font-size:13px">${fmt(pct)}%</span>
      </div>
      ${progressBar(pct, COLORS.warn)}
      <div style="font-size:12px;color:${COLORS.sub};margin-top:6px">${fmt(paid)} من ${fmt(budget)} ر.س</div>
    </div>`;
}
function allocRowHTML(label, amt, overall, color, onclick) {
  return `
    <div class="alloc-row" ${onclick ? `onclick="${onclick}" style="cursor:pointer"` : ""}>
      <span class="alloc-dot" style="background:${color}"></span>
      <span class="alloc-label">${label}</span>
      <span class="alloc-amt">${fmt(amt)} ر.س<small> · ${overall > 0 ? fmt((amt / overall) * 100) : 0}%</small></span>
    </div>`;
}
function allocationCardHTML() {
  const overall = state.data.settings.overallBudget || 0;
  const catAlloc = totalBudget();
  const debtAlloc = state.data.settings.debtBudget || 0;
  const savingsAlloc = state.data.settings.savingsBudget || 0;
  const allocated = catAlloc + debtAlloc + savingsAlloc;
  const remaining = overall - allocated;
  const over = remaining < 0;
  const pct = overall > 0 ? (allocated / overall) * 100 : 0;
  let note;
  if (overall <= 0) note = "حدد ميزانيتك الشهرية الكاملة عشان تعرف كم باقي بدون توزيع";
  else if (over) note = `وزعت ${fmt(allocated)} ر.س — تجاوزت الميزانية الكاملة بـ ${fmt(-remaining)} ر.س`;
  else if (remaining === 0) note = `وزعت كامل الميزانية (${fmt(allocated)} ر.س)`;
  else note = `وزعت ${fmt(allocated)} من ${fmt(overall)} ر.س — باقي ${fmt(remaining)} ر.س ما توزع بعد`;
  return `
    <div class="card" style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
        <div class="section-title" style="margin:0">الميزانية الشهرية الكاملة</div>
        <button class="btn btn-ghost" onclick="openOverallBudgetSheet()">${icon("pencil", COLORS.sub, 13)}</button>
      </div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:26px;margin:6px 0 10px">${fmt(overall)} <small style="font-size:13px;color:${COLORS.sub};font-weight:500">ر.س</small></div>
      ${progressBar(pct, over ? COLORS.danger : COLORS.success)}
      <div style="font-size:12.5px;margin:8px 0 14px;color:${over ? COLORS.danger : COLORS.sub}">${note}</div>
      <div class="alloc-rows">
        ${allocRowHTML("الفئات", catAlloc, overall, COLORS.ink)}
        ${allocRowHTML("سداد الديون", debtAlloc, overall, COLORS.warn, "setTab('debts')")}
        ${allocRowHTML("التوفير", savingsAlloc, overall, COLORS.success)}
      </div>
      <button class="btn btn-block" style="background:${COLORS.paper};color:${COLORS.ink};margin-top:14px" onclick="openBudgetSetupSheet()">${icon("settings", COLORS.ink, 15)} إعداد الميزانية الكاملة</button>
    </div>`;
}
function openOverallBudgetSheet() {
  const body = `
    <div class="field"><label>الميزانية الشهرية الكاملة (ر.س)</label><input id="f-overall" type="number" inputmode="decimal" value="${state.data.settings.overallBudget || ""}" placeholder="مثال: 6000"/></div>
    <div style="font-size:12px;color:${COLORS.sub};margin:-8px 0 16px;line-height:1.7">هذا إجمالي المبلغ اللي تبي توزعه كل شهر (دخلك مثلاً) — على فئاتك، وسداد الديون، والتوفير.</div>
    <button class="btn btn-primary btn-block" onclick="saveOverallBudget()">${icon("check", "#fff", 16)} حفظ</button>
  `;
  openSheetShell("الميزانية الشهرية الكاملة", body);
}
function saveOverallBudget() {
  const val = parseFloat(document.getElementById("f-overall").value);
  state.data.settings.overallBudget = isNaN(val) || val < 0 ? 0 : val;
  saveData();
  closeSheet(); render();
}

/* -- consolidated monthly budget setup -- */
function openBudgetSetupSheet() {
  const s = state.data.settings;
  const body = `
    <div class="field"><label>الميزانية الشهرية الكاملة (ر.س)</label><input id="bs-overall" type="number" inputmode="decimal" value="${s.overallBudget || ""}" oninput="updateBudgetSetupSummary()" placeholder="مثال: 6000"/></div>
    <button type="button" class="btn btn-gold" style="margin:-8px 0 16px" onclick="suggest502030()">✨ اقترح لي توزيع 50/30/20</button>
    <div class="field"><label>مخصص لسداد الديون شهرياً (ر.س)</label><input id="bs-debt" type="number" inputmode="decimal" value="${s.debtBudget || ""}" oninput="updateBudgetSetupSummary()" placeholder="0"/></div>
    <div class="field"><label>مخصص للتوفير شهرياً (ر.س)</label><input id="bs-savings" type="number" inputmode="decimal" value="${s.savingsBudget || ""}" oninput="updateBudgetSetupSummary()" placeholder="0"/></div>
    <div id="bs-summary" style="font-size:13px;color:${COLORS.sub};background:${COLORS.paper};border-radius:12px;padding:12px;margin-bottom:16px;line-height:1.9"></div>
    <button class="btn btn-primary btn-block" onclick="saveBudgetSetup()">${icon("check", "#fff", 16)} حفظ</button>
    <div class="section-title">فئات مصاريفك</div>
    <div style="font-size:13px;color:${COLORS.sub};margin-bottom:10px;line-height:1.8">وزّع الباقي من ميزانيتك على فئاتك — عدّل ميزانية كل فئة من تبويب "الفئات"، وبتشوف نسبتها من الإجمالي أول بأول.</div>
    ${state.data.categories.map((c) => `
      <div class="cat-card" style="padding:10px 14px">
        <div class="row">
          ${iconBadge(c.icon, c.color, 14)}
          <div style="flex:1"><span class="cat-name">${esc(c.name)}</span></div>
          <span class="cat-amounts">${fmt(c.budget)} ر.س</span>
        </div>
      </div>`).join("")}
  `;
  openSheetShell("إعداد الميزانية الكاملة", body);
  updateBudgetSetupSummary();
}
function suggest502030() {
  const overall = parseFloat(document.getElementById("bs-overall").value) || 0;
  if (!overall) { alert("أدخل الميزانية الشهرية الكاملة أولاً"); return; }
  document.getElementById("bs-debt").value = Math.round(overall * 0.1);
  document.getElementById("bs-savings").value = Math.round(overall * 0.1);
  updateBudgetSetupSummary();
}
function updateBudgetSetupSummary() {
  const overall = parseFloat(document.getElementById("bs-overall").value) || 0;
  const debt = parseFloat(document.getElementById("bs-debt").value) || 0;
  const savings = parseFloat(document.getElementById("bs-savings").value) || 0;
  const catAlloc = totalBudget();
  const allocated = catAlloc + debt + savings;
  const remaining = overall - allocated;
  const el = document.getElementById("bs-summary");
  el.innerHTML = `
    ${overall > 0 ? `بحسب قاعدة 50/30/20: خصص للفئات (ضروريات وكماليات) حتى ${fmt(overall * 0.8)} ر.س (٪80)، و${fmt(overall * 0.1)} ر.س للديون و${fmt(overall * 0.1)} ر.س للتوفير (٪10 لكل وحد)<br/><br/>` : ""}
    ميزانية الفئات الحالية: <strong>${fmt(catAlloc)} ر.س</strong><br/>
    إجمالي الموزّع (فئات + ديون + توفير): <strong>${fmt(allocated)} ر.س</strong><br/>
    ${remaining >= 0
      ? `باقي بدون توزيع: <strong style="color:${COLORS.success}">${fmt(remaining)} ر.س</strong>`
      : `تجاوزت الميزانية بـ: <strong style="color:${COLORS.danger}">${fmt(-remaining)} ر.س</strong>`}
  `;
}
function saveBudgetSetup() {
  const overall = parseFloat(document.getElementById("bs-overall").value);
  const debt = parseFloat(document.getElementById("bs-debt").value);
  const savings = parseFloat(document.getElementById("bs-savings").value);
  state.data.settings.overallBudget = isNaN(overall) || overall < 0 ? 0 : overall;
  state.data.settings.debtBudget = isNaN(debt) || debt < 0 ? 0 : debt;
  state.data.settings.savingsBudget = isNaN(savings) || savings < 0 ? 0 : savings;
  saveData();
  closeSheet(); render();
}

function categoryStatusPill(pct) {
  if (pct > 100) return { label: "تجاوزت الميزانية", color: COLORS.danger, bg: COLORS.dangerBg };
  if (pct >= 80) return { label: "قريب من الحد", color: COLORS.warn, bg: COLORS.warnBg };
  return { label: "ضمن الحد", color: COLORS.success, bg: COLORS.successBg };
}
function categoriesHTML() {
  const spentMap = spentByCategory();
  const overallVal = state.data.settings.overallBudget || 0;
  return `
    ${allocationCardHTML()}
    <div class="section-title">الفئات وميزانياتها</div>
    <div class="mobile-only">
      ${state.data.categories.map((c) => {
        const cs = spentMap[c.id] || 0;
        const pct = c.budget > 0 ? (cs / c.budget) * 100 : 0;
        const remaining = c.budget - cs;
        const nearLimit = c.budget > 0 && pct >= 80 && pct <= 100;
        const ofTotal = overallVal > 0 ? ` · ${fmt((c.budget / overallVal) * 100)}% من الإجمالي` : "";
        return `
          <div class="cat-card">
            <div class="row" style="margin-bottom:8px">
              ${iconBadge(c.icon, c.color, 16)}
              <div style="flex:1">
                <div class="cat-name">${esc(c.name)}</div>
                <div class="cat-amounts" style="${remaining < 0 ? `color:${COLORS.danger}` : nearLimit ? `color:${COLORS.warn}` : ""}">
                  ${remaining >= 0 ? `متبقي ${fmt(remaining)} ر.س` : `تجاوز ${fmt(-remaining)} ر.س`}${nearLimit ? " ⚠️ قاربت الحد" : ""}${ofTotal}
                </div>
              </div>
              <button class="btn btn-ghost" onclick='openCategorySheet(${JSON.stringify(c.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
              <button class="btn btn-ghost" onclick='deleteCategory(${JSON.stringify(c.id)})'>${icon("trash", COLORS.danger, 13)}</button>
            </div>
            ${progressBar(pct, budgetUsageColor(pct, c.color))}
            ${weeklyMiniHTML(c)}
          </div>`;
      }).join("")}
    </div>
    <div class="cat-grid-2col desktop-only">
      ${state.data.categories.map((c) => {
        const cs = spentMap[c.id] || 0;
        const pct = c.budget > 0 ? (cs / c.budget) * 100 : 0;
        const pill = categoryStatusPill(pct);
        return `
          <div class="cat-card-desktop">
            <div class="row" style="justify-content:space-between;align-items:flex-start">
              <div class="row">
                ${iconBadge(c.icon, c.color, 16)}
                <div>
                  <div class="cat-name">${esc(c.name)}</div>
                  <div class="cat-amounts">من إجمالي ${fmt(c.budget)} ر.س</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-family:'Cairo',sans-serif;font-weight:800;font-size:18px">${fmt(cs)} ر.س</span>
                <button class="btn btn-ghost" onclick='openCategorySheet(${JSON.stringify(c.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
                <button class="btn btn-ghost" onclick='deleteCategory(${JSON.stringify(c.id)})'>${icon("trash", COLORS.danger, 13)}</button>
              </div>
            </div>
            ${progressBar(pct, budgetUsageColor(pct, c.color))}
            <div class="row" style="justify-content:space-between;margin-top:10px">
              <span class="status-pill" style="color:${pill.color};background:${pill.bg}">${pill.label}</span>
              <span style="font-size:12.5px;color:${COLORS.sub}">${fmt(pct)}% من الميزانية</span>
            </div>
          </div>`;
      }).join("")}
    </div>
    <div class="mobile-only">${savingsGoalsHTML()}</div>
  `;
}

function savingsGoalsHTML() {
  const goals = state.data.savingsGoals || [];
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
      <div class="section-title" style="margin:0">أهداف التوفير</div>
      <button class="btn btn-primary" onclick="openSavingsGoalSheet()">${icon("plus", "#fff", 14)} هدف جديد</button>
    </div>
    ${!goals.length ? `<div class="empty-state">لا يوجد أهداف — أضف هدف لمناسبة أو مصروف موسمي زي رمضان أو تجديد الإيجار</div>` : ""}
    <div class="mobile-only">
      ${goals.map((g) => {
        const saved = goalSaved(g);
        const remaining = g.targetAmount - saved;
        const pctVal = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
        const monthly = goalMonthlyNeeded(g);
        return `
          <div class="cat-card">
            <div class="row" style="margin-bottom:8px">
              ${iconBadge("piggyBank", COLORS.success, 16)}
              <div style="flex:1">
                <div class="cat-name">${esc(g.name)}</div>
                <div class="cat-amounts">جمعت ${fmt(saved)} من ${fmt(g.targetAmount)} ر.س${g.targetDate ? ` · بحلول ${g.targetDate}` : ""}</div>
              </div>
              <button class="btn btn-ghost" onclick='deleteSavingsGoal(${JSON.stringify(g.id)})'>${icon("trash", COLORS.danger, 13)}</button>
            </div>
            ${progressBar(pctVal, COLORS.success)}
            ${monthly != null && monthly > 0 ? `<div style="font-size:12px;color:${COLORS.sub};margin-top:8px">تحتاج تجمع تقريباً ${fmt(monthly)} ر.س شهرياً عشان توصل الهدف في وقته</div>` : ""}
            ${remaining > 0
              ? `<button class="btn" style="width:100%;justify-content:center;margin-top:10px;background:${COLORS.paper};color:${COLORS.ink};padding:9px;border-radius:12px" onclick='openGoalContributionSheet(${JSON.stringify(g.id)})'>إضافة مبلغ للهدف</button>`
              : `<div style="text-align:center;margin-top:10px;color:${COLORS.success};font-weight:700;font-size:13px">🎉 وصلت الهدف</div>`}
          </div>`;
      }).join("")}
    </div>
    <div class="cat-grid-2col desktop-only">
      ${goals.map((g) => {
        const saved = goalSaved(g);
        const remaining = g.targetAmount - saved;
        const pctVal = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
        return `
          <div class="cat-card-desktop">
            <div class="row" style="justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <div class="row">
                ${iconBadge("piggyBank", COLORS.success, 16)}
                <div>
                  <div class="cat-name">${esc(g.name)}</div>
                  <div class="cat-amounts">${g.targetDate ? `الهدف: ${g.targetDate}` : "بدون تاريخ محدد"}</div>
                </div>
              </div>
              <button class="btn btn-ghost" onclick='deleteSavingsGoal(${JSON.stringify(g.id)})'>${icon("trash", COLORS.danger, 13)}</button>
            </div>
            ${progressBar(pctVal, COLORS.success)}
            <div class="row" style="justify-content:space-between;margin-top:10px">
              <span style="font-size:12.5px;color:${COLORS.sub}">من ${fmt(g.targetAmount)} ر.س</span>
              <span style="font-family:'Cairo',sans-serif;font-weight:800;font-size:16px">${fmt(saved)} ر.س</span>
            </div>
            ${remaining > 0
              ? `<button class="btn" style="width:100%;justify-content:center;margin-top:12px;background:${COLORS.paper};color:${COLORS.ink};padding:9px;border-radius:12px" onclick='openGoalContributionSheet(${JSON.stringify(g.id)})'>إضافة مبلغ للهدف</button>`
              : `<div style="text-align:center;margin-top:12px;color:${COLORS.success};font-weight:700;font-size:13px">🎉 وصلت الهدف</div>`}
          </div>`;
      }).join("")}
    </div>
  `;
}
function openSavingsGoalSheet() {
  const body = `
    <div class="field"><label>اسم الهدف</label><input id="f-goalname" type="text" placeholder="مثال: رمضان / تجديد الإقامة / الإيجار"/></div>
    <div class="field"><label>المبلغ المستهدف (ر.س)</label><input id="f-goaltarget" type="number" inputmode="decimal" placeholder="0" oninput="updateGoalHint()"/></div>
    <div class="field"><label>تاريخ الاستحقاق (اختياري)</label><input id="f-goaldate" type="date" oninput="updateGoalHint()"/></div>
    <div id="goal-monthly-hint" style="font-size:12px;color:${COLORS.sub};margin:-8px 0 16px"></div>
    <button class="btn btn-primary btn-block" onclick="submitSavingsGoal()">${icon("check", "#fff", 16)} حفظ الهدف</button>
  `;
  openSheetShell("هدف توفير جديد", body);
}
function updateGoalHint() {
  const target = parseFloat(document.getElementById("f-goaltarget").value) || 0;
  const dateVal = document.getElementById("f-goaldate").value;
  const hint = document.getElementById("goal-monthly-hint");
  if (!target || !dateVal) { hint.textContent = ""; return; }
  const today = new Date(todayISO() + "T00:00:00");
  const targetDate = new Date(dateVal + "T00:00:00");
  const monthsLeft = Math.max(1, Math.ceil((targetDate - today) / (30 * 86400000)));
  hint.textContent = `تحتاج تجمع تقريباً ${fmt(target / monthsLeft)} ر.س شهرياً عشان توصل الهدف`;
}
function submitSavingsGoal() {
  const name = document.getElementById("f-goalname").value.trim();
  const targetAmount = parseFloat(document.getElementById("f-goaltarget").value);
  const targetDate = document.getElementById("f-goaldate").value || null;
  if (!name || !targetAmount || targetAmount <= 0) { alert("أدخل اسم الهدف ومبلغ صحيح"); return; }
  addSavingsGoal({ name, targetAmount, targetDate });
  closeSheet(); render();
}
function openGoalContributionSheet(goalId) {
  const g = state.data.savingsGoals.find((x) => x.id === goalId);
  const remaining = g.targetAmount - goalSaved(g);
  const body = `
    <div style="font-size:14px;color:${COLORS.sub};margin-bottom:16px">باقي عشان توصل الهدف: ${fmt(remaining)} ر.س</div>
    <div class="field"><label>المبلغ (ر.س)</label><input id="f-goalamt" type="number" inputmode="decimal" placeholder="0"/></div>
    <button class="btn btn-block" style="background:${COLORS.success};color:#fff" onclick='submitGoalContribution(${JSON.stringify(goalId)})'>${icon("check", "#fff", 16)} إضافة للهدف</button>
  `;
  openSheetShell(`إضافة لـ: ${g.name}`, body);
}
function submitGoalContribution(goalId) {
  const amount = parseFloat(document.getElementById("f-goalamt").value);
  if (!amount || amount <= 0) { alert("أدخل مبلغ صحيح"); return; }
  addGoalContribution(goalId, { amount, date: todayISO() });
  closeSheet(); render();
}

function debtBudgetCardHTML() {
  const budget = state.data.settings.debtBudget || 0;
  if (!budget) {
    return `
      <div class="card">
        <div class="section-title" style="margin-top:0">ميزانية سداد الديون هذا الشهر</div>
        <div style="font-size:13px;color:${COLORS.sub};line-height:1.8">ما حددت مبلغ شهري لسداد الديون بعد. حدده من <span style="color:${COLORS.ink};font-weight:700;cursor:pointer" onclick="setTab('categories')">"الفئات" ← إعداد الميزانية الكاملة</span>.</div>
      </div>`;
  }
  const paid = debtPaymentsThisCycle();
  const remaining = budget - paid;
  const pctVal = budget > 0 ? (paid / budget) * 100 : 0;
  return `
    <div class="card">
      <div class="section-title" style="margin-top:0">ميزانية سداد الديون هذا الشهر</div>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px">
        <span>سددت ${fmt(paid)} من ${fmt(budget)} ر.س</span>
        <span style="color:${remaining < 0 ? COLORS.danger : COLORS.sub}">${remaining >= 0 ? `باقي ${fmt(remaining)}` : `تجاوزت ${fmt(-remaining)}`}</span>
      </div>
      ${progressBar(pctVal, remaining < 0 ? COLORS.danger : budgetUsageColor(pctVal, COLORS.gold))}
    </div>`;
}
function debtsHTML() {
  return `
    <div class="debt-summary hero-gradient">
      <div class="label">إجمالي المتبقي من الديون</div>
      <div class="value">${fmt(totalDebtRemaining())} <span style="font-size:14px;font-weight:500">ر.س</span></div>
    </div>
    ${debtBudgetCardHTML()}
    <div class="section-title">الديون</div>
    ${state.data.debts.length === 0 ? `<div class="empty-state">ماعندك ديون مسجلة</div>` : ""}
    <div class="mobile-only">
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
                <div class="cat-amounts">سددت ${fmt(paid)} · متبقي ${fmt(remaining)} من ${fmt(d.totalAmount)}${d.date ? ` · أُخذ بتاريخ ${d.date}` : ""}</div>
                ${d.note ? `<div style="font-size:12px;color:${COLORS.sub};margin-top:2px">${esc(d.note)}</div>` : ""}
              </div>
              <button class="btn btn-ghost" onclick='deleteDebt(${JSON.stringify(d.id)})'>${icon("trash", COLORS.danger, 13)}</button>
            </div>
            ${progressBar(pct, COLORS.success)}
            <div class="row" style="gap:8px;margin-top:10px">
              ${remaining > 0 ? `<button class="btn" style="flex:1;justify-content:center;background:${COLORS.paper};color:${COLORS.ink};padding:9px;border-radius:12px" onclick='openPaySheet(${JSON.stringify(d.id)})'>تسجيل سداد</button>` : ""}
              <button class="btn" style="flex:1;justify-content:center;background:${COLORS.paper};color:${COLORS.ink};padding:9px;border-radius:12px" onclick='openDebtHistorySheet(${JSON.stringify(d.id)})'>سجل السداد${(d.payments || []).length ? ` (${d.payments.length})` : ""}</button>
            </div>
          </div>`;
      }).join("")}
    </div>
    <div class="desktop-only">
      ${state.data.debts.map((d) => {
        const paid = (d.payments || []).reduce((s, p) => s + p.amount, 0);
        const remaining = d.totalAmount - paid;
        const pct = d.totalAmount > 0 ? (paid / d.totalAmount) * 100 : 0;
        return `
          <div class="cat-card-desktop" style="margin-top:10px">
            <div class="row" style="justify-content:space-between;align-items:flex-start">
              <div class="row">
                ${iconBadge("creditCard", COLORS.gold, 16)}
                <div>
                  <div class="cat-name">${esc(d.name)}</div>
                  <div class="cat-amounts">تم سداد ${fmt(paid)} ر.س حتى الآن${d.date ? ` · أُخذ بتاريخ ${d.date}` : ""}</div>
                  ${d.note ? `<div style="font-size:12px;color:${COLORS.sub};margin-top:2px">${esc(d.note)}</div>` : ""}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-family:'Cairo',sans-serif;font-weight:800;font-size:18px;color:${remaining > 0 ? COLORS.ink : COLORS.success}">${fmt(remaining)} ر.س</span>
                <button class="btn btn-ghost" onclick='deleteDebt(${JSON.stringify(d.id)})'>${icon("trash", COLORS.danger, 13)}</button>
              </div>
            </div>
            ${progressBar(pct, COLORS.success)}
            <div class="row" style="justify-content:space-between;margin-top:10px">
              <span style="font-size:12.5px;color:${COLORS.sub}">تم سداد ${fmt(pct)}% من إجمالي ${fmt(d.totalAmount)} ر.س</span>
              <div style="display:flex;gap:8px">
                <button class="btn btn-ghost" style="width:auto;height:auto;padding:6px 12px;font-size:12px;font-weight:600" onclick='openDebtHistorySheet(${JSON.stringify(d.id)})'>سجل السداد${(d.payments || []).length ? ` (${d.payments.length})` : ""}</button>
                ${remaining > 0 ? `<button class="btn btn-ghost" style="width:auto;height:auto;padding:6px 12px;font-size:12px;font-weight:600" onclick='openPaySheet(${JSON.stringify(d.id)})'>تسجيل سداد</button>` : ""}
              </div>
            </div>
          </div>`;
      }).join("")}
    </div>
  `;
}

function historyHTML() {
  const all = state.data.expenses.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
      <div class="section-title" style="margin:0">كل العمليات</div>
      <button class="btn btn-gold" onclick="exportCSV()">${icon("download", "#fff", 14)} تصدير CSV</button>
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
          <button class="btn btn-ghost" onclick='openExpenseSheet(${JSON.stringify(e.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
          <button class="btn btn-ghost" onclick='deleteExpense(${JSON.stringify(e.id)})'>${icon("trash", COLORS.danger, 13)}</button>
        </div>`;
    }).join("")}
  `;
}

/* -- reports: monthly detail + yearly overview -- */
function reportsHTML() {
  const view = window.__reportView || "month";
  return `
    <div class="report-toggle" style="margin:16px 0 4px">
      <button class="${view === "month" ? "active" : ""}" onclick="setReportView('month')">شهري</button>
      <button class="${view === "year" ? "active" : ""}" onclick="setReportView('year')">سنوي</button>
    </div>
    ${view === "month" ? monthReportHTML() : yearReportHTML()}
  `;
}
function setReportView(v) { window.__reportView = v; render(); }

function monthReportHTML() {
  const spentMap = spentByCategory();
  const spent = monthExpenses().reduce((s, e) => s + e.amount, 0);
  const budget = totalBudget();
  const sorted = state.data.categories
    .map((c) => ({ ...c, spent: spentMap[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent);
  return `
    <div class="card">
      <div class="section-title" style="margin-top:0">ملخص ${esc(monthLabel(state.month))}</div>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px">
        <span>إجمالي المصروف</span><strong>${fmt(spent)} ر.س</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:${COLORS.sub}">
        <span>من إجمالي ميزانية الفئات</span><span>${fmt(budget)} ر.س</span>
      </div>
    </div>
    ${debtBudgetStatHTML()}
    ${categoryPieHTML(spentMap)}
    <div class="section-title">الفئات مرتبة حسب الأعلى صرفاً</div>
    ${sorted.map((c, i) => `
      <div class="cat-card">
        <div class="row" style="margin-bottom:8px">
          <span style="font-family:'Cairo',sans-serif;font-weight:800;color:${COLORS.sub};width:16px">${i + 1}</span>
          ${iconBadge(c.icon, c.color, 14)}
          <div style="flex:1">
            <div class="cat-top"><span class="cat-name">${esc(c.name)}</span><span class="cat-amounts">${fmt(c.spent)} / ${fmt(c.budget)}</span></div>
            ${progressBar(c.budget > 0 ? (c.spent / c.budget) * 100 : 0, budgetUsageColor(c.budget > 0 ? (c.spent / c.budget) * 100 : 0, c.color))}
          </div>
        </div>
      </div>`).join("")}
    ${chartHTML()}
  `;
}

function yearReportHTML() {
  const year = window.__reportYear || Number(state.month.split("-")[0]);
  window.__reportYear = year;
  const months = Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    const total = state.data.expenses.filter((e) => dateInCycle(e.date, key)).reduce((s, e) => s + e.amount, 0);
    return { key, label: MONTH_NAMES[i].slice(0, 3), total };
  });
  const yearTotal = months.reduce((s, m) => s + m.total, 0);
  const max = Math.max(1, ...months.map((m) => m.total));
  const byCat = {};
  state.data.expenses.filter((e) => e.date.slice(0, 4) === String(year)).forEach((e) => { byCat[e.categoryId] = (byCat[e.categoryId] || 0) + e.amount; });
  const topCats = state.data.categories
    .map((c) => ({ ...c, total: byCat[c.id] || 0 }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
  return `
    <div class="row" style="justify-content:center;gap:14px;margin:14px 0">
      <button class="btn btn-ghost" onclick="shiftReportYear(-1)">${icon("chevronRight", COLORS.ink, 14)}</button>
      <span style="font-family:'Cairo',sans-serif;font-weight:700">${year}</span>
      <button class="btn btn-ghost" onclick="shiftReportYear(1)">${icon("chevronLeft", COLORS.ink, 14)}</button>
    </div>
    <div class="card">
      <div class="section-title" style="margin-top:0">إجمالي صرف ${year}</div>
      <div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:26px">${fmt(yearTotal)} <small style="font-size:13px;color:${COLORS.sub};font-weight:500">ر.س</small></div>
      <div class="chart-bars" style="margin-top:16px">
        ${months.map((m) => `
          <div class="chart-col">
            <div class="chart-bar" style="height:${Math.max(4, (m.total / max) * 90)}px" title="${fmt(m.total)} ر.س"></div>
            <div class="chart-col-label">${m.label}</div>
          </div>`).join("")}
      </div>
    </div>
    ${topCats.length ? `
      <div class="section-title">الفئات حسب إجمالي السنة</div>
      ${topCats.map((c) => `
        <div class="cat-card"><div class="row">
          ${iconBadge(c.icon, c.color, 14)}
          <div style="flex:1"><div class="cat-top"><span class="cat-name">${esc(c.name)}</span><span class="cat-amounts">${fmt(c.total)} ر.س</span></div></div>
        </div></div>`).join("")}
    ` : `<div class="empty-state">ماعندك مصاريف مسجلة في ${year}</div>`}
  `;
}
function shiftReportYear(delta) { window.__reportYear = (window.__reportYear || Number(state.month.split("-")[0])) + delta; render(); }

function headerHTML() {
  const atCurrentCycle = state.month >= cycleNow();
  return `
    <div class="header">
      <div class="header-top">
        <div class="brand">${icon("wallet", COLORS.primary, 20)} محفظتي ${streakBadgeHTML()}</div>
        <div class="row" style="gap:8px">
          ${typeof mahfaztiAuthStatusHTML === "function" ? mahfaztiAuthStatusHTML() : ""}
          <button class="btn btn-ghost" onclick="enterGroceries()" title="بقالتي">${icon("shoppingBasket", COLORS.secondary, 16)}</button>
          <button class="btn btn-ghost" onclick="openSettingsSheet()" title="الإعدادات">${icon("settings", COLORS.ink, 16)}</button>
        </div>
      </div>
      <div class="month-nav">
        <button onclick="changeMonth(-1)">${icon("chevronRight", COLORS.ink, 16)}</button>
        <span class="month-label">${monthLabel(state.month)}</span>
        <button onclick="changeMonth(1)" ${atCurrentCycle ? "disabled" : ""}>${icon("chevronLeft", COLORS.ink, 16)}</button>
      </div>
    </div>`;
}

function bottomNavHTML() {
  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "wallet" },
    { id: "categories", label: "الفئات", icon: "shoppingBag" },
    { id: "reports", label: "تقارير", icon: "barChart" },
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

const TAB_TITLES = { overview: "نظرة عامة", categories: "الفئات", reports: "التقارير", debts: "الديون", history: "السجل", savings: "أهداف الادخار" };
function tabFabRowHTML(tab) {
  if (tab === "categories") return `<div class="fab-row"><button class="fab" onclick="openCategorySheet(null)">${icon("plus", "#fff", 16)} فئة جديدة</button></div>`;
  if (tab === "debts") return `<div class="fab-row"><button class="fab" onclick="openDebtSheet()">${icon("plus", "#fff", 16)} دين جديد</button></div>`;
  if (tab === "savings") return `<div class="fab-row"><button class="fab" onclick="openSavingsGoalSheet()">${icon("plus", "#fff", 16)} هدف جديد</button></div>`;
  return `
    <div class="fab-row">
      <button class="fab-secondary" onclick="openSmsSheet()">${icon("clipboard", "#fff", 15)} من رسالة بنكية</button>
      <button class="fab" onclick="openExpenseSheet()">${icon("plus", "#fff", 16)} إضافة مصروف</button>
    </div>`;
}

function render() {
  if (window.__mode === "groceries" && typeof renderGroceries === "function") { renderGroceries(); return; }
  const app = document.getElementById("app");
  let body = "";
  if (state.tab === "overview") body = overviewHTML();
  else if (state.tab === "categories") body = categoriesHTML();
  else if (state.tab === "reports") body = reportsHTML();
  else if (state.tab === "debts") body = debtsHTML();
  else if (state.tab === "history") body = historyHTML();
  else if (state.tab === "savings") body = savingsGoalsHTML();

  const atCurrentCycle = state.month >= cycleNow();
  app.innerHTML = `
    ${appSidebarHTML()}
    <div class="app-main">
      ${headerHTML()}
      <div class="page-title-row">
        <div class="page-title">${TAB_TITLES[state.tab] || ""}</div>
        <div class="month-nav">
          <button onclick="changeMonth(-1)">${icon("chevronRight", COLORS.ink, 16)}</button>
          <span class="month-label">${monthLabel(state.month)}</span>
          <button onclick="changeMonth(1)" ${atCurrentCycle ? "disabled" : ""}>${icon("chevronLeft", COLORS.ink, 16)}</button>
        </div>
      </div>
      ${tabFabRowHTML(state.tab)}
      <div class="content">${body}</div>
    </div>
    ${bottomNavHTML()}
  `;
}

function setTab(id) { state.tab = id; render(); }
function changeMonth(delta) { state.month = shiftMonth(state.month, delta); render(); }

/* ---------------- desktop sidebar (hidden on mobile via CSS) ---------------- */
function sidebarLinkHTML(l, active, section) {
  const accent = section === "grocery" ? COLORS.secondary : COLORS.primary;
  const tint = section === "grocery" ? COLORS.secondaryTint : COLORS.primaryTint;
  const mode = section === "grocery" ? "groceries" : "budget";
  return `
    <div class="sidebar-link" style="background:${active ? tint : "transparent"};color:${active ? accent : COLORS.ink};font-weight:${active ? 700 : 500}" onclick='jumpTo(${JSON.stringify(mode)}, ${JSON.stringify(l.tab)})'>
      ${icon(l.icon, active ? accent : COLORS.sub, 16)}<span>${l.label}</span>
    </div>`;
}
function appSidebarHTML() {
  const mode = window.__mode === "groceries" ? "groceries" : "budget";
  const groceryActiveTab = mode === "groceries" && typeof groceryTab !== "undefined" ? groceryTab : null;
  const budgetLinks = [
    { tab: "overview", label: "نظرة عامة", icon: "home" },
    { tab: "categories", label: "الفئات", icon: "shoppingBag" },
    { tab: "debts", label: "الديون", icon: "creditCard" },
    { tab: "savings", label: "أهداف الادخار", icon: "piggyBank" },
    { tab: "reports", label: "تقارير", icon: "barChart" },
    { tab: "history", label: "السجل", icon: "receipt" },
  ];
  const groceryLinks = [
    { tab: "overview", label: "نظرة عامة", icon: "home" },
    { tab: "products", label: "المنتجات", icon: "shoppingBasket" },
    { tab: "history", label: "سجل المشتريات", icon: "receipt" },
  ];
  return `
    <div class="app-sidebar">
      <div class="sidebar-brand">${icon("wallet", COLORS.primary, 22)} محفظتي ${streakBadgeHTML()}</div>
      <div class="sidebar-section-label">محفظتي</div>
      ${budgetLinks.map((l) => sidebarLinkHTML(l, mode === "budget" && state.tab === l.tab, "budget")).join("")}
      <div class="sidebar-section-label">بقالتي</div>
      ${groceryLinks.map((l) => sidebarLinkHTML(l, mode === "groceries" && groceryActiveTab === l.tab, "grocery")).join("")}
      <div class="sidebar-link" style="color:${COLORS.ink};margin-top:8px" onclick="openSettingsSheet()">
        ${icon("settings", COLORS.sub, 16)}<span>الإعدادات</span>
      </div>
      <div class="sidebar-footer">${typeof mahfaztiSidebarFooterHTML === "function" ? mahfaztiSidebarFooterHTML() : ""}</div>
    </div>`;
}
function jumpTo(mode, tab) {
  if (mode === "groceries") {
    window.__mode = "groceries";
    if (typeof groceryTab !== "undefined") groceryTab = tab;
    if (typeof renderGroceries === "function") renderGroceries();
  } else {
    window.__mode = "budget";
    state.tab = tab;
    render();
  }
}

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

/* -- settings + budgeting first-steps -- */
function openSettingsSheet() {
  const startDay = getCycleStartDay();
  const overall = state.data.settings.overallBudget || 0;
  const allocated = totalBudget() + (state.data.settings.debtBudget || 0) + (state.data.settings.savingsBudget || 0);
  const remaining = overall - allocated;
  let budgetNote;
  if (overall <= 0) budgetNote = "ما حددت ميزانيتك الشهرية الكاملة بعد";
  else if (remaining < 0) budgetNote = `وزعت ${fmt(allocated)} ر.س — تجاوزت الميزانية الكاملة بـ ${fmt(-remaining)} ر.س`;
  else if (remaining === 0) budgetNote = `وزعت كامل الميزانية (${fmt(allocated)} ر.س)`;
  else budgetNote = `وزعت ${fmt(allocated)} من ${fmt(overall)} ر.س — باقي ${fmt(remaining)} ر.س ما توزع بعد`;

  const body = `
    <div class="section-title" style="margin-top:0">دورة شهرك المالي</div>
    <div class="field">
      <label>يبدأ شهرك المالي من يوم</label>
      <select id="f-startday">
        ${Array.from({ length: 28 }, (_, i) => i + 1).map((d) => `<option value="${d}" ${d === startDay ? "selected" : ""}>${d}</option>`).join("")}
      </select>
    </div>
    <div style="font-size:12px;color:${COLORS.sub};margin:-8px 0 16px;line-height:1.7">
      اختر ١ لو تبدأ ميزانيتك مع بداية الشهر الميلادي. لو راتبك يوصل يوم ٢٥ مثلاً، اختر ٢٥ — بيصير شهرك المالي من ٢٥ هذا الشهر إلى ٢٤ الشهر اللي بعده.
    </div>
    <button class="btn btn-primary btn-block" onclick="saveSettings()">${icon("check", "#fff", 16)} حفظ يوم البداية</button>

    <div class="section-title">إعداد الميزانية</div>
    <div style="font-size:13px;color:${COLORS.sub};margin-bottom:10px;line-height:1.8">${budgetNote}</div>
    <button class="btn btn-block" style="background:${COLORS.paper};color:${COLORS.ink}" onclick="openBudgetSetupSheet()">${icon("settings", COLORS.ink, 15)} إعداد الميزانية الكاملة (الفئات، الديون، التوفير)</button>

    <div class="section-title">حسابك ومزامنة بياناتك</div>
    ${typeof mahfaztiSettingsSectionHTML === "function" ? mahfaztiSettingsSectionHTML() : `<div style="font-size:13px;color:${COLORS.sub};line-height:1.8">تعذر تحميل خدمة المزامنة — بياناتك تُحفظ على هذا الجهاز فقط.</div>`}

    <div class="section-title">كيف تستخدم محفظتي صح</div>
    <ol style="font-size:13px;color:${COLORS.ink};padding-inline-start:18px;line-height:1.9;margin:0">
      <li>حدد يوم بداية شهرك المالي فوق</li>
      <li>وزّع ميزانيتك الشهرية الكاملة على الفئات وسداد الديون والتوفير من "إعداد الميزانية الكاملة" فوق، أو عدّل كل فئة لحالها من تبويب "الفئات"</li>
      <li>سجّل مصاريفك أول بأول — يدوياً، بلصق رسالة تنبيه البنك، أو بإرسال صورة الفاتورة لي بالمحادثة لو تبي تفريغها لبقالتي</li>
      <li>بقالتي قسم مستقل لتتبع مشترياتك وأسعار المنتجات ومقارنة المتاجر — يفتح من الأيقونة 🧺 فوق</li>
      <li>حافظ على سلسلتك 🔥 بتسجيل عملية كل يوم — تظهر فوق أول ما تبدأ</li>
      <li>تابع تقدمك الأسبوعي لكل فئة، والشهري من "نظرة عامة"، وقارن بين الأشهر من "تقارير"</li>
      <li>سجّل دخول بقوقل فوق عشان بياناتك تتحفظ بالسحابة وتوصلها من أي جهاز</li>
    </ol>
    ${state.data.settings.onboardingDismissed ? `<button class="btn btn-ghost" style="margin-top:14px;width:100%;justify-content:center;padding:9px" onclick="restoreOnboarding()">إظهار دليل البدء في الصفحة الرئيسية مرة ثانية</button>` : ""}
  `;
  openSheetShell("الإعدادات وإعداد الميزانية", body);
}
function restoreOnboarding() {
  state.data.settings.onboardingDismissed = false;
  saveData();
  closeSheet(); render();
}
function saveSettings() {
  const startDay = parseInt(document.getElementById("f-startday").value, 10);
  state.data.settings = { ...state.data.settings, cycleStartDay: startDay };
  saveData();
  state.month = cycleNow();
  closeSheet(); render();
}

/* -- add / edit expense -- */
function openExpenseSheet(editId) {
  const editing = editId ? state.data.expenses.find((e) => e.id === editId) : null;
  let selectedCat = editing ? editing.categoryId : (state.data.categories[0]?.id || null);
  const body = `
    <div class="field"><label>المبلغ (ر.س)</label><input id="f-amount" type="number" inputmode="decimal" placeholder="0" value="${editing ? editing.amount : ""}"/></div>
    <div class="field"><label>الفئة</label>
      <div class="cat-grid" id="cat-grid">
        ${state.data.categories.map((c) => `
          <div class="cat-pick ${c.id === selectedCat ? "selected" : ""}" data-cat="${c.id}" style="--pick-color:${c.color}" onclick="pickExpenseCat(this,'${c.id}')">
            ${iconBadge(c.icon, c.color, 13)}<span>${esc(c.name)}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="field"><label>التاريخ</label><input id="f-date" type="date" value="${editing ? editing.date : todayISO()}"/></div>
    <div class="field"><label>ملاحظة (اختياري)</label><input id="f-note" type="text" placeholder="مثال: غداء مع فريق العمل" value="${editing && editing.note ? esc(editing.note) : ""}"/></div>
    <input type="hidden" id="f-edit-id" value="${editing ? editing.id : ""}"/>
    <button class="btn btn-primary btn-block" onclick="submitExpense()">${icon("check", "#fff", 16)} ${editing ? "حفظ التعديل" : "حفظ المصروف"}</button>
  `;
  openSheetShell(editing ? "تعديل مصروف" : "إضافة مصروف", body);
  window.__selectedCat = selectedCat;
}
function pickExpenseCat(el, catId) {
  document.querySelectorAll("#cat-grid .cat-pick").forEach((n) => n.classList.remove("selected"));
  el.classList.add("selected");
  window.__selectedCat = catId;
}
function submitExpense() {
  const editId = document.getElementById("f-edit-id").value;
  const amount = parseFloat(document.getElementById("f-amount").value);
  const date = document.getElementById("f-date").value || todayISO();
  const note = document.getElementById("f-note").value.trim();
  const categoryId = window.__selectedCat;
  if (!amount || amount <= 0 || !categoryId) { alert("أدخل مبلغ صحيح واختر فئة"); return; }
  const patch = { amount, categoryId, note, date };
  if (editId) updateExpense(editId, patch);
  else addExpense(patch);
  closeSheet(); render();
}

/* -- add expense from a pasted bank SMS -- */
function openSmsSheet() {
  const body = `
    <div class="field"><label>الصق نص رسالة البنك هنا</label><textarea id="f-sms" rows="5" placeholder="مثال: تم خصم مبلغ 85.50 ريال من حسابك لدى ستاربكس بتاريخ 01/08/2026"></textarea></div>
    <button class="btn btn-primary btn-block" onclick="analyzeSms()">${icon("check", "#fff", 16)} تحليل الرسالة</button>
  `;
  openSheetShell("إضافة من رسالة بنكية", body);
}
function analyzeSms() {
  const text = document.getElementById("f-sms").value.trim();
  if (!text) { alert("الصق نص الرسالة أولاً"); return; }
  const { amount, merchant, date } = parseBankSMS(text);
  if (!amount) { alert("ما قدرت أطلع مبلغ من الرسالة — جرب تضيف المصروف يدوياً."); return; }
  const guessedCatId = findCategoryByMerchant(merchant);
  openSmsConfirmSheet(amount, merchant, date, guessedCatId);
}
function openSmsConfirmSheet(amount, merchant, date, guessedCatId) {
  window.__selectedCat = guessedCatId || null;
  const body = `
    ${merchant ? `<div style="font-size:13px;color:${COLORS.sub};margin-bottom:10px">المتجر المكتشف: <strong style="color:${COLORS.ink}">${esc(merchant)}</strong></div>` : ""}
    <div class="field"><label>المبلغ (ر.س)</label><input id="f-amount" type="number" inputmode="decimal" value="${amount}"/></div>
    <div class="field"><label>الفئة ${guessedCatId ? "" : "— اختر واحدة"}</label>
      <div class="cat-grid" id="cat-grid">
        ${state.data.categories.map((c) => `
          <div class="cat-pick ${c.id === guessedCatId ? "selected" : ""}" data-cat="${c.id}" style="--pick-color:${c.color}" onclick="pickExpenseCat(this,'${c.id}')">
            ${iconBadge(c.icon, c.color, 13)}<span>${esc(c.name)}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="field"><label>التاريخ</label><input id="f-date" type="date" value="${date || todayISO()}"/></div>
    ${merchant ? `<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${COLORS.sub};margin-bottom:16px"><input type="checkbox" id="f-remember" checked/> تذكر "${esc(merchant)}" لهذي الفئة مستقبلاً</label>` : ""}
    <button class="btn btn-primary btn-block" onclick='confirmSmsExpense(${JSON.stringify(merchant)})'>${icon("check", "#fff", 16)} تأكيد وحفظ</button>
  `;
  openSheetShell(guessedCatId ? "تأكيد المصروف" : "اختر فئة وأكّد", body);
}
function confirmSmsExpense(merchant) {
  const amount = parseFloat(document.getElementById("f-amount").value);
  const date = document.getElementById("f-date").value || todayISO();
  const categoryId = window.__selectedCat;
  if (!amount || amount <= 0 || !categoryId) { alert("أدخل مبلغ صحيح واختر فئة"); return; }
  addExpense({ amount, categoryId, note: merchant ? `رسالة بنك: ${merchant}` : "", date });
  const remember = document.getElementById("f-remember");
  if (merchant && (!remember || remember.checked)) rememberMerchant(merchant, categoryId);
  closeSheet(); render();
}

/* -- add/edit category -- */
const ICON_CHOICES = [
  "utensils", "car", "receipt", "shoppingBag", "heartPulse", "moreHorizontal", "creditCard", "wallet",
  "graduationCap", "home", "film", "send", "gift", "smartphone", "coffee", "fuel", "piggyBank",
];
const COLOR_CHOICES = ["#C97B3D", "#3E6B8A", "#8C5B8F", "#B3483B", "#3E7C5A", "#6B6456", "#C99A3A", "#1B3B34"];
function openCategorySheet(catId) {
  const cat = catId ? state.data.categories.find((c) => c.id === catId) : null;
  window.__catIcon = cat?.icon || "shoppingBag";
  window.__catColor = cat?.color || "#3E6B8A";
  const body = `
    ${!cat ? `
    <div style="font-size:12px;color:${COLORS.sub};background:${COLORS.paper};border-radius:12px;padding:11px 13px;margin-bottom:16px;line-height:1.8">
      💡 سوّي فئة جديدة إذا المصروف <strong style="color:${COLORS.ink}">متكرر بانتظام</strong> (أسبوعي أو شهري) <strong style="color:${COLORS.ink}">ومبلغه شبه ثابت</strong> ومهم تتابعه لحاله. غير كذا — نادر، مبلغه متغير، أو صغير — سجّله تحت "أخرى" مع ملاحظة توضح نوعه.
    </div>` : ""}
    <div class="field"><label>اسم الفئة</label><input id="f-catname" type="text" value="${esc(cat?.name || "")}" placeholder="مثال: تعليم"/></div>
    <div class="field">
      <label>الميزانية الشهرية (ر.س)</label>
      <input id="f-catbudget" type="number" inputmode="decimal" value="${cat?.budget ?? ""}" placeholder="0" oninput="updateCatBudgetPct()"/>
      <div id="cat-budget-pct" style="font-size:12px;color:${COLORS.sub};margin-top:6px">${catBudgetPctNote(cat?.budget || 0)}</div>
    </div>
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
function catBudgetPctNote(amount) {
  const overall = state.data.settings.overallBudget || 0;
  if (overall <= 0) return "حدد ميزانيتك الشهرية الكاملة الأول (من صفحة الفئات) عشان تشوف النسبة";
  return `يعادل ${fmt((amount / overall) * 100)}% من ميزانيتك الشهرية الكاملة (${fmt(overall)} ر.س)`;
}
function updateCatBudgetPct() {
  const amount = parseFloat(document.getElementById("f-catbudget").value) || 0;
  document.getElementById("cat-budget-pct").textContent = catBudgetPctNote(amount);
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
    <div class="field"><label>تاريخ أخذ الدين (اختياري)</label><input id="f-debtdate" type="date"/></div>
    <div class="field"><label>ملاحظة (اختياري)</label><input id="f-debtnote" type="text"/></div>
    <button class="btn btn-primary btn-block" onclick="submitDebt()">${icon("check", "#fff", 16)} حفظ الدين</button>
  `;
  openSheetShell("دين جديد", body);
}
function submitDebt() {
  const name = document.getElementById("f-debtname").value.trim();
  const totalAmount = parseFloat(document.getElementById("f-debttotal").value);
  const date = document.getElementById("f-debtdate").value || null;
  const note = document.getElementById("f-debtnote").value.trim();
  if (!name || !totalAmount || totalAmount <= 0) { alert("أدخل اسم الدين ومبلغ صحيح"); return; }
  addDebt({ name, totalAmount, date, note });
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
    <div class="field"><label>تاريخ السداد</label><input id="f-paydate" type="date" value="${todayISO()}"/></div>
    <button class="btn btn-block" style="background:${COLORS.success};color:#fff" onclick='submitPay(${JSON.stringify(debtId)})'>${icon("check", "#fff", 16)} تسجيل السداد</button>
  `;
  openSheetShell(`سداد: ${d.name}`, body);
}
function submitPay(debtId) {
  const amount = parseFloat(document.getElementById("f-paymount").value);
  const date = document.getElementById("f-paydate").value || todayISO();
  if (!amount || amount <= 0) { alert("أدخل مبلغ سداد صحيح"); return; }
  payDebt(debtId, { amount, date });
  closeSheet(); render();
}
function openDebtHistorySheet(debtId) {
  const d = state.data.debts.find((x) => x.id === debtId);
  if (!d) return;
  const payments = (d.payments || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const body = `
    ${d.date ? `<div style="font-size:13px;color:${COLORS.sub};margin-bottom:14px">تاريخ الدين: ${d.date}</div>` : ""}
    ${!payments.length ? `<div class="empty-state">ما سددت شي بعد على هذا الدين</div>` : payments.map((p) => `
      <div class="tx-row">
        <div class="tx-main"><div class="tx-title">سداد</div><div class="tx-sub">${p.date}</div></div>
        <span class="tx-amount">${fmt(p.amount)} ر.س</span>
      </div>`).join("")}
  `;
  openSheetShell(`سجل السداد: ${d.name}`, body);
}

/* ---------------- init ---------------- */
loadData();
state.month = cycleNow();
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
