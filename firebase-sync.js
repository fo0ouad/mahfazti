/* ========= مزامنة محفظتي مع Firebase (تسجيل دخول بقوقل + حفظ سحابي) =========
   module script — يشتغل بعد app.js و groceries.js (كلاسيك سكربتس تتنفذ أول).
   لو تعذر تحميل Firebase (بدون نت مثلاً)، التطبيق يشتغل عادي محلياً بدون مزامنة. */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKEQ5q4egOUTiUeiDMNkRdq2V4fhBQMbo",
  // Matches the Firebase Hosting domain (not the default *.firebaseapp.com) so that once the
  // app itself is served from mahfazti-4d639.web.app, the sign-in flow's storage/cookies are
  // first-party from Safari's perspective — Firebase Hosting auto-proxies the /__/auth/**
  // handler paths needed for this to work. This only helps once hosting has actually moved
  // there; while still on GitHub Pages this domain won't be the page's own origin either.
  authDomain: "mahfazti-4d639.web.app",
  projectId: "mahfazti-4d639",
  storageBucket: "mahfazti-4d639.firebasestorage.app",
  messagingSenderId: "203469806687",
  appId: "1:203469806687:web:84ea2514f57b83da2a8fea",
};

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
const provider = new GoogleAuthProvider();

let currentUser = null;
let syncTimer = null;
let applyingRemote = false;

function scheduleCloudPush() {
  if (!currentUser || applyingRemote) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushToCloud, 800);
}

async function pushToCloud() {
  if (!currentUser) return;
  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      budget: window.__getBudgetState(),
      groceries: window.__getGroceryState(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("mahfazti: cloud push failed", e);
  }
}

function applyRemoteData(cloud) {
  applyingRemote = true;
  if (cloud.budget) window.__setBudgetState(cloud.budget);
  if (cloud.groceries) window.__setGroceryState(cloud.groceries);
  window.saveData();
  if (typeof window.saveGroceryData === "function") window.saveGroceryData();
  applyingRemote = false;
  window.render();
}

/* union-merge, never destructive: combines both sides instead of picking a "winner" that
   silently overwrites the other. A previous "cloud vs local, pick one" version could (and did)
   push one device's data over the other's in Firestore, permanently losing whatever only
   existed on the losing side. */
function mergeById(localArr, cloudArr, mergeSub) {
  const map = new Map();
  (localArr || []).forEach((item) => item && item.id && map.set(item.id, item));
  (cloudArr || []).forEach((item) => {
    if (!item || !item.id) return;
    const existing = map.get(item.id);
    map.set(item.id, existing && mergeSub ? mergeSub(existing, item) : item);
  });
  return Array.from(map.values());
}
function mergeSubList(localSub, cloudSub) {
  const seen = new Set();
  const out = [];
  [...(localSub || []), ...(cloudSub || [])].forEach((entry) => {
    const key = entry.id || JSON.stringify(entry);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  });
  return out;
}
function mergeBudgetState(local, cloud) {
  local = local || {}; cloud = cloud || {};
  return {
    categories: (cloud.categories && cloud.categories.length) ? cloud.categories : (local.categories || []),
    expenses: mergeById(local.expenses, cloud.expenses),
    debts: mergeById(local.debts, cloud.debts, (l, c) => ({ ...l, ...c, payments: mergeSubList(l.payments, c.payments) })),
    savingsGoals: mergeById(local.savingsGoals, cloud.savingsGoals, (l, c) => ({ ...l, ...c, contributions: mergeSubList(l.contributions, c.contributions) })),
    settings: { ...(local.settings || {}), ...(cloud.settings || {}) },
    merchantMap: { ...(local.merchantMap || {}), ...(cloud.merchantMap || {}) },
  };
}
function mergeGroceryState(local, cloud) {
  local = local || {}; cloud = cloud || {};
  return {
    items: mergeById(local.items, cloud.items),
    settings: { ...(local.settings || {}), ...(cloud.settings || {}) },
  };
}

// v2: bumped because the resolution logic behind this flag changed (destructive pick-a-winner
// -> non-destructive merge). A "resolved" flag set under the old logic must not short-circuit
// the new merge — that would leave a device stuck on stale/incomplete data forever, since the
// merge that was supposed to fetch the missing cloud data would never run again.
const SYNC_RESOLVED_KEY = "mahfazti-sync-resolved-v2";
async function handleSignedIn(user) {
  currentUser = user;
  // Firebase restores the signed-in session on every page load, which re-fires this same
  // handler — the one-time merge below must only ever run once per (device, account), the
  // first time this device links to this account, or it'd redo the merge on every reload.
  if (localStorage.getItem(SYNC_RESOLVED_KEY) === user.uid) {
    window.render();
    return;
  }
  const ref = doc(db, "users", user.uid);
  let snap;
  try {
    snap = await getDoc(ref);
  } catch (e) {
    alert("تعذر الوصول لبياناتك السحابية: " + (e && e.message ? e.message : e));
    window.render();
    return;
  }
  if (snap.exists()) {
    const cloud = snap.data();
    const mergedBudget = mergeBudgetState(window.__getBudgetState(), cloud.budget);
    const mergedGroceries = mergeGroceryState(window.__getGroceryState(), cloud.groceries);
    applyingRemote = true;
    window.__setBudgetState(mergedBudget);
    window.__setGroceryState(mergedGroceries);
    window.saveData();
    if (typeof window.saveGroceryData === "function") window.saveGroceryData();
    applyingRemote = false;
    await pushToCloud(); // write the merged union back up so the cloud copy has everything too
  } else {
    await pushToCloud();
  }
  localStorage.setItem(SYNC_RESOLVED_KEY, user.uid);
  window.render();
}

