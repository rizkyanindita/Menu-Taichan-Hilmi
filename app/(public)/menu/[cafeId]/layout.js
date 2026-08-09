export default function MenuLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#FCFCFB] dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Minimalist Layout - Removed fixed header for editorial feel */}
            {children}
        </div>
    );
}
