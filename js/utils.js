/*// Shared helpers: toasts (no alert()), button loading state, safe HTML, dates.
export function toast(message, type = "success") {
  let box = document.getElementById("toasts");
  if (!box) { box = document.createElement("div"); box.id = "toasts"; box.setAttribute("aria-live", "polite"); document.body.append(box); }
  const t = document.createElement("div");
  t.className = `toast ${type === "success" ? "" : type}`; t.textContent = message;
  box.append(t); setTimeout(() => t.remove(), 4500);
}
export function setLoading(btn, on, label) {
  if (on) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.innerHTML = `<span class="spin"></span>${label || "Please wait"}`; }
  else { btn.disabled = false; btn.textContent = btn.dataset.label || btn.textContent; }
}
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const fmtDate = ts => ts?.toDate ? ts.toDate().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "–";
*/
// Shared helpers: toasts (no alert()), button loading state, safe HTML, dates.
export function toast(message, type = "success") {
  let box = document.getElementById("toasts");
  if (!box) { box = document.createElement("div"); box.id = "toasts"; box.setAttribute("aria-live", "polite"); document.body.append(box); }
  const t = document.createElement("div");
  t.className = `toast ${type === "success" ? "" : type}`; t.textContent = message;
  box.append(t); setTimeout(() => t.remove(), 4500);
}
export function setLoading(btn, on, label) {
  if (on) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.innerHTML = `<span class="spin"></span>${label || "Please wait"}`; }
  else { btn.disabled = false; btn.textContent = btn.dataset.label || btn.textContent; }
}
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const fmtDate = ts => ts?.toDate ? ts.toDate().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "–";
// Readable error details for the screen; turns the index-creation URL Firestore includes into a link.
export function errDetail(e) {
  const t = esc(`${e?.code || ""} ${e?.message || ""}`.trim());
  return `<br><small style="word-break:break-word">${t.replace(/(https:\/\/console\.firebase\.google\.com[^\s]*)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--g);font-weight:600">Open this link to create the missing index</a>')}</small>`;
}
