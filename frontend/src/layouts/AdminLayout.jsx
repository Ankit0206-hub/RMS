import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    LayoutDashboard, Users, Settings, LogOut, 
    UtensilsCrossed, ClipboardList, Receipt,
    Activity, PieChart, Bell, Menu, ChevronRight, Store, FileText, BellRing, User, Mail, Maximize, Calendar, Plus, MoreVertical, Search, ChevronDown
} from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({'Menu Management': false});
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New Order #1264", subtext: "Table A5 - 2 mins ago" },
        { id: 2, text: "Payment Received", subtext: "Bill #655 paid via UPI - 5 mins ago" }
    ]);

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
        setExpandedMenus(prev => ({...prev, [name]: !prev[name]}));
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
            hasDropdown: true,
            children: [
                { name: 'All Orders', path: '/admin/orders' },
                { name: 'Order Details', path: '/admin/orders/details' },
                { name: 'Order Returns', path: '/admin/orders/returns' }
            ]
        },
        { 
            name: 'Billing & Payments', 
            path: '/admin/billing', 
            icon: Receipt, 
            hasDropdown: true,
            children: [
                { name: 'Billing Overview', path: '/admin/billing' },
                { name: 'Invoices', path: '/admin/billing/invoices' },
                { name: 'Payments', path: '/admin/billing/payments' },
                { name: 'Refunds', path: '/admin/billing/refunds' },
                { name: 'Payment Methods', path: '/admin/billing/methods' },
            ]
        },
        { 
            name: 'Customers', 
            path: '/admin/customers', 
            icon: Users,
            hasDropdown: true,
            children: [
                { name: 'All Customers', path: '/admin/customers' }
            ]
        },
        { 
            name: 'Reports & Analytics', 
            path: '/admin/analytics', 
            icon: PieChart, 
            hasDropdown: true,
            children: [
                { name: 'Overview', path: '/admin/analytics' },
                { name: 'Waiter Performance', path: '/admin/analytics/performance' },
                { name: 'Menu Analytics', path: '/admin/analytics/menu' },
                { name: 'Sales Analytics', path: '/admin/analytics/sales' },
                { name: 'Customer Analytics', path: '/admin/analytics/customer' },
            ]
        },
        { name: 'Notifications', path: '/admin/notifications', icon: BellRing, badge: 15 },
        { name: 'Audit Logs', path: '/admin/logs', icon: FileText },
        { name: 'Settings', path: '/admin/settings', icon: Settings }
    ];

    const getPageTitle = () => {
        if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') return 'Overview';
        // Flatten children to find the exact sub-page title
        let currentItem = navItems.find(item => location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '#' && item.path !== '/admin/dashboard' && item.path !== '/admin/menu'));
        
        if (!currentItem && location.pathname.startsWith('/admin/menu')) {
            currentItem = navItems.find(i => i.name === 'Menu Management');
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
            let childItem = navItems.find(i => i.name === 'Orders')?.children.find(c => c.path === location.pathname);
            if (!childItem && location.pathname.match(/\/admin\/orders\/\d+/)) {
                 childItem = { name: 'Order Details' };
            }
            if (childItem && childItem.name !== 'All Orders') {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin/orders')}>Orders</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">{childItem.name}</span>
                    </>
                );
            }
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Orders</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">All Orders</span>
                </>
            );
        }
        if (location.pathname.startsWith('/admin/billing')) {
            const childItem = navItems.find(i => i.name === 'Billing & Payments')?.children.find(c => c.path === location.pathname);
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
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Customers</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">All Customers</span>
                </>
            );
        }
        if (location.pathname.startsWith('/admin/analytics')) {
            const childItem = navItems.find(i => i.name === 'Reports & Analytics')?.children.find(c => c.path === location.pathname);
            if (childItem && childItem.name !== 'Overview') {
                return (
                    <>
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin/analytics')}>Reports & Analytics</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">{childItem.name}</span>
                    </>
                );
            }
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Reports & Analytics</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Reports & Analytics</span>
                </>
            );
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
        if (location.pathname.startsWith('/admin/logs')) {
            return (
                <>
                    <span className="hover:text-blue-600 cursor-pointer">Audit Logs</span>
                    <ChevronRight className="w-3 h-3 mx-1" />
                    <span className="text-gray-900">Audit Logs</span>
                </>
            );
        }
        return <span className="text-gray-900">{getPageTitle()}</span>;
    };

    return (
        <div className="flex h-screen bg-[#f3f4f9] text-gray-900 font-inter">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-20'} shrink-0 bg-[#293275] text-white flex flex-col transition-all duration-300 relative`}>
                <div className={`h-20 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center px-0'}`}>
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                            <UtensilsCrossed className="w-6 h-6 text-[#6366f1]" />
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <h1 className="text-lg font-bold leading-tight">DineOps</h1>
                                <p className="text-xs text-indigo-200">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    <nav className="space-y-0.5 px-4">
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
                                        title={!isSidebarOpen ? item.name : undefined}
                                        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                            isActive 
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
                                                        className={`flex items-center py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                                                            isChildActive ? 'bg-white/10 text-white relative' : 'text-[#a5a9d6] hover:text-white hover:bg-white/5'
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
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Top Header matching the mockup */}
                <header className="h-24 bg-white flex items-center justify-between px-8 shrink-0 relative z-10 border-b border-gray-100">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-900 transition-colors mr-6"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            {location.pathname === '/admin/dashboard' || location.pathname === '/admin' ? (
                                <>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                        Welcome back, Admin! <span className="ml-2 text-2xl">👋</span>
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">Here's what's happening in your restaurant today.</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {getPageTitle()}
                                    </h2>
                                    <div className="flex items-center text-xs text-gray-500 mt-1.5 font-medium">
                                        <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
                                        <ChevronRight className="w-3 h-3 mx-1" />
                                        {getBreadcrumbs()}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        {/* Date Picker Button */}
                        <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button 
                                    className="relative text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                >
                                    <Bell className="w-6 h-6" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#ff4b4b] border-2 border-white text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">{notifications.length}</span>
                                    )}
                                </button>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                        <div className="absolute right-0 top-10 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                                <button onClick={() => setNotifications([])} className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline focus:outline-none">Mark all read</button>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {notifications.length > 0 ? notifications.map(notif => (
                                                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                                                        <p className="text-sm text-gray-800 font-medium">{notif.text}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{notif.subtext}</p>
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
                                        <div className="px-4 py-2 border-b border-gray-50">
                                            <p className="text-sm font-bold text-gray-900">Admin Owner</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Super Admin</p>
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
