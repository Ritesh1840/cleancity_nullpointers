import { requireAuth } from "./auth.js";
import { db } from "./firebase-config.js";
import { collection, query, orderBy, limit, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmtDate, toast } from "./utils.js";
import { badge, STATUSES } from "./complaints.js";

// Every admin page awaits this. Non-admins are redirected; Firestore rules enforce the same on the server.
export const ready = requireAuth({ admin: true });
document.querySelector("[data-drawer]")?.addEventListener("click", () => document.body.classList.toggle("drawer"));
document.querySelector(".side")?.addEventListener("click", e => e.target.closest("a") && document.body.classList.remove("drawer"));

// Up to 1000 newest complaints (enough for a demo; paginate server-side beyond that).
export async function fetchAll() {
  return (await getDocs(query(collection(db, "complaints"), orderBy("createdAt", "desc"), limit(1000)))).docs.map(d => d.data());
}
// Publishes the aggregate counters the public landing page reads.
export async function updateSummary(list) {
  const open = ["Submitted", "Under Review", "In Progress"];
  await setDoc(doc(db, "stats", "summary"), {
    total: list.length, resolved: list.filter(c => c.status === "Resolved").length,
    pending: list.filter(c => open.includes(c.status)).length,
    areas: new Set(list.map(c => c.pinCode).filter(Boolean)).size, updatedAt: serverTimestamp() });
}
export function confirmBox(title, text, okLabel = "Confirm", danger = false) {
  return new Promise(res => {
    const d = document.createElement("dialog");
    d.innerHTML = `<div class="dlg"><h2>${esc(title)}</h2><p style="color:var(--tx2)">${esc(text)}</p><div class="acts"><button class="btn ghost small" value="no">Cancel</button><button class="btn small ${danger ? "danger" : ""}" value="yes">${esc(okLabel)}</button></div></div>`;
    d.addEventListener("click", e => { const v = e.target.value; if (v) { d.close(); res(v === "yes"); } });
    d.addEventListener("cancel", () => res(false)); d.addEventListener("close", () => d.remove());
    document.body.append(d); d.showModal();
  });
}

// ---------- Overview page
if (document.getElementById("kpis")) {
  const { profile } = await ready;
  const $ = id => document.getElementById(id);
  try {
    const list = await fetchAll();
    const n = s => list.filter(c => c.status === s).length;
    const vals = { total: list.length, sub: n("Submitted"), rev: n("Under Review"), prog: n("In Progress"), done: n("Resolved"), rej: n("Rejected") };
    Object.entries(vals).forEach(([k, v]) => ($("k-" + k).textContent = v));
    updateSummary(list).catch(e => console.error("Summary not saved", e));

    const css = getComputedStyle(document.documentElement), col = ["#8A968E", "#3B6FB6", "#E9A23B", "#23875B", "#D94B4B"];
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    new Chart($("c-status"), { type: "doughnut", data: { labels: STATUSES, datasets: [{ data: STATUSES.map(n), backgroundColor: col }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } } });
    const cats = {}; list.forEach(c => (cats[c.category] = (cats[c.category] || 0) + 1));
    new Chart($("c-cat"), { type: "bar", data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: "#16865A" }] }, options: { maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 } } } } });
    const days = [...Array(30)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return d.toISOString().slice(0, 10); });
    const per = Object.fromEntries(days.map(d => [d, 0]));
    list.forEach(c => { const k = c.createdAt?.toDate?.().toISOString().slice(0, 10); if (k in per) per[k]++; });
    new Chart($("c-time"), { type: "line", data: { labels: days.map(d => d.slice(5)), datasets: [{ label: "Reports", data: days.map(d => per[d]), borderColor: "#16865A", backgroundColor: "rgba(22,134,90,.12)", fill: true, tension: .3 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 }, beginAtZero: true } } } });

    $("recent").innerHTML = list.length ? `<div class="tw"><table class="tbl"><thead><tr><th>ID</th><th>Citizen</th><th>Category</th><th>Location</th><th>Date</th><th>Priority</th><th>Status</th></tr></thead><tbody>${list.slice(0, 8).map(c => `<tr><td data-label="ID" class="id">${esc(c.complaintId)}</td><td data-label="Citizen">${esc(c.userName)}</td><td data-label="Category">${esc(c.category)}</td><td data-label="Location">${esc(c.location)}</td><td data-label="Date">${fmtDate(c.createdAt)}</td><td data-label="Priority" class="pri-${esc(c.priority)}">${esc(c.priority)}</td><td data-label="Status">${badge(c.status)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty"><b>No complaints yet</b>Reports from citizens will appear here.</div>`;
    $("refresh").addEventListener("click", async e => { e.target.disabled = true; try { const l = await fetchAll(); await updateSummary(l); toast("Public statistics updated."); } catch (err) { toast("Could not update statistics.", "error"); } e.target.disabled = false; });
  } catch (e) { console.error(e); toast("Failed to load dashboard data.", "error"); $("recent").innerHTML = `<div class="empty"><b>Could not load data</b>Check your connection and that the Firestore rules are published.</div>`; }
  $("aname").textContent = profile.fullName; $("amail").textContent = profile.email;
}
