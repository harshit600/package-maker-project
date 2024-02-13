// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
export const app = initializeApp(firebaseConfig);