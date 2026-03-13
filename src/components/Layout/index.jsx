import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useDarkMode } from "../../lib/useDarkMode";

export default function Layout({ children }) {
  const [isDarkMode] = useDarkMode();
  const [sidebar, setSidebar] = useState(true);
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const toggleSidebar = () => {
    setSidebar((prev) => !prev);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "s") {
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isAuthPage) {
    return (
      <div
        className={`min-h-screen flex w-full ${
          isDarkMode ? "dark bg-background" : "bg-background"
        }`}
      >
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex w-full ${
        isDarkMode ? "dark bg-background" : "bg-background"
      }`}
    >
      <Sidebar sidebar={sidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <Header toggleSidebar={toggleSidebar} currentPage={location.pathname} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
