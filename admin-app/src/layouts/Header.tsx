import { useAuth } from '../features/auth/hooks';
import { Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} />
                </button>
                {/* Search or breadcrumbs could go here */}
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500">{user?.userType}</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full shadow-md flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'A'}
                </div>
            </div>
        </header>
    );
};

export default Header;
