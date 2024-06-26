// Import Firebase scripts
// Note: Ensure that Firebase scripts are included in the HTML before this script

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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

document.addEventListener("alpine:init", () => {
  Alpine.data("tallyApp", () => ({
    tallies: [],
    newTallyName: "",
    newTallyColor: "#ffffff",
    async init() {
      console.log("Initializing the application...");
      const tallyCollection = db.collection("tallies");

      // Fetch all tallies initially
      const querySnapshot = await tallyCollection.get();
      this.tallies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Log initial tallies data
      console.log("Initial tallies loaded:", this.tallies);

      // Set up real-time listener for subsequent updates
      tallyCollection.onSnapshot((snapshot) => {
        this.tallies = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Real-time update received:", this.tallies);
      });
    },
    async createTally() {
      console.log(
        "Creating a new tally with name:",
        this.newTallyName,
        "and color:",
        this.newTallyColor
      );
      if (this.newTallyName.trim() === "") return;
      await db.collection("tallies").add({
        name: this.newTallyName,
        color: this.newTallyColor,
        count: 0,
      });
      console.log("New tally created successfully.");
      this.newTallyName = "";
      this.newTallyColor = "#ffffff";
    },
    async incrementTally(tally) {
      console.log("Incrementing tally:", tally);
      const tallyRef = db.collection("tallies").doc(tally.id);
      await tallyRef.update({
        count: tally.count + 1,
      });
      console.log("Tally incremented successfully.");
    },
    async decrementTally(tally) {
      console.log("Decrementing tally:", tally);
      if (confirm("Are you sure you want to decrement this tally?")) {
        const tallyRef = db.collection("tallies").doc(tally.id);
        await tallyRef.update({
          count: tally.count - 1,
        });
        console.log("Tally decremented successfully.");
      } else {
        console.log("Decrement action canceled.");
      }
    },
    async deleteTally(tally) {
      console.log("Deleting tally:", tally);
      if (confirm("Are you sure you want to delete this tally?")) {
        const tallyRef = db.collection("tallies").doc(tally.id);
        await tallyRef.delete();
        console.log("Tally deleted successfully.");
      } else {
        console.log("Delete action canceled.");
      }
    },
  }));
});
