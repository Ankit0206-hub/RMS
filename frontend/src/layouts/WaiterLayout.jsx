import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Utensils, ConciergeBell, CheckSquare, LogOut, Bell, Menu } from 'lucide-react';

const WaiterLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/waiter/dashboard', label: 'My Tables', icon: ConciergeBell },
        { path: '/waiter/orders', label: 'Serving Queue', icon: CheckSquare },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-inter overflow-hidden">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300`}>
                <div className={`h-16 flex items-center border-b border-gray-200 ${isSidebarOpen ? 'px-6' : 'justify-center px-0'}`}>
                    <Utensils className={`h-6 w-6 shrink-0 text-cyan-600 ${isSidebarOpen ? 'mr-2' : ''}`} />
                    {isSidebarOpen && <span className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap">DineOps <span className="text-cyan-500">Waiter</span></span>}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={!isSidebarOpen ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                    isActive 
                                    ? 'bg-cyan-50 text-cyan-600' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                } ${!isSidebarOpen && 'justify-center'}`
                            }
                        >
                            <item.icon className={`h-5 w-5 shrink-0 ${isSidebarOpen ? 'mr-3' : ''} ${window.location.pathname.startsWith(item.path) ? 'text-cyan-600' : 'text-gray-400'}`} />
                            {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button 
                        onClick={handleLogout}
                        title={!isSidebarOpen ? 'Sign out' : undefined}
                        className={`flex items-center w-full px-3 py-2 text-sm font-semibold text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${!isSidebarOpen ? 'justify-center w-full' : 'w-full'}`}
                    >
                        <LogOut className={`h-5 w-5 shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} />
                        {isSidebarOpen && <span className="whitespace-nowrap">Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">Waiter Portal</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-cyan-600 transition-colors relative">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-sm font-bold text-cyan-700 border border-cyan-200">
                            W
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default WaiterLayout;
