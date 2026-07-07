"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import CallList from './components/CallList';
import OrderList from './components/OrderList';
import Insights from './components/Insights';
import MenuManager from './components/MenuManager';

function StaffHeader() {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const hour = now.getHours();
    const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

    return (
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    {/* Role badge */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Staff · On Duty
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {greeting} 👋
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{dateStr}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/10"
                >
                    Logout 🚪
                </button>
            </div>

                {/* Quick stats */}
                <div className="flex gap-3">
                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 min-w-[72px]">
                        <span className="text-xl font-black text-white">2</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Calls</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 min-w-[72px]">
                        <span className="text-xl font-black text-amber-400">2</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Preparing</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 min-w-[72px]">
                        <span className="text-xl font-black text-green-400">2</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Served</span>
                    </div>
                </div>
            </div>
        );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!role) {
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    router.push(`/dashboard?role=${user.role}`);
                } catch (e) {
                    localStorage.removeItem("user");
                    router.push("/login");
                }
            } else {
                router.push("/login");
            }
        }
    }, [role, router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (!role) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (role === 'owner') {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold rounded-xl transition-all border border-red-100"
                    >
                        Logout 🚪
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Insights />
                    <MenuManager />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <StaffHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CallList />
                <OrderList />
            </div>
            
            {/* Added MenuManager to Staff View as requested */}
            <div className="mt-8 pt-8 border-t-2 border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">Menu Management</h2>
                <MenuManager />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