onAuthStateChanged(auth, (user) => {
  if (user) handleSignedIn(user);
  else currentUser = null;
  window.render();
});

window.mahfaztiSidebarFooterHTML = function () {
  if (!currentUser) {
    return `
      <div class="sidebar-link" style="flex:1" onclick="mahfaztiSignIn()">
        ${window.icon("cloud", window.COLORS.sub, 18)}<span>تسجيل الدخول لحفظ بياناتك</span>
      </div>`;
  }
  const name = currentUser.displayName || currentUser.email || "متصل";
  const initial = name.trim().charAt(0).toUpperCase();
  return `
    <div class="sidebar-avatar">${window.esc(initial)}</div>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:700;color:${window.COLORS.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${window.esc(currentUser.displayName || "")}</div>
      <div style="font-size:11px;color:${window.COLORS.sub};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${window.esc(currentUser.email || "")}</div>
    </div>
    <button class="btn btn-ghost" onclick="mahfaztiSignOutConfirm()" title="تسجيل الخروج">${window.icon("x", window.COLORS.sub, 13)}</button>`;
};

window.mahfaztiSettingsSectionHTML = function () {
  if (!currentUser) {
    return `
      <div style="font-size:13px;color:${window.COLORS.sub};line-height:1.8;margin-bottom:12px">بياناتك محفوظة على هذا الجهاز بس. سجّل دخول بقوقل عشان تنحفظ بالسحابة وتقدر تفتحها من أي جهاز.</div>
      <button class="btn btn-primary btn-block" onclick="mahfaztiSignIn()">${window.icon("cloud", "#fff", 16)} تسجيل الدخول بقوقل</button>`;
  }
  return `
    <div class="row" style="gap:10px">
      <div class="sidebar-avatar">${window.esc((currentUser.displayName || currentUser.email || "؟").trim().charAt(0).toUpperCase())}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:${window.COLORS.ink}">${window.esc(currentUser.displayName || "متصل")}</div>
        <div style="font-size:12px;color:${window.COLORS.sub}">${window.esc(currentUser.email || "")} — بياناتك تتزامن تلقائياً</div>
      </div>
      <button class="btn btn-ghost" style="width:auto;height:auto;padding:8px 14px;font-size:12.5px;white-space:nowrap" onclick="mahfaztiSignOutConfirm()">تسجيل خروج</button>
    </div>`;
};

window.mahfaztiSignIn = async function () {
  // signInWithRedirect fails hard ("missing initial state") on mobile browsers with
  // partitioned storage (iOS Safari, in-app browsers) — a worse failure mode than popup's
  // occasional awkward UX. Back to popup; the confusing part of the old experience was really
  // the repeating/destructive merge dialog on top of it, which is already fixed separately.
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("تعذر تسجيل الدخول: " + (e && e.message ? e.message : e));
  }
};
window.mahfaztiSignOut = async function () {
  await signOut(auth);
};
window.mahfaztiSignOutConfirm = function () {
  if (confirm("تسجيل خروج؟ بياناتك بتضل محفوظة بالسحابة.")) window.mahfaztiSignOut();
};

window.mahfaztiAuthStatusHTML = function () {
  if (!currentUser) {
    return `<button class="btn btn-ghost" onclick="mahfaztiSignIn()" title="تسجيل الدخول بقوقل لحفظ بياناتك بالسحابة">${window.icon("cloud", window.COLORS.ink, 16)}</button>`;
  }
  const label = currentUser.email || currentUser.displayName || "متصل";
  return `<button class="btn btn-ghost" onclick="mahfaztiSignOutConfirm()" title="${window.esc(label)} — متصل بالسحابة، اضغط لتسجيل الخروج">${window.icon("cloudCheck", window.COLORS.primary, 16)}</button>`;
};

/* hook every local save into a debounced cloud push, without touching app.js/groceries.js's own save logic */
const _origSaveData = window.saveData;
window.saveData = function (...args) {
  _origSaveData.apply(this, args);
  scheduleCloudPush();
};
if (typeof window.saveGroceryData === "function") {
  const _origSaveGroceryData = window.saveGroceryData;
  window.saveGroceryData = function (...args) {
    _origSaveGroceryData.apply(this, args);
    scheduleCloudPush();
  };
}
