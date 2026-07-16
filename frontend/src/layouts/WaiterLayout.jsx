import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Utensils, Grid, ClipboardList, Bell, User, LogOut, Menu } from 'lucide-react';

const WaiterLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/waiter/tables', label: 'Tables', icon: Grid },
        { path: '/waiter/take-order', label: 'Take Order', icon: Utensils },
        { path: '/waiter/orders', label: 'Orders', icon: ClipboardList },
        { path: '/waiter/requests', label: 'Requests', icon: Bell },
        { path: '/waiter/profile', label: 'Profile', icon: User },
    ];

    // Check if a path is active (including sub-routes)
    const isActivePath = (path) => {
        if (path === '/waiter/tables' && (location.pathname === '/waiter/tables' || location.pathname.match(/^\/waiter\/tables\/\d+$/))) return true;
        if (path === '/waiter/take-order' && location.pathname.includes('/menu')) return true;
        if (path === '/waiter/orders' && location.pathname.includes('/orders')) return true;
        if (path === '/waiter/requests' && location.pathname.includes('/requests')) return true;
        if (path === '/waiter/profile' && location.pathname.includes('/profile')) return true;
        return location.pathname === path;
    };

    return (
        <div className="flex h-screen w-full justify-center bg-gray-50 dark:bg-slate-900 font-inter">
            <div className="relative h-full w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm sm:border-x border-gray-100 dark:border-slate-800 flex flex-col">
                
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-50 pb-16">
                    <Outlet />
                </main>

                {/* Universal Bottom Navigation */}
                <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-50 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    {navItems.map((item) => {
                        const active = isActivePath(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                                    active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <item.icon className={`h-6 w-6 ${active ? 'fill-orange-50 stroke-orange-500' : ''}`} strokeWidth={active ? 2.5 : 2} />
                                <span className={`text-[10px] font-medium ${active ? 'text-orange-500' : 'text-gray-500'}`}>
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

export default WaiterLayout;
