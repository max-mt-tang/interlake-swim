import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
export const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
