import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  updateDoc,
  doc,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import CounterCard from "./CounterCard";
import { Moon, Sun } from "lucide-react";

export interface Counter {
  id: string;
  name: string;
  color: string;
  count: number;
  deleted: boolean;
  createdAt: Timestamp;
}

export default function App() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [newTallyName, setNewTallyName] = useState("");
  const [newTallyColor, setNewTallyColor] = useState("#000000");

  const savedDarkMode = localStorage.getItem("darkMode");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [darkMode, setDarkMode] = useState(
    savedDarkMode === "true" || (prefersDark && savedDarkMode !== "false")
  );

  // Save dark mode state to local storage and apply class to body
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const q = query(collection(db, "counters"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const countersData: Counter[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Counter;
        if (!data.deleted) {
          countersData.push({ ...data, id: doc.id }); // id specified once here
        }
      });
      countersData.sort(
        (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
      ); // Sort by creation time
      setCounters(countersData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTally = async () => {
    if (newTallyName) {
      const q = query(
        collection(db, "counters"),
        where("name", "==", newTallyName)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingCounter = querySnapshot.docs[0];
        const data = existingCounter.data();

        if (data.deleted) {
          if (
            confirm(
              `A deleted tally with the name "${newTallyName}" exists. Do you want to bring it back?`
            )
          ) {
            const counterRef = doc(db, "counters", existingCounter.id);
            await updateDoc(counterRef, {
              deleted: false,
            });
          } else {
            await addDoc(collection(db, "counters"), {
              name: newTallyName,
              color: newTallyColor,
              count: 0,
              deleted: false,
              createdAt: Timestamp.now(), // Add creation time
            });
          }
        } else {
          alert(`A tally with the name "${newTallyName}" already exists.`);
        }
      } else {
        await addDoc(collection(db, "counters"), {
          name: newTallyName,
          color: newTallyColor,
          count: 0,
          deleted: false,
          createdAt: Timestamp.now(), // Add creation time
        });
      }

      setNewTallyName("");
      setNewTallyColor("#000000");
    }
  };

  const incrementCounter = async (counter: Counter) => {
    const counterRef = doc(db, "counters", counter.id);
    await updateDoc(counterRef, {
      count: counter.count + 1,
    });
  };

  const decrementCounter = async (counter: Counter) => {
    const counterRef = doc(db, "counters", counter.id);
    await updateDoc(counterRef, {
      count: counter.count - 1,
    });
  };

  const confirmDecrement = async (counter: Counter) => {
    if (confirm(`Do you want to decrement ${counter.name}'s count?`)) {
      await decrementCounter(counter);
    }
  };

  const deleteCounter = async (counter: Counter) => {
    const counterRef = doc(db, "counters", counter.id);
    await updateDoc(counterRef, {
      deleted: true,
    });
  };

  const confirmDelete = async (counter: Counter) => {
    if (confirm(`Do you want to delete ${counter.name}?`)) {
      await deleteCounter(counter);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-2 bg-gray-800 text-white rounded-full focus:outline-none"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <h1 className="text-6xl text-center font-bold text-blue-600 my-8 dark:text-blue-400">
        Real Time Tally
      </h1>
      <div className="flex flex-wrap justify-center gap-4 my-8">
        <div className="w-1/3 flex flex-row items-center gap-4">
          <div className="flex flex-col w-2/3 space-y-4">
            <input
              type="text"
              name="createTallyName"
              placeholder="Tally Name"
              value={newTallyName}
              onChange={(e) => setNewTallyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <input
              type="color"
              name="createTallyColor"
              value={newTallyColor}
              onChange={(e) => setNewTallyColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <button
            onClick={handleAddTally}
            className="w-48 h-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Add Tally
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-center mt-8">
        <div className="flex flex-wrap justify-center gap-4 w-2/3">
          {counters.map((counter) => (
            <CounterCard
              key={counter.id}
              counter={counter}
              onIncrement={incrementCounter}
              onDecrement={confirmDecrement}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
