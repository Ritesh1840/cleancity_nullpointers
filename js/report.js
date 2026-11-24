import { requireAuth } from "./auth.js";
import { initNotifications } from "./notifications.js";
import { db } from "./firebase-config.js";
import { CLOUDINARY, cloudinaryReady, uploadUrl } from "./cloudinary-config.js";
import { CATEGORIES } from "./complaints.js";
import { doc, collection, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, setLoading } from "./utils.js";

const { user, profile } = await requireAuth(); initNotifications(user.uid);
const $ = id => document.getElementById(id);
const OK_TYPES = ["image/jpeg", "image/png", "image/webp"], MAX = 5 * 1024 * 1024;
// One ID per page load: a repeated submit cannot create a duplicate complaint.
const complaintId = "CC-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
let file = null, busy = false;

$("category").innerHTML += CATEGORIES.map(c => `<option>${c}</option>`).join("");
const pre = new URLSearchParams(location.search).get("category"); if (CATEGORIES.includes(pre)) $("category").value = pre;

function setFile(f) {
  if (!f) return;
  if (!OK_TYPES.includes(f.type)) return toast("Use a JPG, PNG or WEBP image.", "error");
  if (f.size > MAX) return toast("Image is larger than 5 MB. Choose a smaller one.", "error");
  file = f; $("pimg").src = URL.createObjectURL(f); $("preview").style.display = "block";
}
const drop = $("drop");
drop.addEventListener("click", () => $("file").click());
drop.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), $("file").click()));
$("file").addEventListener("change", e => setFile(e.target.files[0]));
["dragover", "dragenter"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => setFile(e.dataTransfer.files[0]));
$("remove").addEventListener("click", () => { file = null; $("file").value = ""; $("preview").style.display = "none"; });
$("geo").addEventListener("click", () => {
  if (!navigator.geolocation) return toast("Location is not available in this browser.", "warn");
  navigator.geolocation.getCurrentPosition(p => { $("lat").value = p.coords.latitude.toFixed(6); $("lng").value = p.coords.longitude.toFixed(6); toast("Location added."); },
    () => toast("Could not get your location. You can skip this field.", "warn"));
});

function upload(f, onProgress) {
  return new Promise((res, rej) => {
    const fd = new FormData(); fd.append("file", f); fd.append("upload_preset", CLOUDINARY.uploadPreset);
    const x = new XMLHttpRequest(); x.open("POST", uploadUrl);
    x.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? res(j) : rej(new Error(j.error?.message || "Upload failed")); } catch { rej(new Error("Upload failed")); } };
    x.onerror = () => rej(new Error("Network error during upload"));
    x.send(fd);
  });
}
function bad(id, msg) { const f = $(id).closest(".field"); f.classList.toggle("invalid", !!msg); let e = f.querySelector(".err"); if (!e) { e = document.createElement("div"); e.className = "err"; f.append(e); } e.textContent = msg || ""; return !msg; }

$("reportForm").addEventListener("submit", async e => {
  e.preventDefault(); if (busy) return;
  const v = id => $(id).value.trim();
  const ok = [bad("title", v("title").length >= 5 ? "" : "Enter a title of at least 5 characters."), bad("category", v("category") ? "" : "Choose a category."),
    bad("description", v("description").length >= 15 ? "" : "Describe the problem in at least 15 characters."), bad("location", v("location") ? "" : "Enter the area or street."),
    bad("city", v("city") ? "" : "Enter the city."), bad("pin", /^\d{6}$/.test(v("pin")) ? "" : "Enter a 6-digit PIN code.")].every(Boolean);
  if (!ok) return toast("Fix the highlighted fields.", "error");
  if (file && !cloudinaryReady) return toast("Image uploads need Cloudinary settings in js/cloudinary-config.js. Remove the photo or add them.", "error");
  busy = true; setLoading($("submit"), true, "Submitting");
  try {
    let imageUrl = "";
    if (file) { $("bar").style.display = "block"; imageUrl = (await upload(file, p => ($("barfill").style.width = Math.round(p * 100) + "%"))).secure_url; }
    const lat = parseFloat(v("lat")), lng = parseFloat(v("lng"));
    const batch = writeBatch(db);
    batch.set(doc(db, "complaints", complaintId), {
      complaintId, userId: user.uid, userName: profile.fullName, title: v("title"), description: v("description"), category: v("category"),
      location: v("location"), city: v("city"), pinCode: v("pin"), imageUrl, latitude: isNaN(lat) ? null : lat, longitude: isNaN(lng) ? null : lng,
      status: "Submitted", priority: "Normal", adminRemarks: "", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    batch.set(doc(collection(db, "complaintHistory")), { complaintId, userId: user.uid, status: "Submitted", note: "Complaint submitted", createdAt: serverTimestamp() });
    batch.set(doc(collection(db, "notifications")), { userId: user.uid, complaintId, type: "submitted", message: `Complaint ${complaintId} was submitted.`, read: false, createdAt: serverTimestamp() });
    await batch.commit();
    toast("Complaint submitted. Redirecting to its details.");
    setTimeout(() => (location.href = `complaint-details.html?id=${encodeURIComponent(complaintId)}`), 900);
  } catch (err) {
    console.error(err); busy = false; setLoading($("submit"), false); $("bar").style.display = "none";
    toast(err.code === "permission-denied" ? "Submission was rejected. Check the Firestore rules are published." : err.message || "Could not submit. Try again.", "error");
  }
});
