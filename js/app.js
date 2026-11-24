import { db, configured } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Mobile menu
const btn = document.querySelector(".menu"), list = document.querySelector(".nav ul");
btn?.addEventListener("click", () => {
  btn.setAttribute("aria-expanded", list.classList.toggle("open"));
});
list?.addEventListener("click", e => e.target.closest("a") && list.classList.remove("open"));

// Live statistics come from the aggregate document stats/summary.
// Never invented: without Firebase config or data, the figures stay as "–".
const set = (k, v) => { const el = document.querySelector(`[data-stat="${k}"]`); if (el) el.textContent = v; };
async function loadStats() {
  if (!configured || !document.querySelector("[data-stat]")) return;
  try {
    const snap = await getDoc(doc(db, "stats", "summary"));
    if (!snap.exists()) return set("note", "No reports yet. Be the first to report an issue.");
    const s = snap.data();
    set("total", s.total ?? 0); set("resolved", s.resolved ?? 0);
    set("pending", s.pending ?? 0); set("areas", s.areas ?? 0);
  } catch (err) {
    console.error(err);
    set("note", "Live figures are unavailable right now.");
  }
}
loadStats();
