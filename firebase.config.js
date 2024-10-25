import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth , GoogleAuthProvider} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkQHcQrfueGVh9UlPswWdt9dVQbKiPAPs",
  authDomain: "parallax-seat-booking.firebaseapp.com",
  projectId: "parallax-seat-booking",
  storageBucket: "parallax-seat-booking.appspot.com",
  messagingSenderId: "962655386239",
  appId: "1:962655386239:web:eb30d8bc4bfdcf16761d4a",
  measurementId: "G-L9ZQYJQVNH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);

export { app,db, auth};
