import { requireAuth } from "./auth.js";
import { initNotifications } from "./notifications.js";
import { db } from "./firebase-config.js";
import { badge } from "./complaints.js";
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmtDate } from "./utils.js";

const { user } = await requireAuth(); initNotifications(user.uid);
const id = new URLSearchParams(location.search).get("id"), out = document.getElementById("out");
const fail = () => (out.innerHTML = `<div class="empty"><b>Complaint not found</b>It may not exist, or it belongs to another account.<br><a class="btn" href="my-complaints.html">Back to my complaints</a></div>`);
if (!id) fail();
else onSnapshot(doc(db, "complaints", id), async snap => {
  if (!snap.exists()) return fail();
  const c = snap.data();
  const rej = c.status === "Rejected", steps = rej ? ["Submitted", "Under Review", "Rejected"] : ["Submitted", "Under Review", "In Progress", "Resolved"];
  const cur = steps.indexOf(c.status);
  let hist = [];
  try { hist = (await getDocs(query(collection(db, "complaintHistory"), where("complaintId", "==", id), where("userId", "==", user.uid), orderBy("createdAt", "asc")))).docs.map(d => d.data()); } catch (e) { console.error(e); }
  out.innerHTML = `<div class="page-head"><div><h1>${esc(c.title)}</h1><p>${esc(c.complaintId)}</p></div>${badge(c.status)}</div>
  <div class="detail"><div class="panel">${c.imageUrl ? `<img class="photo" src="${esc(c.imageUrl)}" alt="Photo submitted with the complaint">` : ""}
    <dl class="meta"><dt>Category</dt><dd>${esc(c.category)}</dd><dt>Location</dt><dd>${esc(c.location)}, ${esc(c.city)} ${esc(c.pinCode)}</dd><dt>Submitted</dt><dd>${fmtDate(c.createdAt)}</dd><dt>Priority</dt><dd>${esc(c.priority)}</dd></dl>
    <h2>Description</h2><p>${esc(c.description)}</p>
    ${c.adminRemarks ? `<div class="remark"><b>Administrator remarks</b><br>${esc(c.adminRemarks)}</div>` : ""}</div>
  <div><div class="panel"><h2>Progress</h2><ol class="tl">${steps.map((s, i) => `<li class="${i <= cur ? "done" : ""} ${i === cur ? "cur" : ""} ${rej && i === cur ? "bad" : ""}">${s}</li>`).join("")}</ol></div>
  <div class="panel"><h2>History</h2><ul class="act">${hist.length ? hist.map(h => `<li>${esc(h.status)}${h.note ? ": " + esc(h.note) : ""}<small>${fmtDate(h.createdAt)}</small></li>`).join("") : "<li>No history yet.</li>"}</ul></div></div></div>`;
}, err => { console.error(err); fail(); });
