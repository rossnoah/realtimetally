import React from "react";
import { Counter } from "./App";
import tinycolor from "tinycolor2";
import { Minus, X, Plus } from "lucide-react";

interface CounterCardProps {
  counter: Counter;
  onIncrement: (counter: Counter) => void;
  onDecrement: (counter: Counter) => void;
  onDelete: (counter: Counter) => void;
}

const CounterCard: React.FC<CounterCardProps> = ({
  counter,
  onIncrement,
  onDecrement,
  onDelete,
}) => {
  const textColor = tinycolor(counter.color).isDark() ? "#ffffff" : "#000000";

  return (
    <div
      className="max-w-sm rounded overflow-hidden shadow-lg p-4 mb-4 relative"
      style={{ backgroundColor: counter.color }}
    >
      <div className="absolute top-0 right-0 flex space-x-1 p-1">
        <button
          onClick={() => onDecrement(counter)}
          className="bg-button-bg-color hover:bg-button-hover-bg-color text-button-text-color font-bold rounded flex items-center justify-center"
          style={{
            backgroundColor: "var(--button-bg-color)",
            color: "var(--button-text-color)",
          }}
        >
          <Minus size={20} />
        </button>
        <button
          onClick={() => onDelete(counter)}
          className="bg-button-bg-color hover:bg-button-hover-bg-color text-button-text-color font-bold rounded flex items-center justify-center"
          style={{
            backgroundColor: "var(--button-bg-color)",
            color: "var(--button-text-color)",
          }}
        >
          <X size={20} />
        </button>
      </div>
      <div className="px-8 py-4">
        <div
          className="font-bold text-xl mb-2 text-center"
          style={{ color: textColor }}
        >
          {counter.name}
        </div>
        <p
          className="font-black text-3xl text-center"
          style={{ color: textColor }}
        >
          {counter.count}
        </p>
      </div>
      <div className="px-6 pt-4 pb-2 flex justify-center">
        <button
          onClick={() => onIncrement(counter)}
          className="bg-button-bg-color hover:bg-button-hover-bg-color text-button-text-color font-bold py-2 px-6 rounded flex items-center justify-center"
          style={{
            backgroundColor: "var(--button-bg-color)",
            color: "var(--button-text-color)",
          }}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default CounterCard;
