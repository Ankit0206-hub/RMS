import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, ChefHat, ConciergeBell, Clock, User, Bell, ArrowLeft } from 'lucide-react';

const KitchenLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/kitchen/new', label: 'New', icon: Home },
        { path: '/kitchen/preparing', label: 'Preparing', icon: ChefHat },
        { path: '/kitchen/ready', label: 'Ready', icon: ConciergeBell },
        { path: '/kitchen/history', label: 'History', icon: Clock },
        { path: '/kitchen/profile', label: 'Profile', icon: User },
    ];

    const isActivePath = (path) => {
        if (path === '/kitchen/new' && location.pathname.includes('/kitchen/new')) return true;
        if (path === '/kitchen/preparing' && location.pathname.includes('/kitchen/preparing')) return true;
        if (path === '/kitchen/ready' && location.pathname.includes('/kitchen/ready')) return true;
        if (path === '/kitchen/history' && location.pathname.includes('/kitchen/history')) return true;
        if (path === '/kitchen/profile' && location.pathname.includes('/kitchen/profile')) return true;
        return location.pathname === path;
    };

    const getHeaderTitle = () => {
        if (location.pathname.includes('/kitchen/new')) return 'New Orders';
        if (location.pathname.includes('/kitchen/preparing')) return 'Preparing';
        if (location.pathname.includes('/kitchen/ready')) return 'Ready to Serve';
        if (location.pathname.includes('/kitchen/history')) return 'Order History';
        if (location.pathname.includes('/kitchen/profile')) return 'Profile';
        if (location.pathname.includes('/kitchen/notifications')) return 'Notifications';
        if (location.pathname.includes('/kitchen/orders/')) return 'Order Details';
        return 'Kitchen';
    };

    return (
        <div className="flex h-screen w-full justify-center bg-gray-50 font-inter">
            <div className="relative h-full w-full max-w-7xl overflow-hidden bg-gray-50 shadow-sm sm:border-x border-gray-200 flex flex-col">

                {/* Top Header - Dark Green */}
                <header className="flex items-center justify-between px-4 py-3 bg-[#f97316] text-white shadow-sm z-10 shrink-0">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-[#ea580c] rounded-md transition-colors text-white" aria-label="Go back">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-semibold tracking-wide">
                        {getHeaderTitle()}
                    </h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/kitchen/notifications')} className="p-1 hover:bg-[#ea580c] rounded-md transition-colors relative">
                            <Bell size={24} />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#f97316]"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-50 pb-16">
                    <Outlet />
                </main>

                {/* Universal Bottom Navigation - Orange with Dark Icons */}
                <nav className="absolute bottom-0 left-0 right-0 bg-[#f97316] border-t border-[#ea580c] flex justify-around items-center h-16 px-2 z-50 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                    {navItems.map((item) => {
                        const active = isActivePath(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-gray-900' : 'text-gray-900/60 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`h-6 w-6 ${active ? 'fill-gray-900 stroke-[#f97316]' : ''}`} strokeWidth={active ? 2.5 : 2} />
                                <span className={`text-[10px] font-bold ${active ? 'text-gray-900' : 'text-gray-900/60'}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default KitchenLayout;
