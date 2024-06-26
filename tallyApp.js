// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// Firebase configuration
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
const db = getFirestore(app);

document.addEventListener("alpine:init", () => {
  Alpine.data("tallyApp", () => ({
    tallies: [],
    newTallyName: "",
    newTallyColor: "#ffffff",
    init() {
      const tallyCollection = collection(db, "tallies");
      onSnapshot(tallyCollection, (snapshot) => {
        this.tallies = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    },
    async createTally() {
      if (this.newTallyName.trim() === "") return;
      await addDoc(collection(db, "tallies"), {
        name: this.newTallyName,
        color: this.newTallyColor,
        count: 0,
      });
      this.newTallyName = "";
      this.newTallyColor = "#ffffff";
    },
    async incrementTally(tally) {
      const tallyRef = doc(db, "tallies", tally.id);
      await updateDoc(tallyRef, {
        count: tally.count + 1,
      });
    },
    async decrementTally(tally) {
      if (confirm("Are you sure you want to decrement this tally?")) {
        const tallyRef = doc(db, "tallies", tally.id);
        await updateDoc(tallyRef, {
          count: tally.count - 1,
        });
      }
    },
    async deleteTally(tally) {
      if (confirm("Are you sure you want to delete this tally?")) {
        const tallyRef = doc(db, "tallies", tally.id);
        await deleteDoc(tallyRef);
      }
    },
  }));
});
