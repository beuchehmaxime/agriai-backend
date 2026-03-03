import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, ListIcon, Box, Stethoscope, Lightbulb, LogOut, X } from 'lucide-react';
import { useAuth } from '../features/auth/hooks';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Categories', path: '/categories', icon: ListIcon },
        { name: 'Products', path: '/products', icon: Box },
        { name: 'Orders', path: '/orders', icon: ShoppingBag },
        { name: 'Expert Applications', path: '/applications', icon: Stethoscope },
        { name: 'Tips', path: '/tips', icon: Lightbulb },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl shadow-gray-200/50 flex flex-col z-30 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between py-6 px-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-500 text-white p-2 rounded-xl bg-green-500 shadow-md">
                        <Box size={24} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                        AgriAI Admin
                    </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-green-50 text-green-700 shadow-sm shadow-green-100 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon size={20} className="stroke-[1.5]" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} className="stroke-[1.5]" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
