import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ListOrdered, CheckCircle2, User, Bell, LogOut } from 'lucide-react';

const KitchenLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/kitchen/orders', label: 'Orders', icon: ListOrdered },
        { path: '/kitchen/prepared', label: 'Prepared', icon: CheckCircle2 }
    ];

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100 font-inter">
            {/* Top Header - Dark Sidebar / Navbar */}
            <header className="flex items-center justify-between px-6 py-4 bg-[#1f2937] text-white shadow-md z-10 shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-orange-500 tracking-wide mr-4">
                        KDS
                    </h1>
                    <nav className="flex space-x-2">
                        {navItems.map((item) => {
                            const active = location.pathname.includes(item.path);
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                        active 
                                        ? 'bg-orange-500 text-white font-semibold' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 mr-4 border-r border-gray-600 pr-4">
                        <User size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-300">{user?.first_name || 'Kitchen Staff'}</span>
                    </div>
                    
                    <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                        <LogOut size={20} />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-100 p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default KitchenLayout;
