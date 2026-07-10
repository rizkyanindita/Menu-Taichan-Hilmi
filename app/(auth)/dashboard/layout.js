"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user.role === "owner") {
                    setUserName("Hilmi");
                } else if (user.role === "staff") {
                    setUserName("Staff");
                } else {
                    setUserName(user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User");
                }
                setIsAuthorized(true);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                router.replace("/login");
            }
        } else {
            router.replace("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        console.log("Logging out...");
        router.replace("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex flex-col">
            {/* Modern Navigation Bar - Only show if authorized */}
            {isAuthorized && (
                <nav className="bg-white/95 backdrop-blur-sm border-b-2 border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        {/* Branding Section */}
                        <Link href="/dashboard?role=owner" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl font-bold">Q</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    QR Menu Dashboard
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">Management Portal</p>
                            </div>
                        </Link>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">👤</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Selamat datang!</p>
                                    <p className="text-sm font-bold text-gray-900">{userName}</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 
                                         text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 
                                         transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                            >
                                <span className="text-lg">🚪</span>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* ALWAYS render children in Layouts, hide visually if not authorized */}
                <div className={!isAuthorized ? "hidden" : "animate-fadeIn"}>
                    {children}
                </div>
                {!isAuthorized && (
                    <div className="flex items-center justify-center h-full min-h-[60vh]">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </main>

            {/* Optional Footer */}
            {isAuthorized && (
                <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-4 px-6 mt-auto">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-sm text-gray-500">
                            © 2025 QR Menu App • Made with <span className="text-red-500">❤️</span>
                        </p>
                    </div>
                </footer>
            )}
        </div>
    )
}
