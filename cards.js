/* ========= بطاقاتي الائتمانية =========
   قسم مستقل بالكامل — يعامل البطاقة كحساب دوّار (حد ائتماني + "متاح" يتحرك لأعلى ولأسفل)،
   مو دين ثابت يتناقص لين يخلص. المرابحة/الرسوم تتسجل كنوع عملية منفصل عشان توضح كلفة حقيقية
   بدل ما تندمج مع سداد عادي وتلخبط "كم فعلاً باقي علي". بيانات منفصلة تماماً عن محفظتي وبقالتي. */

const CARD_STORAGE_KEY = "mahfazti-cards-v1";
const CARD_ENTRY_TYPES = {
  purchase: { label: "سحب / شراء", icon: "shoppingBag", sign: -1, color: "#1A2233" },
  payment: { label: "سداد", icon: "check", sign: 1, color: "#2F9E5C" },
  murabaha: { label: "مرابحة / رسوم", icon: "alertTriangle", sign: -1, color: "#DC4C3F" },
};

let cardData = { cards: [], deletedIds: [] };

function loadCardData() {
  try {
    const raw = localStorage.getItem(CARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cardData = { cards: parsed.cards || [], deletedIds: parsed.deletedIds || [] };
    }
  } catch (e) { /* keep defaults */ }
}
function saveCardData() {
  try { localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cardData)); }
  catch (e) { alert("تعذر حفظ بيانات البطاقات محلياً — تأكد من توفر مساحة تخزين بالجهاز."); }
}
/* bridge for firebase-sync.js (a module script, can't see this file's `let cardData` binding directly) */
function __getCardState() { return cardData; }
function __setCardState(data) { cardData = data; }
/* records an id as deleted so a sync merge with a stale cloud copy can never bring it back —
   see the tombstone/prune logic in firebase-sync.js */
function markCardDeleted(id) {
  if (!id) return;
  cardData.deletedIds = cardData.deletedIds || [];
  if (!cardData.deletedIds.includes(id)) cardData.deletedIds.push(id);
}

/* ---------------- mutations ---------------- */
function addCard(card) { cardData.cards.unshift({ id: uid(), entries: [], ...card }); saveCardData(); }
function updateCard(id, patch) {
  cardData.cards = cardData.cards.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCardData();
}
function deleteCard(id) {
  if (!confirm("تحذف هذي البطاقة وكل سجل عملياتها؟")) return;
  cardData.cards = cardData.cards.filter((c) => c.id !== id);
  markCardDeleted(id);
  saveCardData(); closeSheet(); renderCards();
}
function addCardEntry(cardId, entry) {
  cardData.cards = cardData.cards.map((c) => {
    if (c.id !== cardId) return c;
    const sign = (CARD_ENTRY_TYPES[entry.type] || {}).sign || -1;
    const available = (c.available || 0) + sign * entry.amount;
    return { ...c, available, entries: [{ id: uid(), ...entry }, ...(c.entries || [])] };
  });
  saveCardData();
}
function deleteCardEntry(cardId, entryId) {
  if (!confirm("تحذف هذي العملية؟")) return;
  cardData.cards = cardData.cards.map((c) => {
    if (c.id !== cardId) return c;
    const entry = (c.entries || []).find((e) => e.id === entryId);
    if (!entry) return c;
    const sign = (CARD_ENTRY_TYPES[entry.type] || {}).sign || -1;
    const available = (c.available || 0) - sign * entry.amount; // undo its effect on "المتاح"
    return { ...c, available, entries: (c.entries || []).filter((e) => e.id !== entryId) };
  });
  markCardDeleted(entryId);
  saveCardData();
}
function setCardStatement(cardId, statement) {
  cardData.cards = cardData.cards.map((c) => (c.id === cardId ? { ...c, ...statement } : c));
  saveCardData();
}

