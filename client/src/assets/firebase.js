// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "algou-online-judge.firebaseapp.com",
  projectId: "algou-online-judge",
  storageBucket: "algou-online-judge.firebasestorage.app",
  messagingSenderId: "905360635345",
  appId: "1:905360635345:web:87f5af2e5ae0f0057a9cf0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);