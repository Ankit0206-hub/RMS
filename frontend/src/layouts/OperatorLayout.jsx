import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    Grid,
    Calendar,
    CreditCard,
    User,
    FileText,
    MessageSquare,
    Users,
    BarChart2,
    Settings,
    ArrowLeft,
    Bell,
    Menu,
    Sun,
    Search,
    Utensils,
    UtensilsCrossed,
    ChevronDown,
    ChevronUp,
    Moon,
    Star,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

const OperatorLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('operatorDarkMode') === 'true';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('operatorDarkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('operatorDarkMode', 'false');
        }
    }, [darkMode]);

    // Auto-close sidebar on mobile when navigating
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // Handle window resize to auto-open/close sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = (label) => {
        setExpandedMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/operator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/operator/reservations', label: 'Reservations', icon: Calendar },
        { path: '/operator/table-assignment', label: 'Table Assignment', icon: Grid },
        { path: '/operator/waiters', label: 'Waiters', icon: Users },

        {
            label: 'Restaurant', icon: Utensils,
            children: [
                { path: '/operator/kitchens', label: 'Kitchens' },
                { path: '/operator/floor-plan', label: 'Floor Plan' }
            ]
        },
        {
            label: 'Menu Management', icon: UtensilsCrossed,
            children: [
                { path: '/operator/menu-items', label: 'Menu Items' },
                { path: '/operator/categories', label: 'Add Category & Items' }
            ]
        },
        { path: '/operator/orders', label: 'Orders', icon: FileText },

        { path: '/operator/billing', label: 'Billing & Payments', icon: CreditCard },
        { path: '/operator/customers', label: 'Customers', icon: User },
        { path: '/operator/users', label: 'Staff Directory', icon: Users },
        { path: '/operator/testimonials', label: 'Testimonials', icon: Star },
        { path: '/operator/settings', label: 'Settings', icon: Settings },
    ];

    const getPageTitle = () => {
        if (location.pathname.startsWith('/operator/orders/')) {
            return 'Order Details';
        }
        for (const item of navItems) {
            if (item.path === location.pathname) return item.label;
            if (item.children) {
                for (const child of item.children) {
                    if (child.path === location.pathname) return child.label;
                }
            }
        }
        return 'Overview';
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-inter overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] lg:translate-x-0 lg:w-20'} lg:relative lg:block shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-all duration-300`}>
                
                {/* Interactive Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-8 z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-cyan-600 hover:border-cyan-500 hover:scale-110 shadow-sm transition-all duration-200"
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </button>

                {/* Logo Area */}
                <div className={`h-16 flex items-center justify-between ${isSidebarOpen ? 'px-6' : 'justify-center px-0'} border-b border-gray-50 dark:border-slate-800/50/50`}>
                    <div className="flex items-center overflow-hidden">
                        <Utensils className={`h-6 w-6 shrink-0 text-cyan-600 ${isSidebarOpen ? 'mr-2' : ''}`} />
                        {isSidebarOpen && (
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                                DineOps <span className="text-cyan-500">Operator</span>
                            </span>
                        )}
                    </div>
                    {isSidebarOpen && (
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1.5 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 dark:hover:text-white rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Profile Card */}
                {isSidebarOpen ? (
                    <div className="flex items-center px-6 py-5 border-b border-gray-50 dark:border-slate-800/50/80">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150"
                            alt={`${user?.first_name || 'User'} ${user?.last_name || ''}`}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                        />
                        <div className="ml-3 min-w-0">
                            <h4 className="text-sm font-bold text-slate-850 dark:text-white truncate leading-tight">{user?.first_name} {user?.last_name}</h4>
                            <p className="text-[11px] font-semibold text-slate-400 truncate mt-1 capitalize">{user?.role || 'Operator'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center py-4 border-b border-gray-50 dark:border-slate-800/50/80">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150"
                            alt={`${user?.first_name || 'User'} ${user?.last_name || ''}`}
                            className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                        />
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 py-4 px-4 space-y-0.5 overflow-y-auto scrollbar-hide">
                    {navItems.map((item, index) => {
                        if (item.type === 'header') {
                            return (
                                <div
                                    key={index}
                                    className={`text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3.5 mt-5 mb-1.5 ${!isSidebarOpen && 'hidden'}`}
                                >
                                    {item.label}
                                </div>
                            );
                        }

                        const Icon = item.icon;

                        if (item.children) {
                            const isExpanded = expandedMenus[item.label];
                            return (
                                <div key={item.label}>
                                    <div
                                        onClick={() => isSidebarOpen && toggleMenu(item.label)}
                                        className={`group flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-205 cursor-pointer text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-gray-900 dark:text-white ${!isSidebarOpen ? 'justify-center' : ''}`}
                                        title={!isSidebarOpen ? item.label : undefined}
                                    >
                                        <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors text-gray-400 dark:text-slate-500 dark:text-slate-400 group-hover:text-gray-600 dark:text-slate-400 ${isSidebarOpen ? 'mr-3.5' : ''}`} />
                                        {isSidebarOpen && (
                                            <>
                                                <span className="whitespace-nowrap flex-1">{item.label}</span>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </>
                                        )}
                                    </div>
                                    {isSidebarOpen && isExpanded && (
                                        <div className="ml-7 mt-1 space-y-1 relative before:absolute before:left-[-11px] before:top-0 before:bottom-0 before:w-px before:bg-gray-200 dark:bg-slate-700">
                                            {item.children.map(child => (
                                                <NavLink key={child.path} to={child.path}>
                                                    {({ isActive }) => (
                                                        <div className={`relative flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${isActive
                                                                ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-900 dark:text-white font-bold'
                                                                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-gray-900 dark:text-white'
                                                            }`}>
                                                            {/* Line indicator for child item */}
                                                            <div className="absolute left-[-11px] top-1/2 w-2.5 h-px bg-gray-200 dark:bg-slate-700"></div>
                                                            <span className="whitespace-nowrap">{child.label}</span>
                                                        </div>
                                                    )}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                {({ isActive }) => (
                                    <div className={`group flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-205 cursor-pointer ${isActive
                                            ? 'bg-cyan-50/50 text-cyan-700 font-bold'
                                            : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-gray-900 dark:text-white'
                                        } ${!isSidebarOpen ? 'justify-center' : ''}`}>
                                        <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isSidebarOpen ? 'mr-3.5' : ''} ${isActive ? 'text-cyan-600' : 'text-gray-400 dark:text-slate-500 dark:text-slate-400 group-hover:text-gray-600 dark:text-slate-400'
                                            }`} />
                                        {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                                        {isSidebarOpen && item.badge && (
                                            <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-auto uppercase tracking-wider">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Sign out / Login */}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0">
                    
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="mr-3 p-1.5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 dark:hover:text-white rounded-lg transition-colors lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white capitalize">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Sun/Light-dark Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center focus:outline-none relative"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150"
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors"
                                />
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-655 hover:bg-red-50 transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Sub-view rendering */}
                <div className="flex-1 overflow-y-auto md:p-5 bg-gray-50 dark:bg-slate-800/50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default OperatorLayout;