/* ---------------- derived ---------------- */
function cardMurabahaTotal(c, ym) {
  return (c.entries || [])
    .filter((e) => e.type === "murabaha" && (!ym || e.date.startsWith(ym)))
    .reduce((s, e) => s + e.amount, 0);
}
function cardDueSoon(c) {
  if (!c.dueDate) return false;
  const days = Math.ceil((new Date(c.dueDate + "T00:00:00") - new Date(todayISO() + "T00:00:00")) / 86400000);
  return days >= 0 && days <= 5;
}
/* month-by-month payoff projection: murabaha only accrues on whatever balance is left after
   that month's payment (paying the statement in full is how you avoid it entirely, same as real
   murabaha cards), then next month's payment is applied against balance+murabaha. Assumes rate
   and payment stay constant, so it's a planning estimate, not real bank accounting. Capped at
   360 months — a payment that never exceeds that month's murabaha charge makes the balance flat
   or grow forever, which the cap turns into an explicit "never pays off" warning instead of an
   endless loop. */
function simulateCardPayoff(c, plan) {
  const rate = (plan.murabahaRateMonthly || 0) / 100;
  const balance0 = (c.creditLimit || 0) - (c.available || 0);
  if (balance0 <= 0) return { balance0, months: 0, totalMurabaha: 0, neverPaysOff: false };
  let balance = balance0;
  let totalMurabaha = 0;
  let months = 0;
  const MAX_MONTHS = 360;
  while (balance > 1 && months < MAX_MONTHS) {
    months++;
    let payment;
    if (plan.paymentMode === "full") payment = balance;
    else if (plan.paymentMode === "half") payment = balance / 2;
    else payment = plan.paymentAmount || 0;
    const murabaha = payment < balance ? balance * rate : 0;
    balance = Math.max(0, balance + murabaha - payment);
    totalMurabaha += murabaha;
  }
  return { balance0, months, totalMurabaha, neverPaysOff: months >= MAX_MONTHS && balance > 1 };
}
function cardPayoffResultHTML(result) {
  if (result.balance0 <= 0) {
    return `<div class="card" style="background:${COLORS.successBg};margin-bottom:14px"><div style="font-size:13px;color:${COLORS.success};font-weight:700">ما فيه رصيد مستخدم حالياً — البطاقة مسددة 🎉</div></div>`;
  }
  if (result.neverPaysOff) {
    return `
    <div class="card" style="background:${COLORS.dangerBg};margin-bottom:14px">
      <div style="font-size:13px;color:${COLORS.danger};font-weight:700;margin-bottom:4px">⚠️ بهذي الخطة ما بتخلص من البطاقة أبداً</div>
      <div style="font-size:12.5px;color:${COLORS.ink};line-height:1.7">مبلغ السداد أقل من (أو يساوي) المرابحة اللي بتتحسب كل شهر على رصيدك الحالي — الرصيد بيضل ثابت أو يكبر بدل ما يقل. لازم تزوّد مبلغ السداد الشهري.</div>
    </div>`;
  }
  const years = Math.floor(result.months / 12);
  const rem = result.months % 12;
  const timeLabel = years > 0 ? `${years} سنة${rem ? ` و${rem} شهر` : ""}` : `${result.months} شهر`;
  return `
    <div class="card" style="background:${COLORS.primaryTint};margin-bottom:14px">
      <div style="font-size:13px;color:${COLORS.ink};margin-bottom:6px">بهذي الخطة بتخلص من البطاقة خلال <strong>${timeLabel}</strong></div>
      <div style="font-size:12.5px;color:${COLORS.sub}">إجمالي مرابحة متوقعة: <strong style="color:${COLORS.danger}">${fmt(result.totalMurabaha)} ر.س</strong></div>
    </div>`;
}

/* ---------------- nav ---------------- */
function enterCards() { window.__mode = "cards"; saveUiState(); renderCards(); }
function exitCards() { window.__mode = "budget"; saveUiState(); render(); }

