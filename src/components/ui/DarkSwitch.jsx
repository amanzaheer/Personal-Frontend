import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../../lib/useDarkMode";

export default function DarkSwitch({ className = "", bgSun }) {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  return (
    <div
      onClick={toggleDarkMode}
      role="button"
      tabIndex={0}
      className={`flex items-center justify-center border rounded-full p-[3px] border-gray-300 dark:border-white/20 gap-1 cursor-pointer ${className}`}
    >
      <Sun
        className={`w-6 p-1 ${
          !isDarkMode && `${bgSun || "bg-white/30"} rounded-full`
        }`}
      />
      <Moon
        className={`w-6 p-1 ${
          isDarkMode && "bg-white/30 rounded-full text-white"
        }`}
      />
    </div>
  );
}
