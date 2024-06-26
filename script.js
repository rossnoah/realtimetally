import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  updateDoc,
  increment,
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

// Initialize counts from Firestore
async function initializeCounts() {
  const querySnapshot = await getDocs(collection(db, "counters"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    createCounterElement(doc.id, data.name, data.color, data.count);
  });
}

// Function to update counter in Firestore
async function updateCounter(id, amount) {
  const counterDoc = doc(db, "counters", id);
  await updateDoc(counterDoc, {
    count: increment(amount),
  });
  const updatedDoc = await getDoc(counterDoc);
  document.getElementById(`${id}-count`).textContent = updatedDoc.data().count;
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

  createCounterElement(id, name, color, 0);
  categoryNameInput.value = "";
}

addCategoryBtn.addEventListener("click", addCategory);

// Initialize counters on page load
initializeCounts();
