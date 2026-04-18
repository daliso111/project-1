import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import this

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC17BIy4ZPyBD4CYJuzc5QAOB7yeII26k0",
  authDomain: "swifttype-fa40f.firebaseapp.com",
  projectId: "swifttype-fa40f",
  storageBucket: "swifttype-fa40f.firebasestorage.app",
  messagingSenderId: "949231539523",
  appId: "1:949231539523:web:6be1ccbce7ef6108c58bf6",
  measurementId: "G-XW1TKE28YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database and export it so you can use it in other files
export const db = getFirestore(app);
export const auth = getAuth(app); // Export this
