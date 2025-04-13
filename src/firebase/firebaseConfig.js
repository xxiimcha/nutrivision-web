// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Import the getStorage function

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkytJ9D5zSsg_Yd77gjzxPULFNQTvIHyc",
  authDomain: "nutrivision-8876b.firebaseapp.com",
  projectId: "nutrivision-8876b",
  storageBucket: "nutrivision-8876b.appspot.com",
  messagingSenderId: "174331654904",
  appId: "1:174331654904:web:b2f8f31a2f5dcca61fc10d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and export it
const storage = getStorage(app);
export { storage };
