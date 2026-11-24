/*import { db } from "./firebase-config.js";
import { collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmtDate } from "./utils.js";

export const STATUSES = ["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"];
export const CATEGORIES = ["Overflowing Garbage Bin", "Plastic Waste", "Roadside Littering", "Illegal Dumping", "E-Waste", "Construction Waste", "Other"];
const CLS = { "Submitted": "sub", "Under Review": "rev", "In Progress": "prog", "Resolved": "ok", "Rejected": "rej" };
export const badge = s => `<span class="badge b-${CLS[s] || "sub"}">${esc(s)}</span>`;

// Latest 100 complaints for one citizen (needs the userId+createdAt index).
export async function fetchMine(uid) {
  const q = query(collection(db, "complaints"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(100));
  return (await getDocs(q)).docs.map(d => d.data());
}
export const rowsHtml = list => list.map(c => `<tr><td data-label="ID" class="id">${esc(c.complaintId)}</td><td data-label="Title">${esc(c.title)}</td><td data-label="Category">${esc(c.category)}</td><td data-label="Location">${esc(c.location)}, ${esc(c.city)}</td><td data-label="Date">${fmtDate(c.createdAt)}</td><td data-label="Status">${badge(c.status)}</td><td><a class="view" href="complaint-details.html?id=${encodeURIComponent(c.complaintId)}">View details</a></td></tr>`).join("");
export const tableHtml = list => `<table class="tbl"><thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Location</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>${rowsHtml(list)}</tbody></table>`;
export const emptyHtml = (title, text) => `<div class="empty"><b>${title}</b>${text}<br><a class="btn" href="report-issue.html">Report an issue</a></div>`;

// ---- My complaints page
const list = document.getElementById("list");
if (list) {
  const { requireAuth } = await import("./auth.js");
  const { initNotifications } = await import("./notifications.js");
  const { toast } = await import("./utils.js");
  const { user } = await requireAuth(); initNotifications(user.uid);
  const f = id => document.getElementById(id);
  document.getElementById("category").innerHTML += CATEGORIES.map(c => `<option>${c}</option>`).join("");
  document.getElementById("status").innerHTML += STATUSES.map(c => `<option>${c}</option>`).join("");
  let all = [];
  const render = () => {
    const q = f("q").value.trim().toLowerCase(), cat = f("category").value, st = f("status").value, asc = f("sort").value === "old";
    let r = all.filter(c => (!cat || c.category === cat) && (!st || c.status === st) && (!q || [c.complaintId, c.title, c.category, c.location].join(" ").toLowerCase().includes(q)));
    r = r.slice().sort((a, b) => ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)) * (asc ? 1 : -1));
    list.innerHTML = !all.length ? emptyHtml("No complaints yet", "Report your first waste issue and track it here.") : r.length ? tableHtml(r) : `<div class="empty"><b>No matches</b>Try a different search or filter.</div>`;
  };
  ["q", "category", "status", "sort"].forEach(i => f(i).addEventListener("input", render));
  try { all = await fetchMine(user.uid); render(); }
  catch (e) { console.error(e); list.innerHTML = `<div class="empty"><b>Could not load complaints</b>Check your connection and refresh. If this persists, the Firestore index may still be building.</div>`; toast("Failed to load complaints", "error"); }
}
*/

import { esc, fmtDate, errDetail } from "./utils.js";

export const STATUSES = ["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"];
export const CATEGORIES = ["Overflowing Garbage Bin", "Plastic Waste", "Roadside Littering", "Illegal Dumping", "E-Waste", "Construction Waste", "Other"];
const CLS = { "Submitted": "sub", "Under Review": "rev", "In Progress": "prog", "Resolved": "ok", "Rejected": "rej" };
export const badge = s => `<span class="badge b-${CLS[s] || "sub"}">${esc(s)}</span>`;

// Latest 100 complaints for one citizen (needs the userId+createdAt index).
export async function fetchMine(uid) {
  const q = query(collection(db, "complaints"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(100));
  return (await getDocs(q)).docs.map(d => d.data());
}
export const rowsHtml = list => list.map(c => `<tr><td data-label="ID" class="id">${esc(c.complaintId)}</td><td data-label="Title">${esc(c.title)}</td><td data-label="Category">${esc(c.category)}</td><td data-label="Location">${esc(c.location)}, ${esc(c.city)}</td><td data-label="Date">${fmtDate(c.createdAt)}</td><td data-label="Status">${badge(c.status)}</td><td><a class="view" href="complaint-details.html?id=${encodeURIComponent(c.complaintId)}">View details</a></td></tr>`).join("");
export const tableHtml = list => `<table class="tbl"><thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Location</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>${rowsHtml(list)}</tbody></table>`;
export const emptyHtml = (title, text) => `<div class="empty"><b>${title}</b>${text}<br><a class="btn" href="report-issue.html">Report an issue</a></div>`;

// ---- My complaints page
const list = document.getElementById("list");
if (list) {
  const { requireAuth } = await import("./auth.js");
  const { initNotifications } = await import("./notifications.js");
  const { toast } = await import("./utils.js");
  const { user } = await requireAuth(); initNotifications(user.uid);
  const f = id => document.getElementById(id);
  document.getElementById("category").innerHTML += CATEGORIES.map(c => `<option>${c}</option>`).join("");
  document.getElementById("status").innerHTML += STATUSES.map(c => `<option>${c}</option>`).join("");
  let all = [];
  const render = () => {
    const q = f("q").value.trim().toLowerCase(), cat = f("category").value, st = f("status").value, asc = f("sort").value === "old";
    let r = all.filter(c => (!cat || c.category === cat) && (!st || c.status === st) && (!q || [c.complaintId, c.title, c.category, c.location].join(" ").toLowerCase().includes(q)));
    r = r.slice().sort((a, b) => ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)) * (asc ? 1 : -1));
    list.innerHTML = !all.length ? emptyHtml("No complaints yet", "Report your first waste issue and track it here.") : r.length ? tableHtml(r) : `<div class="empty"><b>No matches</b>Try a different search or filter.</div>`;
  };
  ["q", "category", "status", "sort"].forEach(i => f(i).addEventListener("input", render));
  try { all = await fetchMine(user.uid); render(); }
  catch (e) { console.error(e); list.innerHTML = `<div class="empty"><b>Could not load complaints</b>Check your connection and refresh.${errDetail(e)}</div>`; toast("Failed to load complaints", "error"); }
}