/* ---------------- rendering ---------------- */
function cardsHeaderHTML() {
  return `
    <div class="header">
      <div class="header-top">
        <div class="brand">${icon("creditCard", COLORS.primary, 20)} بطاقاتي</div>
        <button class="btn btn-ghost" onclick="exitCards()">${icon("chevronRight", COLORS.ink, 16)} رجوع لمحفظتي</button>
      </div>
    </div>`;
}
function cardTileHTML(c) {
  const limit = c.creditLimit || 0;
  const available = c.available || 0;
  const used = limit - available;
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const dueSoon = cardDueSoon(c);
  return `
    <div class="cat-card" onclick='openCardDetailSheet(${JSON.stringify(c.id)})' style="cursor:pointer">
      <div class="row" style="margin-bottom:8px">
        ${iconBadge("creditCard", COLORS.primary, 16)}
        <div style="flex:1">
          <div class="cat-name">${esc(c.name)}${c.last4 ? ` •${esc(c.last4)}` : ""}</div>
          <div class="cat-amounts">متاح ${fmt(available)} من ${fmt(limit)} ر.س</div>
        </div>
        <button class="btn btn-ghost" onclick='event.stopPropagation();openAddCardSheet(${JSON.stringify(c.id)})'>${icon("pencil", COLORS.sub, 13)}</button>
        <button class="btn btn-ghost" onclick='event.stopPropagation();deleteCard(${JSON.stringify(c.id)})'>${icon("trash", COLORS.danger, 13)}</button>
      </div>
      ${progressBar(pct, budgetUsageColor(pct, COLORS.primary))}
      ${c.dueDate ? `
        <div style="font-size:12px;margin-top:8px;color:${dueSoon ? COLORS.danger : COLORS.sub}">
          ${dueSoon ? "⚠️ " : ""}الاستحقاق: ${c.dueDate}${c.minDue ? ` · الأدنى ${fmt(c.minDue)} ر.س` : ""}
        </div>` : ""}
    </div>`;
}
function cardsOverviewHTML() {
  const cards = cardData.cards;
  return `
    ${!cards.length ? `
    <div class="card" style="background:${COLORS.primary};color:#fff">
      <div style="font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;margin-bottom:8px">💳 تابع بطاقتك صح</div>
      <div style="font-size:13px;line-height:1.8;color:#ffffffd9">هنا تتابع "المتاح" اللي تقدر تصرفه فعلياً — مو مبلغ دين يتناقص. المرابحة والرسوم تتسجل لحالها عشان تشوف كلفتها بوضوح بدل ما تندمج مع سدادك العادي.</div>
    </div>` : ""}
    ${cards.map(cardTileHTML).join("")}
  `;
}
function renderCards() {
  const app = document.getElementById("app");
  app.innerHTML = `
    ${appSidebarHTML()}
    <div class="app-main">
      ${cardsHeaderHTML()}
      <div class="page-title-row"><div class="page-title">بطاقاتي الائتمانية</div></div>
      <div class="fab-row">
        <button class="fab" onclick="openAddCardSheet(null)">${icon("plus", "#fff", 16)} بطاقة جديدة</button>
      </div>
      <div class="content">${cardsOverviewHTML()}</div>
    </div>
  `;
}

/* -- add / edit card -- */
function openAddCardSheet(editId) {
  const editing = editId ? cardData.cards.find((c) => c.id === editId) : null;
  const body = `
    <div class="field"><label>اسم البطاقة</label><input id="cd-name" type="text" placeholder="مثال: فيزا الراجحي" value="${editing ? esc(editing.name) : ""}"/></div>
    <div class="field"><label>آخر 4 أرقام (اختياري)</label><input id="cd-last4" type="text" maxlength="4" inputmode="numeric" placeholder="7241" value="${editing && editing.last4 ? esc(editing.last4) : ""}"/></div>
    <div class="field"><label>الحد الائتماني (ر.س)</label><input id="cd-limit" type="text" inputmode="decimal" placeholder="0" value="${editing ? editing.creditLimit : ""}"/></div>
    <div class="field"><label>المتاح الحالي (ر.س)</label><input id="cd-available" type="text" inputmode="decimal" placeholder="اتركه فاضي = كامل الحد متاح" value="${editing ? editing.available : ""}"/></div>
    <input type="hidden" id="cd-edit-id" value="${editing ? editing.id : ""}"/>
    <button class="btn btn-primary btn-block" onclick="submitCard()">${icon("check", "#fff", 16)} ${editing ? "حفظ التعديل" : "إضافة البطاقة"}</button>
  `;
  openSheetShell(editing ? "تعديل البطاقة" : "بطاقة ائتمانية جديدة", body);
}
function submitCard() {
  const editId = document.getElementById("cd-edit-id").value;
  const name = document.getElementById("cd-name").value.trim();
  const last4 = document.getElementById("cd-last4").value.trim();
  const creditLimit = parseDecimal(document.getElementById("cd-limit").value);
  const availableRaw = document.getElementById("cd-available").value;
  const parsedAvailable = availableRaw.trim() === "" ? creditLimit : parseDecimal(availableRaw);
  if (!name || !creditLimit || creditLimit <= 0) { alert("أدخل اسم البطاقة والحد الائتماني"); return; }
  const available = isNaN(parsedAvailable) ? creditLimit : parsedAvailable;
  if (editId) updateCard(editId, { name, last4, creditLimit, available });
  else addCard({ name, last4, creditLimit, available });
  closeSheet(); renderCards();
}

