import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGZhxQXtS3O_3F_9WxnPvZQjEMX35Ov6k",
  authDomain: "chart-lang-web.firebaseapp.com",
  projectId: "chart-lang-web",
  storageBucket: "chart-lang-web.firebasestorage.app",
  messagingSenderId: "432318984654",
  appId: "1:432318984654:web:28acd97bf6e5f58f15fb9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const db = getFirestore(app);
export { db };