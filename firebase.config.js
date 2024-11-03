// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, OAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkQHcQrfueGVh9UlPswWdt9dVQbKiPAPs",
  authDomain: "parallax-seat-booking.firebaseapp.com",
  projectId: "parallax-seat-booking",
  storageBucket: "parallax-seat-booking.appspot.com",
  messagingSenderId: "962655386239",
  appId: "1:962655386239:web:eb30d8bc4bfdcf16761d4a",
  measurementId: "G-L9ZQYJQVNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Microsoft OAuth Provider with tenant ID
const provider = new OAuthProvider('microsoft.com');
provider.setCustomParameters({
  tenant: "2c5bdaf4-8ff2-4bd9-bd54-7c50ab219590" // Replace with your Azure tenant ID
});

export { app, db, auth, provider };
