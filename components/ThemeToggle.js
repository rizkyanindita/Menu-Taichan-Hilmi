"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };

    if (!mounted) {
        // Static placeholder shown before hydration — pure CSS (no JS state), so it's
        // visible immediately instead of leaving a blank gap while JS loads on mobile.
        return (
            <div
                className="relative w-12 h-6 rounded-full bg-gray-200 dark:bg-white/10 border border-gray-300/60 dark:border-white/10 shadow-sm"
                aria-hidden="true"
            >
                <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            aria-pressed={isDark}
            className="relative w-12 h-6 rounded-full bg-gray-200 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-500 border border-gray-300/60 dark:border-transparent shadow-sm transition-colors duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] transition-transform duration-300 ease-out ${
                    isDark ? "translate-x-6 rotate-[360deg]" : "translate-x-0"
                }`}
            >
                {isDark ? "🌙" : "☀️"}
            </span>
        </button>
    );
}
