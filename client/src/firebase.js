// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6ABOKIQUP243PblP-YeRPWecSVbYT5CQ",
  authDomain: "mindmap-b858f.firebaseapp.com",
  projectId: "mindmap-b858f",
  storageBucket: "mindmap-b858f.firebasestorage.app",
  messagingSenderId: "28301842535",
  appId: "1:28301842535:web:6709ed01593ecbf1325cc2",
  measurementId: "G-T62HP0WT4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Authentication management
export const db = getFirestore(app); // Firestore database
export const storage = getStorage(app); // Firebase storage
export const rtdb = getDatabase(app); // Realtime Database for online tracking
export default app;


