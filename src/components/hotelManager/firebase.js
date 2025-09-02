// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAojVNOvrDNWKwz7FHLVw3AuSROzXSLqK8",
  authDomain: "mern-estate-1b3d0.firebaseapp.com",
  projectId: "mern-estate-1b3d0",
  storageBucket: "mern-estate-1b3d0.appspot.com",
  messagingSenderId: "1062176884045",
  appId: "1:1062176884045:web:81ef62a8397708e5842304"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };
