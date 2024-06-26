import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  updateDoc,
  increment,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Your web app's Firebase configuration
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

const counterContainer = document.getElementById("counter-container");
const addCategoryBtn = document.getElementById("add-category-btn");
const categoryNameInput = document.getElementById("category-name");
const categoryColorInput = document.getElementById("category-color");

// Function to create a counter element
function createCounterElement(id, name, color, count) {
  const counter = document.createElement("div");
  counter.className = "counter";
  counter.id = `${id}-counter`;
  counter.style.color = color;

  const countSpan = document.createElement("span");
  countSpan.id = `${id}-count`;
  countSpan.textContent = count;

  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;

  counter.appendChild(countSpan);
  counter.appendChild(nameSpan);

  // Click event to increment count
  counter.addEventListener("click", () => updateCounter(id, 1));

  // Right-click event to decrement count with confirmation
  counter.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
    if (confirm(`Do you want to decrement ${name}'s count?`)) {
      await updateCounter(id, -1);
    }
  });

  // Double-click event to remove category with confirmation
  counter.addEventListener("dblclick", async (e) => {
    if (confirm(`Do you want to remove the category ${name}?`)) {
      await deleteCounter(id);
    }
  });

  counterContainer.appendChild(counter);
}

// Function to update counter in Firestore
async function updateCounter(id, amount) {
  const counterDoc = doc(db, "counters", id);
  await updateDoc(counterDoc, {
    count: increment(amount),
  });
}

// Function to add a new category
async function addCategory() {
  const name = categoryNameInput.value.trim();
  const color = categoryColorInput.value;

  if (name === "") {
    alert("Category name cannot be empty");
    return;
  }

  const id = name.toLowerCase().replace(/\s+/g, "-");
  const counterDoc = doc(db, "counters", id);

  await setDoc(counterDoc, {
    name: name,
    color: color,
    count: 0,
  });

  categoryNameInput.value = "";
}

// Function to delete a counter
async function deleteCounter(id) {
  await deleteDoc(doc(db, "counters", id));
  const counterElement = document.getElementById(`${id}-counter`);
  counterContainer.removeChild(counterElement);
}

// Listen for changes in the counters collection
onSnapshot(collection(db, "counters"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    const id = change.doc.id;
    if (change.type === "added") {
      createCounterElement(id, data.name, data.color, data.count);
    }
    if (change.type === "modified") {
      document.getElementById(`${id}-count`).textContent = data.count;
    }
    if (change.type === "removed") {
      const counterElement = document.getElementById(`${id}-counter`);
      counterContainer.removeChild(counterElement);
    }
  });
});

addCategoryBtn.addEventListener("click", addCategory);
