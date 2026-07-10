/** @type {import('tailwindcss').Config} */
module.exports = {
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
            },
            animation: {
                fadeIn: "fadeIn 0.25s ease-out",
                slideUp: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
                scaleIn: "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
            },
        },
    },
    plugins: [],
};
