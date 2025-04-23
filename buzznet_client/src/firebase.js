import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA0Ssyk5kq_MR3aiPE5lKUcmbi35s-arAE",
    authDomain: "buzznet-e8636.firebaseapp.com",
    projectId: "buzznet-e8636",
    storageBucket: "buzznet-e8636.firebasestorage.app",
    messagingSenderId: "851375937000",
    appId: "1:851375937000:web:34a73567a6c118aafb405d",
    measurementId: "G-DDTR3LZWC0"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);