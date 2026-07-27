import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Users, Settings, LogOut,
    UtensilsCrossed, ClipboardList, Receipt,
    Activity, PieChart, Bell, Menu, ChevronRight, Store, FileText, BellRing, User, Mail, Maximize, Calendar, Plus, MoreVertical, Search, ChevronDown, ChefHat, Star
} from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [expandedMenus, setExpandedMenus] = useState({ 'Menu Management': false, 'Kitchen Management': false });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Force light mode for Admin layout
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

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

    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/admin/notifications');
            return res.data.data;
        },
        refetchInterval: 30000 // Poll every 30s
    });
    const notifications = notificationsData || [];
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await api.post('/admin/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = (name) => {
        setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        {
            name: 'Menu Management',
            path: '/admin/menu',
            icon: UtensilsCrossed,
            hasDropdown: true,
            children: [
                { name: 'Menu Items', path: '/admin/menu' },
                { name: 'Add Category & Items', path: '/admin/menu/add' }
            ]
        },
        {
            name: 'Tables',
            path: '/admin/tables',
            icon: LayoutDashboard,
            hasDropdown: true,
            children: [
                { name: 'Table Add and Overview', path: '/admin/tables' },
                { name: 'Table Reservations', path: '/admin/tables/reservations' },
            ]
        },
        {
            name: 'Orders',
            path: '/admin/orders',
            icon: ClipboardList,
            hasDropdown: false
        },
        {
            name: 'Billing & Payments',
            path: '/admin/billing',
            icon: Receipt,
            hasDropdown: false
        },
        {
            name: 'Kitchen Management',
            path: '/admin/kitchens',
            icon: ChefHat,
            hasDropdown: true,
            children: [
                { name: 'Kitchens List', path: '/admin/kitchens' },
                { name: 'Kitchen KDS Overview', path: '/admin/kitchen' }
            ]
        },
        {
            name: 'Customers',
            path: '/admin/customers',
            icon: Users,
            hasDropdown: false
        },
        {
            name: 'Ratings & Reviews',
            path: '/admin/ratings',
            icon: Star,
            hasDropdown: false
        },
        {
            name: 'Reports & Analytics',
            path: '/admin/analytics',
            icon: PieChart,
            hasDropdown: false
        },
        { name: 'Notifications', path: '/admin/notifications', icon: BellRing, badge: unreadCount > 0 ? unreadCount : null },

        { name: 'Settings', path: '/admin/settings', icon: Settings }
    ];

    const getPageTitle = () => {
        if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') return 'Overview';
        // Flatten children to find the exact sub-page title
        let currentItem = navItems.find(item => location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '#' && item.path !== '/admin/dashboard' && item.path !== '/admin/menu'));

        if (!currentItem && location.pathname.startsWith('/admin/menu')) {
            currentItem = navItems.find(i => i.name === 'Menu Management');
        }
        if (!currentItem && location.pathname.startsWith('/admin/kitchen')) {
            currentItem = navItems.find(i => i.name === 'Kitchen Management');
        }

        if (currentItem?.children) {
            const childItem = currentItem.children.find(child => location.pathname === child.path);
            if (childItem) return childItem.name;
        }
        return currentItem?.name || 'Overview';
    };

    const getBreadcrumbs = () => {
        if (location.pathname.startsWith('/admin/menu')) {
            const childItem = navItems.find(i => i.name === 'Menu Management')?.children.find(c => c.path === location.pathname);
            if (childItem && childItem.name !== 'Menu Items') {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer">Menu Management</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">{childItem.name}</span>
                    </>
                );
            }
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Menu Management</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Menu Items</span>
                </>
            );
        }
        if (location.pathname.startsWith('/admin/tables')) {
            const childItem = navItems.find(i => i.name === 'Tables')?.children.find(c => c.path === location.pathname);
            if (childItem && childItem.name !== 'Table Add and Overview') {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer">Tables</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">{childItem.name}</span>
                    </>
                );
            }
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Tables</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Table Add and Overview</span>
                </>
            );
        }
        if (location.pathname.startsWith('/admin/orders')) {
            if (location.pathname === '/admin/orders') {
                return <span className="text-gray-900">Orders</span>;
            } else if (location.pathname.includes('/returns')) {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin/orders')}>Orders</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">Order Returns</span>
                    </>
                );
            } else {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin/orders')}>Orders</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">Order Details</span>
                    </>
                );
            }
        }
        if (location.pathname.startsWith('/admin/billing')) {
            const billingItem = navItems.find(i => i.name === 'Billing & Payments');
            const childItem = billingItem?.children?.find(c => c.path === location.pathname);
            if (childItem && childItem.name !== 'Billing Overview') {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin/billing')}>Billing & Payments</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">{childItem.name}</span>
                    </>
                );
            }
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Billing & Payments</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Billing Overview</span>
                </>
            );
        }
        if (location.pathname.startsWith('/admin/customers')) {
            return (
                <span className="text-gray-900">Customers</span>
            );
        }
        if (location.pathname.startsWith('/admin/kitchen')) {
            const childItem = navItems.find(i => i.name === 'Kitchen Management')?.children?.find(c => c.path === location.pathname);
            if (childItem && childItem.name !== 'Kitchens List') {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer">Kitchen Management</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">{childItem.name}</span>
                    </>
                );
            }
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Kitchen Management</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Kitchens List</span>
                </>
            );
        }
        if (location.pathname.startsWith('/admin/analytics')) {
            return <span className="text-gray-900">Reports & Analytics</span>;
        }
        if (location.pathname.startsWith('/admin/notifications')) {
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Notifications</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Notifications</span>
                </>
            );
        }

        return <span className="text-gray-900">{getPageTitle()}</span>;
    };

    return (
        <div className="flex h-screen bg-[#f3f4f9] text-gray-900 font-inter overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 shrink-0 bg-[#293275] text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] md:w-20'}`}>
                <div className={`h-24 flex items-center ${isSidebarOpen ? 'justify-between px-6' : 'justify-center px-0'}`}>
                    <div
                        className={`flex items-center space-x-3 ${!isSidebarOpen ? 'cursor-pointer' : ''}`}
                        onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
                    >
                        <div className="bg-white p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <UtensilsCrossed className="w-6 h-6 text-[#6366f1]" />
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <h1 className="text-lg font-bold leading-tight">DineOps</h1>
                                <p className="text-xs text-indigo-200">Admin Panel</p>
                            </div>
                        )}
                    </div>
                    {isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-indigo-200 hover:text-white transition-colors focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    )}
                </div>

                <div className={`flex-1 scrollbar-hide ${isSidebarOpen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'}`}>
                    <nav className="space-y-1 px-3 md:px-4">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            // isActive logic
                            let isActive = false;
                            if (item.path !== '#') {
                                if (item.children) {
                                    isActive = item.children.some(child => location.pathname === child.path) || (item.name === 'Orders' && location.pathname.startsWith('/admin/orders/'));
                                } else {
                                    isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin/dashboard' && item.path !== '/admin');
                                }
                            }

                            const isExpanded = expandedMenus[item.name];

                            return (
                                <div key={index}>
                                    <Link
                                        to={item.children ? '#' : item.path}
                                        onClick={(e) => {
                                            if (item.onClick) {
                                                e.preventDefault();
                                                item.onClick();
                                            } else if (item.hasDropdown) {
                                                e.preventDefault();
                                                if (item.children && !isActive) navigate(item.path); // Navigate to parent route if not active
                                                toggleMenu(item.name);
                                            } else if (item.path === '#') {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all relative group ${isActive
                                                ? 'bg-[#5e5ce6] text-white shadow-md'
                                                : 'text-[#a5a9d6] hover:bg-white/10 hover:text-white'
                                            } ${!isSidebarOpen && 'justify-center'}`}
                                    >
                                        <div className="flex items-center">
                                            <Icon className={`h-5 w-5 shrink-0 ${isSidebarOpen ? 'mr-4' : ''}`} />
                                            {isSidebarOpen && <span>{item.name}</span>}
                                        </div>

                                        {isSidebarOpen && (
                                            <div className="flex items-center">
                                                {item.badge && (
                                                    <span className="bg-[#ff4b4b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {item.hasDropdown && (
                                                    isExpanded ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-[#a5a9d6]" />
                                                )}
                                            </div>
                                        )}

                                        {!isSidebarOpen && (
                                            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1e293b] text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl whitespace-nowrap z-[100] transform translate-x-[-10px] group-hover:translate-x-0">
                                                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#1e293b] rotate-45"></div>
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Children Dropdown */}
                                    {isSidebarOpen && item.children && isExpanded && (
                                        <div className="mt-1 space-y-1 ml-[22px] border-l-2 border-[#3d4585] pl-4">
                                            {item.children.map((child, cIdx) => {
                                                const isChildActive = location.pathname === child.path || (child.name === 'Order Details' && location.pathname.match(/\/admin\/orders\/\d+/));
                                                return (
                                                    <Link
                                                        key={cIdx}
                                                        to={child.path}
                                                        className={`flex items-center py-2 px-3 text-xs font-medium rounded-lg transition-colors ${isChildActive ? 'bg-white/10 text-white relative' : 'text-[#a5a9d6] hover:text-white hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {isChildActive && <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#5e5ce6]"></div>}
                                                        {child.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Fixed Logout Button at Bottom */}
                <div className="p-4 mt-auto border-t border-white/10 bg-[#293275]">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center text-[#a5a9d6] hover:text-[#ff4b4b] hover:bg-white/5 rounded-xl transition-all w-full ${isSidebarOpen ? 'px-4 py-2.5' : 'justify-center py-2.5'}`}
                    >
                        <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-4' : ''}`} />
                        {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                {/* Top Header matching the mockup */}
                <header className="h-auto min-h-24 bg-white flex items-center justify-between px-4 md:px-8 py-3 md:py-0 shrink-0 relative z-10 border-b border-gray-100">
                    <div className="flex items-center">
                        <button
                            className="md:hidden text-gray-500 hover:text-gray-900 mr-3"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            {location.pathname === '/admin/dashboard' || location.pathname === '/admin' ? (
                                <>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                                        Welcome, Admin! <span className="ml-2 text-xl md:text-2xl">👋</span>
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1">Here's what's happening in your restaurant today.</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                        {getPageTitle()}
                                    </h2>
                                    <div className="flex items-center text-[10px] md:text-xs text-gray-500 mt-1.5 font-medium flex-wrap">
                                        <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
                                        <ChevronRight className="w-3 h-3 mx-1" />
                                        {getBreadcrumbs()}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-6">
                        {/* Date Picker Button */}
                        <button className="hidden lg:flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>

                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    className="relative text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#ff4b4b] border-2 border-white text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">{unreadCount}</span>
                                    )}
                                </button>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                        <div className="absolute right-0 top-10 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                                <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline focus:outline-none">Mark all read</button>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {notifications.length > 0 ? notifications.slice(0, 5).map(notif => (
                                                    <div key={notif.id} onClick={() => { if (!notif.is_read) api.post(`/admin/notifications/${notif.id}/read`).then(() => queryClient.invalidateQueries(['notifications'])) }} className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer ${notif.is_read ? 'opacity-60' : ''}`}>
                                                        <p className="text-sm text-gray-800 font-medium">{notif.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                    </div>
                                                )) : (
                                                    <div className="px-4 py-6 text-center text-gray-500 text-sm">No new notifications</div>
                                                )}
                                            </div>
                                            <div className="px-4 py-2 text-center border-t border-gray-50">
                                                <button onClick={() => { navigate('/admin/notifications'); setIsNotificationsOpen(false); }} className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none">View All</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600" onClick={toggleFullScreen}>
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative pl-2 border-l border-gray-200 ml-2 h-10 flex items-center">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center focus:outline-none"
                            >
                                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-9 h-9 rounded-full border-2 border-[#5e5ce6] hover:border-indigo-400 transition-colors" />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                                            </div>
                                            <div className="text-left hidden md:block">
                                                <p className="text-sm font-bold text-gray-900">Admin User</p>
                                                <p className="text-xs text-gray-500">Super Admin</p>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#f4f7fb] p-6 scrollbar-hide">
                    <Outlet />
                </main>
            </div>

            {/* Custom CSS to hide scrollbars globally for a cleaner look if desired */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
