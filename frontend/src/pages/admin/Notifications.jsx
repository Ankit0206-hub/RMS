import React, { useState } from 'react';
import { 
    Filter, MoreVertical, ShoppingCart, IndianRupee, UserPlus, 
    ClipboardList, CreditCard, Bell, Tag, UserCheck, Settings, 
    AlertCircle, Send, PlusCircle, CheckSquare, Clock, Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('All Notifications');

    const tabs = [
        { name: 'All Notifications', count: null },
        { name: 'Unread', count: 15 },
        { name: 'Orders', count: 6 },
        { name: 'Payments', count: 3 },
        { name: 'System', count: 4 },
        { name: 'Employees', count: 2 },
        { name: 'Promotions', count: 0 },
    ];

    const summaryData = [
        { name: 'Orders', value: 6, color: '#22c55e', percent: '40%' },
        { name: 'Payments', value: 3, color: '#f97316', percent: '20%' },
        { name: 'System', value: 4, color: '#ef4444', percent: '26.7%' },
        { name: 'Employees', value: 2, color: '#3b82f6', percent: '13.3%' },
        { name: 'Promotions', value: 0, color: '#d946ef', percent: '0%' },
    ];

    const notifications = [
        { 
            id: 1, type: 'order', 
            title: 'New Order Received', desc: 'Order #ORD1263 has been placed by Walk-in Customer for Table T-07.', 
            time: '2 min ago', isUnread: true, 
            icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50' 
        },
        { 
            id: 2, type: 'payment', 
            title: 'Payment Received', desc: 'Payment of ₹812.95 received for Order #ORD1260 via UPI.', 
            time: '15 min ago', isUnread: true, 
            icon: <IndianRupee className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' 
        },
        { 
            id: 3, type: 'customer', 
            title: 'New Customer Registered', desc: 'Amit Verma has been added as a new customer.', 
            time: '32 min ago', isUnread: true, 
            icon: <UserPlus className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' 
        },
        { 
            id: 4, type: 'system', 
            title: 'Low Stock Alert', desc: 'Paneer Butter Masala stock is running low. Current stock: 8', 
            time: '1 hour ago', isUnread: true, 
            icon: <ClipboardList className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' 
        },
        { 
            id: 5, type: 'payment_failed', 
            title: 'Payment Failed', desc: 'Payment of ₹690.30 for Order #ORD1156 has failed.', 
            time: '2 hours ago', isUnread: true, 
            icon: <CreditCard className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' 
        },
        { 
            id: 6, type: 'system', 
            title: 'Table Available', desc: 'Table T-03 is now available.', 
            time: '3 hours ago', isUnread: false, 
            icon: <Bell className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' 
        },
        { 
            id: 7, type: 'promotion', 
            title: 'New Offer Created', desc: 'Weekend Special Offer - Get 20% off on all Main Course items.', 
            time: '5 hours ago', isUnread: false, 
            icon: <Tag className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' 
        },
        { 
            id: 8, type: 'employee', 
            title: 'Employee Check-in', desc: 'Priya Singh has checked in at 09:05 AM.', 
            time: 'Yesterday, 9:10 AM', isUnread: false, 
            icon: <UserCheck className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' 
        },
        { 
            id: 9, type: 'system', 
            title: 'System Maintenance Scheduled', desc: 'System maintenance is scheduled on May 22, 2025 from 2:00 AM to 4:00 AM.', 
            time: 'Yesterday, 8:00 AM', isUnread: false, 
            icon: <Settings className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' 
        },
        { 
            id: 10, type: 'system', 
            title: 'High Demand Alert', desc: 'Veg Biryani sales are 30% higher than yesterday.', 
            time: 'May 19, 4:30 PM', isUnread: false, 
            icon: <AlertCircle className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' 
        },
    ];

    const [toggles, setToggles] = useState({
        sound: true,
        email: true,
        push: true
    });

    return (
        <div className="space-y-6 pb-10 font-inter">
            
            {/* Top Navigation & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex space-x-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`pb-4 text-xs font-bold transition-all relative whitespace-nowrap flex items-center ${activeTab === tab.name ? 'text-[#5e5ce6]' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab.name}
                            {tab.count !== null && (
                                <span className="ml-1.5 text-[10px]">({tab.count})</span>
                            )}
                            {activeTab === tab.name && (
                                <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[#5e5ce6] rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
                <button className="flex items-center text-xs font-bold text-gray-700 hover:text-indigo-600 transition-colors">
                    <CheckSquare className="w-4 h-4 mr-1.5 text-gray-400" />
                    Mark all as read
                </button>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Notifications Feed (Span 2) */}
                <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    
                    {/* Feed Header */}
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h2 className="text-sm font-bold text-gray-900">All Notifications</h2>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                Filters
                                <span className="ml-2 text-[9px] text-gray-400">▼</span>
                            </button>
                            <button className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                Newest First
                                <span className="ml-2 text-[9px] text-gray-400">▼</span>
                            </button>
                        </div>
                    </div>

                    {/* Feed List */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex items-start group transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bg} mr-4`}>
                                    {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">{notif.title}</h4>
                                    <p className="text-[11px] font-medium text-gray-600 leading-snug">{notif.desc}</p>
                                </div>
                                <div className="flex items-center shrink-0 space-x-4">
                                    <span className="text-[10px] font-bold text-gray-400">{notif.time}</span>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: notif.isUnread ? '#3b82f6' : '#d1d5db' }}></div>
                                    <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium bg-white">
                        <div>Showing 1 to 10 of 45 notifications</div>
                        <div className="flex items-center space-x-1">
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#5e5ce6] text-white font-bold shadow">1</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">3</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">4</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">5</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Rows per page:</span>
                            <select className="border border-gray-200 rounded-md px-1.5 py-0.5 outline-none font-semibold text-gray-700 text-[11px]">
                                <option>10</option>
                                <option>20</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    
                    {/* Summary Chart */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Notifications Summary</h3>
                        <div className="flex flex-col items-center">
                            <div className="relative w-40 h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={summaryData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                                            {summaryData.filter(d => d.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-gray-900 leading-none">15</span>
                                    <span className="text-[10px] font-bold text-gray-500">Unread</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3 mt-4">
                                {summaryData.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                                        <div className="flex items-center text-gray-600">
                                            <div className="w-2 h-2 rounded-sm mr-2" style={{ backgroundColor: item.color }}></div>
                                            {item.name}
                                        </div>
                                        <div className="text-gray-900">{item.value} <span className="text-gray-400 font-medium">({item.percent})</span></div>
                                    </div>
                                ))}
                            </div>

                            <button className="text-[10px] font-bold text-indigo-600 mt-6 hover:text-indigo-800 transition-colors flex items-center">
                                View All Notifications →
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg hover:bg-indigo-50 transition-colors text-center group">
                                <Send className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-gray-700">Send Announcement</span>
                            </button>
                            <button className="flex flex-col items-center justify-center bg-green-50/50 border border-green-100 p-4 rounded-lg hover:bg-green-50 transition-colors text-center group">
                                <Bell className="w-5 h-5 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-gray-700">Create Notification</span>
                            </button>
                            <button className="flex flex-col items-center justify-center bg-orange-50/50 border border-orange-100 p-4 rounded-lg hover:bg-orange-50 transition-colors text-center group">
                                <Users className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-gray-700">Manage Templates</span>
                            </button>
                            <button className="flex flex-col items-center justify-center bg-blue-50/50 border border-blue-100 p-4 rounded-lg hover:bg-blue-50 transition-colors text-center group">
                                <Clock className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-gray-700">Notification Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Notification Preferences</h3>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-start">
                                    <Bell className="w-4 h-4 text-gray-600 mr-3 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-900 leading-tight">Sound Alerts</p>
                                        <p className="text-[9px] font-medium text-gray-500">Play sound for new notifications</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setToggles({...toggles, sound: !toggles.sound})}
                                    className={`w-9 h-5 rounded-full relative transition-colors ${toggles.sound ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${toggles.sound ? 'left-5' : 'left-0.5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-start">
                                    <div className="w-4 h-4 flex items-center justify-center text-gray-600 mr-3 mt-0.5 shrink-0">@</div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-900 leading-tight">Email Notifications</p>
                                        <p className="text-[9px] font-medium text-gray-500">Receive notifications via email</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setToggles({...toggles, email: !toggles.email})}
                                    className={`w-9 h-5 rounded-full relative transition-colors ${toggles.email ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${toggles.email ? 'left-5' : 'left-0.5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-start">
                                    <div className="w-4 h-4 flex items-center justify-center text-gray-600 mr-3 mt-0.5 shrink-0">📱</div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-900 leading-tight">Push Notifications</p>
                                        <p className="text-[9px] font-medium text-gray-500">Receive push notifications</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setToggles({...toggles, push: !toggles.push})}
                                    className={`w-9 h-5 rounded-full relative transition-colors ${toggles.push ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${toggles.push ? 'left-5' : 'left-0.5'}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors w-full">
                                Manage Preferences
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Notifications;
