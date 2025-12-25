import CallList from './components/CallList';
import OrderList from './components/OrderList';
import Insights from './components/Insights';
import MenuManager from './components/MenuManager';

export default async function DashboardPage({ searchParams }) {
    const { role } = await searchParams;
    const userRole = role || 'staff'; // Default to staff for demo

    if (role === 'owner') {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Insights />
                    <MenuManager />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CallList />
                <OrderList />
            </div>
        </div>
    );
}
