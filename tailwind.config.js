/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
            },
            fontFamily: {
                sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
                jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.92)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-400px 0" },
                    "100%": { backgroundPosition: "400px 0" },
                },
                popIn: {
                    "0%": { transform: "scale(0.85)", opacity: "0" },
                    "60%": { transform: "scale(1.05)", opacity: "1" },
                    "100%": { transform: "scale(1)" },
                },
                pulseRing: {
                    "0%": { boxShadow: "0 0 0 0 rgba(255,87,34,0.45)" },
                    "70%": { boxShadow: "0 0 0 12px rgba(255,87,34,0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(255,87,34,0)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.25s ease-out",
                slideUp: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
                scaleIn: "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
                shimmer: "shimmer 1.6s infinite linear",
                popIn: "popIn 0.4s cubic-bezier(0.16,1,0.3,1)",
                pulseRing: "pulseRing 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
            },
        },
    },
    plugins: [],
};
