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
