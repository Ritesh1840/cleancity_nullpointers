// Paste your Firebase web-app config (Project settings > General > Your apps).
// These values are public identifiers; security comes from firestore.rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPcFW28W5yvXYT7MrvrTbSIyzAdUQjCmU",
  authDomain: "cleancity-8631b.firebaseapp.com",
  projectId: "cleancity-8631b",
  storageBucket: "cleancity-8631b.firebasestorage.app",
  messagingSenderId: "746781223313",
  appId: "1:746781223313:web:66344f2dfd3653b85c5230",
  measurementId: "G-DTSX858XT3"
};
export const configured = !firebaseConfig.apiKey.startsWith("YOUR_");
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
