import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyAJuZBTRp3_HyzPbl8uU18SrHVIrxI25iU",
  authDomain:        "deadlineiq-dd5fb.firebaseapp.com",
  projectId:         "deadlineiq-dd5fb",
  storageBucket:     "deadlineiq-dd5fb.firebasestorage.app",
  messagingSenderId: "1060427153929",
  appId:             "1:1060427153929:web:b7c4924356a8e718502ed8",
  measurementId:     "G-ZJ85HXC5MH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with persistent cache (similar to enablePersistence)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
