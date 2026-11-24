import { ready, confirmBox } from "./admin.js";
import { db } from "./firebase-config.js";
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { badge } from "./complaints.js";
import { esc, fmtDate, toast } from "./utils.js";

await ready;
const $ = id => document.getElementById(id);
let users = [];
const render = () => {
  const q = $("q").value.trim().toLowerCase();
  const r = users.filter(u => !q || (u.fullName + " " + u.email).toLowerCase().includes(q));
  $("rows").innerHTML = r.length ? r.map(u => `<tr><td data-label="Name">${esc(u.fullName)}</td><td data-label="Email">${esc(u.email)}</td><td data-label="Role">${esc(u.role)}</td><td data-label="Status"><span class="badge ${u.accountStatus === "active" ? "b-ok" : "b-rej"}">${esc(u.accountStatus)}</span></td><td data-label="Joined">${fmtDate(u.createdAt)}</td><td><button class="btn small" data-uid="${esc(u.uid)}">View</button></td></tr>`).join("") : `<tr><td colspan="6"><div class="empty"><b>No users found</b>Registered citizens will appear here.</div></td></tr>`;
};
async function open(u) {
  let cs = [];
  try { cs = (await getDocs(query(collection(db, "complaints"), where("userId", "==", u.uid), orderBy("createdAt", "desc"), limit(20)))).docs.map(d => d.data()); } catch (e) { console.error(e); }
  const d = $("dlg");
  d.innerHTML = `<div class="dlg"><h2>${esc(u.fullName)}</h2><p style="color:var(--tx2)">${esc(u.email)}</p>
  <dl class="meta"><dt>Role</dt><dd>${esc(u.role)}</dd><dt>Account status</dt><dd>${esc(u.accountStatus)}</dd><dt>Joined</dt><dd>${fmtDate(u.createdAt)}</dd><dt>Complaints</dt><dd>${cs.length}${cs.length === 20 ? "+" : ""}</dd></dl>
  <ul class="act">${cs.map(c => `<li>${esc(c.complaintId)}: ${esc(c.title)} ${badge(c.status)}</li>`).join("") || "<li>No complaints submitted.</li>"}</ul>
  <div class="acts">${u.role === "citizen" ? `<button class="btn small ${u.accountStatus === "active" ? "danger" : ""}" id="tg">${u.accountStatus === "active" ? "Suspend account" : "Reactivate account"}</button>` : ""}<button class="btn ghost small" id="x">Close</button></div></div>`;
  d.showModal(); $("x").onclick = () => d.close();
  $("tg")?.addEventListener("click", async () => {
    const next = u.accountStatus === "active" ? "suspended" : "active";
    if (!(await confirmBox(next === "suspended" ? "Suspend this account?" : "Reactivate this account?", next === "suspended" ? "They will be signed out and unable to log in." : "They will be able to log in again.", next === "suspended" ? "Suspend" : "Reactivate", next === "suspended"))) return;
    try { await updateDoc(doc(db, "users", u.uid), { accountStatus: next }); u.accountStatus = next; d.close(); render(); toast("Account " + next + "."); }
    catch (e) { console.error(e); toast("Could not update the account.", "error"); }
  });
}
$("q").addEventListener("input", render);
$("rows").addEventListener("click", e => { const b = e.target.closest("button[data-uid]"); if (b) open(users.find(u => u.uid === b.dataset.uid)); });
try {
  users = (await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(300)))).docs.map(d => d.data()); render();
  const want = new URLSearchParams(location.search).get("uid"); const u = users.find(x => x.uid === want); if (u) open(u);
} catch (e) { console.error(e); $("rows").innerHTML = `<tr><td colspan="6"><div class="empty"><b>Could not load users</b>Check the Firestore rules and your connection.</div></td></tr>`; }
