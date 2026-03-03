import { Users, ShoppingBag, Box, Lightbulb } from 'lucide-react';
import { useDashboardStats } from '../features/dashboard/hooks';

const Dashboard = () => {
    const { data: statsData, isLoading } = useDashboardStats();

    const stats = [
        { title: 'Total Users', value: statsData?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
        { title: 'Total Products', value: statsData?.totalProducts || 0, icon: Box, color: 'bg-emerald-500' },
        { title: 'Total Orders', value: statsData?.totalOrders || 0, icon: ShoppingBag, color: 'bg-purple-500' },
        { title: 'Total Tips', value: statsData?.totalTips || 0, icon: Lightbulb, color: 'bg-amber-500' },
    ];

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back to AgriAI Admin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                        <div className={`p-4 rounded-xl text-white shadow-lg ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6 min-h-[400px]">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="flex items-center justify-center h-[300px] text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <p>Activity timeline will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
