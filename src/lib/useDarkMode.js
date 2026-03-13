import { useEffect, useState } from "react";

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        return savedMode ? JSON.parse(savedMode) : false;
    });

    // Apply dark mode immediately on mount to prevent flash
    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode");
        const initialDarkMode = savedMode ? JSON.parse(savedMode) : false;

        // Apply to both html and body for better compatibility
        if (initialDarkMode) {
            document.documentElement.classList.add("dark");
            document.body.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
            document.body.classList.remove("dark");
        }
    }, []);

    // Update dark mode when state changes
    useEffect(() => {
        // Apply to both html and body for better compatibility
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            document.body.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
        // No reload needed - the useEffect will handle the theme change instantly
    };

    return [isDarkMode, toggleDarkMode];
}


