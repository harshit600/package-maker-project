// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAojVNOvrDNWKwz7FHLVw3AuSROzXSLqK8",
  authDomain: "mern-estate-1b3d0.firebaseapp.com",
  projectId: "mern-estate-1b3d0",
  storageBucket: "mern-estate-1b3d0.appspot.com",
  messagingSenderId: "1062176884045",
  appId: "1:1062176884045:web:81ef62a8397708e5842304",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };




///const firebaseConfig = {
//   apiKey: "AIzaSyAwIIOKXj0mjF6S3_6kg8P1n25lUhMsb6w",
//   authDomain: "image-storage-ab73e.firebaseapp.com",
//   projectId: "image-storage-ab73e",
//   storageBucket: "image-storage-ab73e.firebasestorage.app",
//   messagingSenderId: "5454538955",
//   appId: "1:5454538955:web:4c7b07da8564c7d2d4934e"
// };
