import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXyC75w0YvkOzr-Q71FcooE3juqtb-ZwE",
  authDomain: "counterthing-70f96.firebaseapp.com",
  projectId: "counterthing-70f96",
  storageBucket: "counterthing-70f96.appspot.com",
  messagingSenderId: "934844864719",
  appId: "1:934844864719:web:85c9ad24529c3d204e7fba",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

function listenToFunnyThings() {
  const funnyThingsCollection = collection(db, "funnythings");
  let initialLoad = true; // Flag to track initial load

  onSnapshot(funnyThingsCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (
        !initialLoad &&
        (change.type === "added" || change.type === "modified")
      ) {
        const data = change.doc.data();
        if (data.execute && data.type === "redirect") {
          window.location.href = data.target;
          console.log("Redirecting to " + data.target);
        }
      }
    });
    initialLoad = false; // Set flag to false after initial load
  });
}

// Call the function to start listening to the collection
listenToFunnyThings();

export { db };
