"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-14 rounded-full bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 border border-white/20 dark:border-white/20 transition-all duration-300 flex items-center justify-center group"
            aria-label="Toggle theme"
        >
            {/* Sun icon (visible in dark mode) */}
            <Sun
                className={`w-6 h-6 text-yellow-400 absolute transition-all duration-300 ${theme === "dark"
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 rotate-90 scale-0"
                    }`}
            />

            {/* Moon icon (visible in light mode) */}
            <Moon
                className={`w-6 h-6 text-slate-700 absolute transition-all duration-300 ${theme === "light"
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-90 scale-0"
                    }`}
            />

            {/* Tooltip */}
            <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
        </button>
    );
}
