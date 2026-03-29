import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCArW1Wt9djdhe-FXfV8NPtHBQET9hfoi4",
  authDomain: "arundhati-health-system.firebaseapp.com",
  projectId: "arundhati-health-system",
  storageBucket: "arundhati-health-system.firebasestorage.app",
  messagingSenderId: "2372514572",
  appId: "1:2372514572:web:e33e5143520ce177e60f29",
  measurementId: "G-7XBJ89ZC7C"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();