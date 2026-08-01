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
  authDomain: "mahfazti-4d639.firebaseapp.com",
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

async function handleSignedIn(user) {
  currentUser = user;
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
    const local = window.__getBudgetState();
    const localGroceries = window.__getGroceryState();
    const localHasData = (local.expenses && local.expenses.length) || (localGroceries.items && localGroceries.items.length);
    if (localHasData) {
      const useCloud = confirm(
        "عندك بيانات محفوظة بالسحابة من قبل، وبرضو عندك بيانات على هذا الجهاز.\n\n" +
        "موافق = حمّل نسخة السحابة (وتفقد بيانات هذا الجهاز اللي ما تزامنت).\n" +
        "إلغاء = ارفع بيانات هذا الجهاز فوق نسخة السحابة."
      );
      if (useCloud) applyRemoteData(cloud);
      else await pushToCloud();
    } else {
      applyRemoteData(cloud);
    }
  } else {
    await pushToCloud();
  }
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
