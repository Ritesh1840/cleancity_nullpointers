/*import { requireAuth } from "./auth.js";
import { initNotifications } from "./notifications.js";
import { fetchMine, tableHtml, emptyHtml } from "./complaints.js";
import { esc, fmtDate, toast } from "./utils.js";

const { user, profile } = await requireAuth();
const $ = id => document.getElementById(id);
$("hello").textContent = `Welcome, ${profile.fullName.split(" ")[0]}`;
$("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
$("pname").textContent = profile.fullName; $("pmail").textContent = profile.email;
$("pver").textContent = user.emailVerified ? "Verified" : "Not verified";

const TIPS = ["Rinse bottles and cans before recycling so they are not rejected.", "Keep wet kitchen waste separate from dry waste.", "Batteries and old phones belong with an e-waste collector, never the bin.", "Carry a cloth bag; one bag replaces hundreds of plastic ones.", "Flatten cardboard boxes to save space in the dry bin."];
$("tip").textContent = TIPS[new Date().getDate() % TIPS.length];

initNotifications(user.uid, items => {
  $("activity").innerHTML = items.length ? items.slice(0, 5).map(n => `<li>${esc(n.message)}<small>${fmtDate(n.createdAt)}</small></li>`).join("") : `<li>No activity yet.</li>`;
});
try {
  const list = await fetchMine(user.uid);
  const n = s => list.filter(c => s.includes(c.status)).length;
  $("k-total").textContent = list.length; $("k-sub").textContent = n(["Submitted"]);
  $("k-prog").textContent = n(["Under Review", "In Progress"]); $("k-done").textContent = n(["Resolved"]);
  $("recent").innerHTML = list.length ? tableHtml(list.slice(0, 5)) : emptyHtml("No complaints yet", "When you report a waste issue, it will appear here.");
} catch (e) {
  console.error(e); $("recent").innerHTML = `<div class="empty"><b>Could not load complaints</b>Check your connection and refresh.</div>`; toast("Failed to load complaints", "error");
}
*/

import { requireAuth } from "./auth.js";
import { initNotifications } from "./notifications.js";
import { fetchMine, tableHtml, emptyHtml } from "./complaints.js";
import { esc, fmtDate, toast, errDetail } from "./utils.js";

const { user, profile } = await requireAuth();
const $ = id => document.getElementById(id);
$("hello").textContent = `Welcome, ${profile.fullName.split(" ")[0]}`;
$("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
$("pname").textContent = profile.fullName; $("pmail").textContent = profile.email;
$("pver").textContent = user.emailVerified ? "Verified" : "Not verified";

const TIPS = ["Rinse bottles and cans before recycling so they are not rejected.", "Keep wet kitchen waste separate from dry waste.", "Batteries and old phones belong with an e-waste collector, never the bin.", "Carry a cloth bag; one bag replaces hundreds of plastic ones.", "Flatten cardboard boxes to save space in the dry bin."];
$("tip").textContent = TIPS[new Date().getDate() % TIPS.length];

initNotifications(user.uid, items => {
  $("activity").innerHTML = items.length ? items.slice(0, 5).map(n => `<li>${esc(n.message)}<small>${fmtDate(n.createdAt)}</small></li>`).join("") : `<li>No activity yet.</li>`;
});
try {
  const list = await fetchMine(user.uid);
  const n = s => list.filter(c => s.includes(c.status)).length;
  $("k-total").textContent = list.length; $("k-sub").textContent = n(["Submitted"]);
  $("k-prog").textContent = n(["Under Review", "In Progress"]); $("k-done").textContent = n(["Resolved"]);
  $("recent").innerHTML = list.length ? tableHtml(list.slice(0, 5)) : emptyHtml("No complaints yet", "When you report a waste issue, it will appear here.");
} catch (e) {
  console.error(e); $("recent").innerHTML = `<div class="empty"><b>Could not load complaints</b>Check your connection and refresh.${errDetail(e)}</div>`; toast("Failed to load complaints", "error");
}