/* -- card detail: balance, statement snapshot, entry log -- */
function openCardDetailSheet(cardId) {
  const c = cardData.cards.find((x) => x.id === cardId);
  if (!c) return;
  const limit = c.creditLimit || 0;
  const available = c.available || 0;
  const used = limit - available;
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const murabahaMonth = cardMurabahaTotal(c, todayISO().slice(0, 7));
  const entries = (c.entries || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const body = `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px">
        <span>متاح ${fmt(available)} ر.س</span>
        <span style="color:${COLORS.sub}">من ${fmt(limit)} ر.س</span>
      </div>
      ${progressBar(pct, budgetUsageColor(pct, COLORS.primary))}
    </div>
    ${c.dueDate || c.minDue || c.totalDue ? `
    <div class="card" style="margin-bottom:14px">
      <div class="section-title" style="margin-top:0">كشف الحساب</div>
      ${c.totalDue ? `<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>إجمالي المستحق</span><strong>${fmt(c.totalDue)} ر.س</strong></div>` : ""}
      ${c.minDue ? `<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>الحد الأدنى</span><strong>${fmt(c.minDue)} ر.س</strong></div>` : ""}
      ${c.dueDate ? `<div style="display:flex;justify-content:space-between;font-size:13px"><span>تاريخ الاستحقاق</span><strong style="color:${cardDueSoon(c) ? COLORS.danger : COLORS.ink}">${c.dueDate}</strong></div>` : ""}
    </div>` : ""}
    ${murabahaMonth > 0 ? `<div style="font-size:12.5px;color:${COLORS.danger};margin-bottom:14px">مرابحة/رسوم هذا الشهر: ${fmt(murabahaMonth)} ر.س</div>` : ""}
    ${c.payoffPlan ? cardPayoffResultHTML(simulateCardPayoff(c, c.payoffPlan)) : ""}
    <div class="row" style="gap:8px;margin-bottom:16px">
      <button class="btn btn-block" style="flex:1;background:${COLORS.paper};color:${COLORS.ink};font-size:12.5px;padding:10px 4px" onclick='closeSheet();openCardEntrySheet(${JSON.stringify(cardId)},"purchase")'>${icon("shoppingBag", COLORS.ink, 14)} سحب</button>
      <button class="btn btn-block" style="flex:1;background:${COLORS.successBg};color:${COLORS.success};font-size:12.5px;padding:10px 4px" onclick='closeSheet();openCardEntrySheet(${JSON.stringify(cardId)},"payment")'>${icon("check", COLORS.success, 14)} سداد</button>
      <button class="btn btn-block" style="flex:1;background:${COLORS.dangerBg};color:${COLORS.danger};font-size:12.5px;padding:10px 4px" onclick='closeSheet();openCardEntrySheet(${JSON.stringify(cardId)},"murabaha")'>${icon("alertTriangle", COLORS.danger, 14)} مرابحة</button>
    </div>
    <button class="btn btn-ghost btn-block" style="margin-bottom:10px" onclick='closeSheet();openCardStatementSheet(${JSON.stringify(cardId)})'>${icon("pencil", COLORS.sub, 14)} تحديث بيانات الكشف</button>
    <button class="btn btn-ghost btn-block" style="margin-bottom:16px" onclick='closeSheet();openCardPayoffSheet(${JSON.stringify(cardId)})'>${icon("trendingUp", COLORS.sub, 14)} ${c.payoffPlan ? "تعديل خطة التخلص من البطاقة" : "خطة التخلص من البطاقة"}</button>
    <div class="section-title">آخر العمليات</div>
    ${!entries.length ? `<div class="empty-state">ما فيه عمليات مسجلة بعد</div>` : entries.map((e) => {
      const t = CARD_ENTRY_TYPES[e.type] || CARD_ENTRY_TYPES.purchase;
      return `
        <div class="tx-row">
          ${iconBadge(t.icon, t.color, 14)}
          <div class="tx-main">
            <div class="tx-title">${t.label}</div>
            <div class="tx-sub">${e.date}${e.note ? " · " + esc(e.note) : ""}</div>
          </div>
          <span class="tx-amount">${fmt(e.amount)}</span>
          <button class="btn btn-ghost" onclick='deleteCardEntryFromSheet(${JSON.stringify(cardId)},${JSON.stringify(e.id)})'>${icon("trash", COLORS.danger, 13)}</button>
        </div>`;
    }).join("")}
    <button class="btn btn-ghost btn-block" style="margin-top:16px;color:${COLORS.danger}" onclick='deleteCard(${JSON.stringify(cardId)})'>${icon("trash", COLORS.danger, 14)} حذف البطاقة</button>
  `;
  openSheetShell(`${c.name}${c.last4 ? " •" + c.last4 : ""}`, body);
}
function deleteCardEntryFromSheet(cardId, entryId) {
  deleteCardEntry(cardId, entryId);
  renderCards(); // keep the card tile list (behind the sheet) in sync too, not just the sheet
  openCardDetailSheet(cardId);
}

/* -- log a purchase / payment / murabaha entry -- */
function openCardEntrySheet(cardId, type) {
  const t = CARD_ENTRY_TYPES[type] || CARD_ENTRY_TYPES.purchase;
  const notePlaceholder = type === "murabaha" ? "مثال: مرابحة كشف يوليو" : type === "payment" ? "مثال: سداد شهري" : "مثال: سحب نقدي";
  const body = `
    <div class="field"><label>المبلغ (ر.س)</label><input id="ce-amount" type="text" inputmode="decimal" placeholder="0"/></div>
    <div class="field"><label>التاريخ</label><input id="ce-date" type="date" value="${todayISO()}"/></div>
    <div class="field"><label>ملاحظة (اختياري)</label><input id="ce-note" type="text" placeholder="${notePlaceholder}"/></div>
    <input type="hidden" id="ce-card-id" value="${cardId}"/>
    <input type="hidden" id="ce-type" value="${type}"/>
    <button class="btn btn-primary btn-block" onclick="submitCardEntry()">${icon("check", "#fff", 16)} حفظ</button>
  `;
  openSheetShell(t.label, body);
}
function submitCardEntry() {
  const cardId = document.getElementById("ce-card-id").value;
  const type = document.getElementById("ce-type").value;
  const amount = parseDecimal(document.getElementById("ce-amount").value);
  const date = document.getElementById("ce-date").value || todayISO();
  const note = document.getElementById("ce-note").value.trim();
  if (!amount || amount <= 0) { alert("أدخل مبلغ صحيح"); return; }
  addCardEntry(cardId, { type, amount, date, note });
  closeSheet();
  renderCards(); // keep the card tile list (behind the sheet) in sync too, not just the sheet
  openCardDetailSheet(cardId);
}

/* -- update statement snapshot (min/total due, due date) from the monthly statement -- */
function openCardStatementSheet(cardId) {
  const c = cardData.cards.find((x) => x.id === cardId);
  if (!c) return;
  const body = `
    <div class="field"><label>إجمالي المبلغ المستحق (ر.س)</label><input id="cs-total" type="text" inputmode="decimal" value="${c.totalDue || ""}"/></div>
    <div class="field"><label>الحد الأدنى المستحق (ر.س)</label><input id="cs-min" type="text" inputmode="decimal" value="${c.minDue || ""}"/></div>
    <div class="field"><label>تاريخ الاستحقاق</label><input id="cs-due" type="date" value="${c.dueDate || ""}"/></div>
    <input type="hidden" id="cs-card-id" value="${cardId}"/>
    <button class="btn btn-primary btn-block" onclick="submitCardStatement()">${icon("check", "#fff", 16)} حفظ</button>
  `;
  openSheetShell("بيانات كشف الحساب", body);
}
function submitCardStatement() {
  const cardId = document.getElementById("cs-card-id").value;
  const totalDue = parseDecimal(document.getElementById("cs-total").value);
  const minDue = parseDecimal(document.getElementById("cs-min").value);
  const dueDate = document.getElementById("cs-due").value || null;
  setCardStatement(cardId, {
    totalDue: isNaN(totalDue) ? 0 : totalDue,
    minDue: isNaN(minDue) ? 0 : minDue,
    dueDate,
  });
  closeSheet();
  renderCards(); // keep the card tile list (behind the sheet) in sync too, not just the sheet
  openCardDetailSheet(cardId);
}

/* -- payoff plan: rate + monthly payment strategy, projected live as you edit -- */
function openCardPayoffSheet(cardId) {
  const c = cardData.cards.find((x) => x.id === cardId);
  if (!c) return;
  const plan = c.payoffPlan || { murabahaRateMonthly: "", paymentMode: "fixed", paymentAmount: "" };
  const body = `
    <div style="font-size:12.5px;color:${COLORS.sub};margin-bottom:14px;line-height:1.8">
      خطة تقديرية تفترض إن النسبة ومبلغ السداد يضلوا ثابتين — تساعدك تشوف متى بتخلص من البطاقة وكم بتدفع مرابحة، مو محاسبة دقيقة من البنك.
    </div>
    <div class="field"><label>نسبة المرابحة الشهرية على الرصيد المتبقي (%)</label><input id="pp-rate" type="text" inputmode="decimal" placeholder="مثال: 2.5" value="${plan.murabahaRateMonthly || ""}" oninput="recomputeCardPayoff()"/></div>
    <div class="field"><label>طريقة السداد كل شهر</label>
      <select id="pp-mode" onchange="recomputeCardPayoff()">
        <option value="full" ${plan.paymentMode === "full" ? "selected" : ""}>المبلغ المستحق كامل (ما فيه مرابحة أبداً)</option>
        <option value="fixed" ${plan.paymentMode === "fixed" ? "selected" : ""}>مبلغ ثابت أحدده</option>
        <option value="half" ${plan.paymentMode === "half" ? "selected" : ""}>نصف الرصيد المتبقي</option>
      </select>
    </div>
    <div class="field" id="pp-amount-field" style="${plan.paymentMode === "fixed" ? "" : "display:none"}">
      <label>المبلغ الثابت شهرياً (ر.س)</label>
      <input id="pp-amount" type="text" inputmode="decimal" value="${plan.paymentAmount || ""}" oninput="recomputeCardPayoff()"/>
    </div>
    <div id="pp-result"></div>
    <input type="hidden" id="pp-card-id" value="${cardId}"/>
    <button class="btn btn-primary btn-block" onclick="saveCardPayoffPlan()">${icon("check", "#fff", 16)} حفظ الخطة</button>
  `;
  openSheetShell("خطة التخلص من البطاقة", body);
  recomputeCardPayoff();
}
function payoffPlanFromForm() {
  const mode = document.getElementById("pp-mode").value;
  document.getElementById("pp-amount-field").style.display = mode === "fixed" ? "" : "none";
  return {
    murabahaRateMonthly: parseDecimal(document.getElementById("pp-rate").value) || 0,
    paymentMode: mode,
    paymentAmount: parseDecimal(document.getElementById("pp-amount").value) || 0,
  };
}
function recomputeCardPayoff() {
  const cardId = document.getElementById("pp-card-id").value;
  const c = cardData.cards.find((x) => x.id === cardId);
  if (!c) return;
  document.getElementById("pp-result").innerHTML = cardPayoffResultHTML(simulateCardPayoff(c, payoffPlanFromForm()));
}
function saveCardPayoffPlan() {
  const cardId = document.getElementById("pp-card-id").value;
  updateCard(cardId, { payoffPlan: payoffPlanFromForm() });
  closeSheet();
  renderCards();
  openCardDetailSheet(cardId);
}

/* ---------------- init ---------------- */
loadCardData();
window.__mode = window.__mode || "budget";
restoreUiState(); // re-apply the persisted mode/tab now that all data modules are loaded
render(); // dispatches to the right view (budget/groceries/cards) based on window.__mode
