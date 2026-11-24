import { ready, fetchAll, updateSummary, confirmBox } from "./admin.js";
import { db } from "./firebase-config.js";
import { doc, collection, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { STATUSES, CATEGORIES, badge } from "./complaints.js";
import { esc, fmtDate, toast } from "./utils.js";

await ready;
const $ = id => document.getElementById(id), PRI = ["Low", "Normal", "High", "Urgent"], SIZE = 10;
let all = [], view = [], page = 0;
$("category").innerHTML += CATEGORIES.map(c => `<option>${c}</option>`).join("");
$("status").innerHTML += STATUSES.map(c => `<option>${c}</option>`).join("");
$("priority").innerHTML += PRI.map(c => `<option>${c}</option>`).join("");
const pre = new URLSearchParams(location.search).get("status"); if (STATUSES.includes(pre)) { $("status").value = pre; $("ptitle").textContent = pre === "Submitted" ? "Pending complaints" : pre + " complaints"; }

function render() {
  const q = $("q").value.trim().toLowerCase(), cat = $("category").value, st = $("status").value, pr = $("priority").value, asc = $("sort").value === "old";
  view = all.filter(c => (!cat || c.category === cat) && (!st || c.status === st) && (!pr || c.priority === pr) && (!q || [c.complaintId, c.title, c.category, c.location, c.userName].join(" ").toLowerCase().includes(q)));
  view.sort((a, b) => ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)) * (asc ? 1 : -1));
  const pages = Math.max(1, Math.ceil(view.length / SIZE)); page = Math.min(page, pages - 1);
  const slice = view.slice(page * SIZE, page * SIZE + SIZE);
  $("rows").innerHTML = slice.length ? slice.map(c => `<tr><td data-label="ID" class="id">${esc(c.complaintId)}</td><td data-label="Citizen">${esc(c.userName)}</td><td data-label="Category">${esc(c.category)}</td><td data-label="Location">${esc(c.location)}, ${esc(c.city)}</td><td data-label="Date">${fmtDate(c.createdAt)}</td><td data-label="Priority" class="pri-${esc(c.priority)}">${esc(c.priority)}</td><td data-label="Status">${badge(c.status)}</td><td><button class="btn small" data-id="${esc(c.complaintId)}">Manage</button></td></tr>`).join("") : `<tr><td colspan="8"><div class="empty"><b>${all.length ? "No matches" : "No complaints yet"}</b>${all.length ? "Try a different search or filter." : "Citizen reports will appear here."}</div></td></tr>`;
  $("info").textContent = view.length ? `Showing ${page * SIZE + 1}–${page * SIZE + slice.length} of ${view.length}` : "";
  $("prev").disabled = page === 0; $("next").disabled = page >= pages - 1;
}
["q", "category", "status", "priority", "sort"].forEach(i => $(i).addEventListener("input", () => { page = 0; render(); }));
$("prev").addEventListener("click", () => { page--; render(); }); $("next").addEventListener("click", () => { page++; render(); });
$("rows").addEventListener("click", e => { const b = e.target.closest("button[data-id]"); if (b) open(all.find(c => c.complaintId === b.dataset.id)); });

function open(c) {
  const d = $("dlg");
  d.innerHTML = `<div class="dlg"><h2>${esc(c.title)}</h2><p style="color:var(--tx2)">${esc(c.complaintId)} · ${badge(c.status)}</p>
  ${c.imageUrl ? `<img class="photo" src="${esc(c.imageUrl)}" alt="Citizen photo">` : ""}
  <p>${esc(c.description)}</p>
  <dl class="meta"><dt>Citizen</dt><dd>${esc(c.userName)} (<a href="admin-users.html?uid=${encodeURIComponent(c.userId)}" style="color:var(--g)">view profile</a>)</dd><dt>Category</dt><dd>${esc(c.category)}</dd><dt>Location</dt><dd>${esc(c.location)}, ${esc(c.city)} ${esc(c.pinCode)}</dd>${c.latitude != null ? `<dt>Coordinates</dt><dd>${c.latitude}, ${c.longitude}</dd>` : ""}<dt>Submitted</dt><dd>${fmtDate(c.createdAt)}</dd></dl>
  <div class="grid2"><div><label for="d-st">Status</label><select id="d-st">${STATUSES.map(s => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
  <div><label for="d-pr">Priority</label><select id="d-pr">${PRI.map(s => `<option ${s === c.priority ? "selected" : ""}>${s}</option>`).join("")}</select></div></div>
  <label for="d-rm">Remarks visible to the citizen</label><textarea id="d-rm" maxlength="500">${esc(c.adminRemarks)}</textarea>
  <div class="acts"><button class="btn small" id="d-save">Save changes</button><button class="btn ghost small" id="d-res">Mark resolved</button><button class="btn danger small" id="d-rej">Reject report</button><button class="btn ghost small" id="d-x">Close</button></div></div>`;
  d.showModal();
  $("d-x").onclick = () => d.close();
  $("d-save").onclick = () => save(c, $("d-st").value);
  $("d-res").onclick = async () => (await confirmBox("Mark as resolved?", "The citizen will be notified that this complaint is resolved.", "Mark resolved")) && save(c, "Resolved");
  $("d-rej").onclick = async () => {
    if (!$("d-rm").value.trim()) return toast("Add a remark explaining the rejection first.", "warn");
    if (await confirmBox("Reject this report?", "The citizen will see your remarks.", "Reject", true)) save(c, "Rejected");
  };
}

async function save(c, status) {
  const priority = $("d-pr").value, remarks = $("d-rm").value.trim();
  const sChg = status !== c.status, rChg = remarks !== (c.adminRemarks || ""), pChg = priority !== c.priority;
  if (!sChg && !rChg && !pChg) return toast("No changes to save.", "warn");
  const btns = $("dlg").querySelectorAll("button"); btns.forEach(b => (b.disabled = true));
  try {
    const b = writeBatch(db);
    b.update(doc(db, "complaints", c.complaintId), { status, priority, adminRemarks: remarks, updatedAt: serverTimestamp() });
    if (sChg || rChg) {
      b.set(doc(collection(db, "complaintHistory")), { complaintId: c.complaintId, userId: c.userId, status, note: remarks, createdAt: serverTimestamp() });
      const msg = !sChg ? `An administrator added a remark to complaint ${c.complaintId}.` : status === "Resolved" ? `Complaint ${c.complaintId} was marked as resolved.` : status === "Rejected" ? `Complaint ${c.complaintId} was rejected. See the remarks.` : `Complaint ${c.complaintId} is now ${status}.`;
      b.set(doc(collection(db, "notifications")), { userId: c.userId, complaintId: c.complaintId, type: "status", message: msg, read: false, createdAt: serverTimestamp() });
    }
    await b.commit();
    Object.assign(c, { status, priority, adminRemarks: remarks });
    updateSummary(all).catch(() => {});
    $("dlg").close(); render(); toast("Complaint updated.");
  } catch (e) { console.error(e); btns.forEach(x => (x.disabled = false)); toast("Update failed. Check your connection and admin access.", "error"); }
}
try { all = await fetchAll(); render(); }
catch (e) { console.error(e); $("rows").innerHTML = `<tr><td colspan="8"><div class="empty"><b>Could not load complaints</b>Check the Firestore rules and your connection.</div></td></tr>`; }
