import { db } from "./firebase-config.js";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmtDate } from "./utils.js";

// Real-time in-app notifications for the signed-in citizen.
export function initNotifications(uid, onData) {
  const bell = document.getElementById("bell"), panel = document.getElementById("npanel"), count = document.getElementById("ncount");
  const q = query(collection(db, "notifications"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(15));
  return onSnapshot(q, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const unread = items.filter(n => !n.read).length;
    if (count) { count.textContent = unread; count.hidden = !unread; }
    if (panel) panel.innerHTML = items.length ? items.map(n => `<a href="complaint-details.html?id=${encodeURIComponent(n.complaintId)}" data-id="${n.id}" class="${n.read ? "" : "unread"}">${esc(n.message)}<br><small>${fmtDate(n.createdAt)}</small></a>`).join("") : "<p>No notifications yet.</p>";
    onData?.(items);
  }, err => console.error("Notifications:", err));
}
const bell = document.getElementById("bell"), panel = document.getElementById("npanel");
bell?.addEventListener("click", () => { panel.hidden = !panel.hidden; bell.setAttribute("aria-expanded", !panel.hidden); });
panel?.addEventListener("click", e => { const a = e.target.closest("a[data-id]"); if (a?.classList.contains("unread")) updateDoc(doc(db, "notifications", a.dataset.id), { read: true }).catch(() => {}); });
document.addEventListener("click", e => { if (panel && !panel.hidden && !e.target.closest(".notif")) panel.hidden = true; });
