import CallList from './components/CallList';
import OrderList from './components/OrderList';
import Insights from './components/Insights';
import MenuManager from './components/MenuManager';

function StaffHeader() {
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
        </div>
    );
}

export default async function DashboardPage({ searchParams }) {
    const { role } = await searchParams;

    if (role === 'owner') {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
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
        </div>
    );
}

