// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWzc-Dy7hDqBXwCwKkLuqiZnRiDREo6LI",
  authDomain: "code4civicgdg.firebaseapp.com",
  projectId: "code4civicgdg",
  storageBucket: "code4civicgdg.firebasestorage.app",
  messagingSenderId: "763853578912",
  appId: "1:763853578912:web:249716d7107cce7e32dfc5",
  measurementId: "G-MDH8RYS6GK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
