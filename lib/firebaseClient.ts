import { initializeApp } from "firebase/app";
// import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwgPWv8ZxGj3XTg2G6p7zIBQVBlXo7B4g",
  authDomain: "codernautics.firebaseapp.com",
  projectId: "codernautics",
  storageBucket: "codernautics.firebasestorage.app",
  messagingSenderId: "614312440141",
  appId: "1:614312440141:web:e9abb446d5c6d8f5d70704",
  measurementId: "G-0XQ5W59T2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// let analytics;
// if (typeof window !== 'undefined' && isSupported())
// {
//   analytics = getAnalytics(app);
// }

// Optionally initialize other Firebase services you plan to use
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
// export { analytics, app, auth, firestore, storage };
// export { app };

