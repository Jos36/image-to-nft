// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlZvDTIK0fC96iQiWPlFAkuvYcebzZjMc",
  authDomain: "image-to-nft.firebaseapp.com",
  projectId: "image-to-nft",
  storageBucket: "image-to-nft.appspot.com",
  messagingSenderId: "829686302997",
  appId: "1:829686302997:web:76019e12dbc527831bc11c",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
