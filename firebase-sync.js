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
/* a plain union-merge can only ever add items back in — it has no way to represent "this used
   to exist and was deleted", so a device deleting something followed shortly by a pull that
   still sees an older cloud copy (very possible now that pulls happen on every foreground, not
   just once ever) would silently resurrect it. deletedIds is a tombstone log: once an id is in
   here, prune() strips it out of every merge result forever, regardless of which side's copy of
   it is newer. */
function mergeIdList(a, b) { return Array.from(new Set([...(a || []), ...(b || [])])); }
function prune(arr, deletedIds) {
  if (!arr || !deletedIds || !deletedIds.length) return arr || [];
  const del = new Set(deletedIds);
  return arr.filter((item) => !(item && item.id && del.has(item.id)));
}
function mergeBudgetState(local, cloud) {
  local = local || {}; cloud = cloud || {};
  const deletedIds = mergeIdList(local.deletedIds, cloud.deletedIds);
  return {
    categories: prune(mergeById(local.categories, cloud.categories), deletedIds),
    expenses: prune(mergeById(local.expenses, cloud.expenses), deletedIds),
    debts: prune(mergeById(local.debts, cloud.debts, (l, c) => ({
      ...l, ...c, payments: prune(mergeSubList(l.payments, c.payments), deletedIds),
    })), deletedIds),
    savingsGoals: prune(mergeById(local.savingsGoals, cloud.savingsGoals, (l, c) => ({
      ...l, ...c, contributions: prune(mergeSubList(l.contributions, c.contributions), deletedIds),
    })), deletedIds),
    settings: { ...(local.settings || {}), ...(cloud.settings || {}) },
    merchantMap: { ...(local.merchantMap || {}), ...(cloud.merchantMap || {}) },
    deletedIds,
  };
}
function mergeGroceryState(local, cloud) {
  local = local || {}; cloud = cloud || {};
  const deletedIds = mergeIdList(local.deletedIds, cloud.deletedIds);
  return {
    items: prune(mergeById(local.items, cloud.items), deletedIds),
    settings: { ...(local.settings || {}), ...(cloud.settings || {}) },
    deletedIds,
  };
}

/* pull + merge the cloud copy into local, then push the merged union back up. Safe to call
   repeatedly (union-merge is idempotent) — this used to run only once per (device, account),
   gated by a "resolved" flag, which meant a device that had already synced once would never
   pull in changes made on *other* devices afterward, even across reloads. Now it runs on every
   sign-in event and every time the app is brought back to the foreground, so a change made on
   one device shows up on another after nothing more than a refresh/app-switch. */
async function pullAndMergeCloud() {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  let snap;
  try {
    snap = await getDoc(ref);
  } catch (e) {
    console.error("mahfazti: cloud pull failed", e);
    return;
  }
  if (!snap.exists()) { await pushToCloud(); return; }
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
  window.render();
}

async function handleSignedIn(user) {
  currentUser = user;
  await pullAndMergeCloud();
  window.render();
}

onAuthStateChanged(auth, (user) => {
  if (user) handleSignedIn(user);
  else currentUser = null;
  window.render();
});

/* covers the common PWA case: app was already open, user made a change on another device, then
   switched back to this tab/app without a full reload. */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && currentUser) pullAndMergeCloud();
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
    return `<button class="btn btn-ghost header-icon-btn" onclick="mahfaztiSignIn()" title="تسجيل الدخول بقوقل لحفظ بياناتك بالسحابة">${window.icon("cloud", window.COLORS.ink, 20)}</button>`;
  }
  const label = currentUser.email || currentUser.displayName || "متصل";
  return `<button class="btn btn-ghost header-icon-btn" onclick="mahfaztiSignOutConfirm()" title="${window.esc(label)} — متصل بالسحابة، اضغط لتسجيل الخروج">${window.icon("cloudCheck", window.COLORS.primary, 20)}</button>`;
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
