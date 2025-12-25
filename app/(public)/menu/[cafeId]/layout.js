export default function MenuLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Floating Header or simple header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 p-4">
                <h1 className="text-xl font-bold text-center bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Cafe Menu</h1>
            </header>
            {children}
        </div>
    );
}
