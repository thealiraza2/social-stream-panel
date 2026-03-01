import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNPRfwfqogpA1ryn5PRX9iKFFJ4FXvGb0",
  authDomain: "smm-panel-45f15.firebaseapp.com",
  projectId: "smm-panel-45f15",
  storageBucket: "smm-panel-45f15.firebasestorage.app",
  messagingSenderId: "398245193553",
  appId: "1:398245193553:web:0f207a07800f2ea5411570",
  measurementId: "G-JPZE1RSP7Q",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
