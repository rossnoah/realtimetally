import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  where,
  getDocs,
  Timestamp,
  query,
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
  const [roomCode, setRoomCode] = useState(
    localStorage.getItem("roomCode") || ""
  );
  const [newRoomCode, setNewRoomCode] = useState("");

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

  // Load counters when roomCode changes
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = doc(db, "rooms", roomCode);
    const q = query(collection(roomRef, "counters"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const countersData: Counter[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Counter;
        if (!data.deleted) {
          countersData.push({ ...data, id: doc.id });
        }
      });
      countersData.sort(
        (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
      );
      setCounters(countersData);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const handleAddTally = async () => {
    if (newTallyName && roomCode) {
      const roomRef = doc(db, "rooms", roomCode);
      const q = query(
        collection(roomRef, "counters"),
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
            const counterRef = doc(roomRef, "counters", existingCounter.id);
            await updateDoc(counterRef, {
              deleted: false,
            });
          } else {
            await addDoc(collection(roomRef, "counters"), {
              name: newTallyName,
              color: newTallyColor,
              count: 0,
              deleted: false,
              createdAt: Timestamp.now(),
            });
          }
        } else {
          alert(`A tally with the name "${newTallyName}" already exists.`);
        }
      } else {
        await addDoc(collection(roomRef, "counters"), {
          name: newTallyName,
          color: newTallyColor,
          count: 0,
          deleted: false,
          createdAt: Timestamp.now(),
        });
      }

      setNewTallyName("");
      setNewTallyColor("#000000");
    }
  };

  const incrementCounter = async (counter: Counter) => {
    const roomRef = doc(db, "rooms", roomCode);
    const counterRef = doc(roomRef, "counters", counter.id);
    await updateDoc(counterRef, {
      count: counter.count + 1,
    });
  };

  const decrementCounter = async (counter: Counter) => {
    const roomRef = doc(db, "rooms", roomCode);
    const counterRef = doc(roomRef, "counters", counter.id);
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
    const roomRef = doc(db, "rooms", roomCode);
    const counterRef = doc(roomRef, "counters", counter.id);
    await updateDoc(counterRef, {
      deleted: true,
    });
  };

  const confirmDelete = async (counter: Counter) => {
    if (confirm(`Do you want to delete ${counter.name}?`)) {
      await deleteCounter(counter);
    }
  };

  const handleJoinRoom = () => {
    if (newRoomCode) {
      setRoomCode(newRoomCode);
      localStorage.setItem("roomCode", newRoomCode);
    }
  };

  const handleCreateRoom = async () => {
    const generatedRoomCode = Math.random().toString(36).substring(2, 10);
    await addDoc(collection(db, "rooms"), { roomCode: generatedRoomCode });
    setRoomCode(generatedRoomCode);
    localStorage.setItem("roomCode", generatedRoomCode);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      {!roomCode ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
            Join or Create a Room
          </h1>
          <div className="flex flex-col items-center space-y-4">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={newRoomCode}
              onChange={(e) => setNewRoomCode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleJoinRoom}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Join Room
            </button>
            <button
              onClick={handleCreateRoom}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Create Room
            </button>
          </div>
        </div>
      ) : (
        <div className={darkMode ? "dark" : ""}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed top-4 right-4 p-2 bg-gray-800 text-white rounded-full focus:outline-none"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="text-center my-4">
            <p className="text-lg text-gray-800 dark:text-gray-200">
              Your room code is: <span className="font-bold">{roomCode}</span>
            </p>
            <button
              onClick={() => setRoomCode("")}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Leave Room
            </button>
          </div>
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
      )}
    </div>
  );
}
