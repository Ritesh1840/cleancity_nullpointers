import { auth, db, configured } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, setLoading } from "./utils.js";

const ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Use a password of at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and retry.",
  "permission-denied": "Your account could not be saved. Check the Firestore rules are published."
};
const errText = e => ERRORS[e.code] || "Something went wrong. Please try again.";
const home = role => role === "admin" ? "admin-dashboard.html" : "user-dashboard.html";

export async function getProfile(uid) {
  const s = await getDoc(doc(db, "users", uid));
  return s.exists() ? s.data() : null;
}
export const logout = () => signOut(auth).then(() => (location.href = "login.html"));

// Used by every protected page: resolves with {user, profile} or redirects to login.
export function requireAuth({ admin = false } = {}) {
  return new Promise(resolve => {
    const off = onAuthStateChanged(auth, async user => {
      off();
      if (!user) return (location.href = "login.html");
      const profile = await getProfile(user.uid);
      if (!profile || profile.accountStatus === "suspended") { await signOut(auth); return (location.href = "login.html"); }
      if (admin && profile.role !== "admin") return (location.href = "user-dashboard.html");
      resolve({ user, profile });
    });
  });
}
document.querySelectorAll("[data-logout]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); logout(); }));

// ---- Form helpers (login + register pages)
const $ = id => document.getElementById(id);
function fieldError(id, text) {
  const f = $(id).closest(".field"); f.classList.toggle("invalid", !!text);
  let el = f.querySelector(".err"); if (!el) { el = document.createElement("div"); el.className = "err"; f.append(el); }
  el.textContent = text || ""; return !text;
}
function banner(text) { const m = $("msg"); m.hidden = !text; m.textContent = text || ""; }
document.querySelectorAll(".pw button").forEach(b => b.addEventListener("click", () => {
  const i = b.parentElement.querySelector("input"); const show = i.type === "password";
  i.type = show ? "text" : "password"; b.textContent = show ? "Hide" : "Show";
}));
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
let registering = false;

// Signed-in visitors skip the auth pages.
if ($("loginForm") || $("registerForm")) {
  onAuthStateChanged(auth, async u => {
    if (!u || registering) return;
    const p = await getProfile(u.uid); if (p) location.href = home(p.role);
  });
}

$("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault(); banner("");
  const email = $("email").value.trim(), pw = $("password").value, btn = $("submit");
  const ok = [fieldError("email", emailOk(email) ? "" : "Enter a valid email address."), fieldError("password", pw ? "" : "Enter your password.")].every(Boolean);
  if (!ok) return;
  if (!configured) return banner("Firebase is not configured yet. Add your config in js/firebase-config.js.");
  setLoading(btn, true, "Logging in");
  try {
    await setPersistence(auth, $("remember").checked ? browserLocalPersistence : browserSessionPersistence);
    const { user } = await signInWithEmailAndPassword(auth, email, pw);
    const p = await getProfile(user.uid);
    if (!p) { await signOut(auth); throw { code: "auth/invalid-credential" }; }
    if (p.accountStatus === "suspended") { await signOut(auth); throw { message: "suspended" }; }
    location.href = home(p.role);
  } catch (err) { banner(err.message === "suspended" ? "This account is suspended. Contact the administrator." : errText(err)); setLoading(btn, false); }
});

$("forgot")?.addEventListener("click", async e => {
  e.preventDefault(); const email = $("email").value.trim();
  if (!fieldError("email", emailOk(email) ? "" : "Enter your email above first.")) return;
  if (!configured) return toast("Firebase is not configured yet.", "warn");
  try { await sendPasswordResetEmail(auth, email); toast("If an account exists, a reset link is on its way to " + email); }
  catch (err) { toast(errText(err), "error"); }
});

$("registerForm")?.addEventListener("submit", async e => {
  e.preventDefault(); banner("");
  const name = $("fullName").value.trim(), email = $("email").value.trim(), pw = $("password").value, btn = $("submit");
  const ok = [
    fieldError("fullName", name.length >= 2 ? "" : "Enter your full name."),
    fieldError("email", emailOk(email) ? "" : "Enter a valid email address."),
    fieldError("password", pw.length >= 8 ? "" : "Use at least 8 characters."),
    fieldError("confirm", pw === $("confirm").value ? "" : "Passwords do not match.")
  ].every(Boolean);
  if (!ok) return;
  if (!configured) return banner("Firebase is not configured yet. Add your config in js/firebase-config.js.");
  setLoading(btn, true, "Creating account"); registering = true;
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, pw);
    await updateProfile(user, { displayName: name });
    // Role is always "citizen"; the security rules reject anything else.
    await setDoc(doc(db, "users", user.uid), { uid: user.uid, fullName: name, email, role: "citizen", accountStatus: "active", createdAt: serverTimestamp() });
    sendEmailVerification(user).catch(() => {});
    toast("Account created. Check your email to verify your address.");
    setTimeout(() => (location.href = "user-dashboard.html"), 900);
  } catch (err) { registering = false; banner(errText(err)); setLoading(btn, false); }
});
