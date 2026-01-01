export default function MenuLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#FCFCFB]">
            {/* Minimalist Layout - Removed fixed header for editorial feel */}
            {children}
        </div>
    );
}
