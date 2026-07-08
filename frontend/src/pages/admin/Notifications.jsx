import React, { useState } from 'react';
import { 
    Filter, MoreVertical, ShoppingCart, IndianRupee, UserPlus, 
    ClipboardList, CreditCard, Bell, Tag, UserCheck, Settings, 
    AlertCircle, Send, PlusCircle, CheckSquare, Clock, Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Pagination } from '../../components/ui';

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('All Notifications');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const queryClient = useQueryClient();

    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/admin/notifications');
            return res.data.data;
        },
        refetchInterval: 30000
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await api.post('/admin/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            await api.post(`/admin/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });





    const getIconInfo = (type) => {
        switch (type?.toLowerCase()) {
            case 'order': return { icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50' };
            case 'payment': return { icon: <IndianRupee className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' };
            case 'payment_failed': return { icon: <CreditCard className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' };
            case 'customer': return { icon: <UserPlus className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' };
            case 'system': return { icon: <ClipboardList className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' };
            case 'promotion': return { icon: <Tag className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' };
            case 'employee': return { icon: <UserCheck className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' };
            default: return { icon: <Bell className="w-5 h-5 text-gray-500" />, bg: 'bg-gray-50' };
        }
    };

    const notifications = (notificationsData || []).map(n => {
        // Simple relative time approximation
        const diff = new Date() - new Date(n.created_at);
        const mins = Math.floor(diff / 60000);
        const time = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins/60)} hours ago` : `${Math.floor(mins/1440)} days ago`;

        return {
            ...n,
            desc: n.message,
            time,
            isUnread: !n.is_read,
            ...getIconInfo(n.notification_type)
        };
    });

    const orderCount = notifications.filter(n => n.notification_type === 'order').length;
    const paymentCount = notifications.filter(n => n.notification_type === 'payment' || n.notification_type === 'payment_failed').length;
    const systemCount = notifications.filter(n => n.notification_type === 'system').length;
    const employeeCount = notifications.filter(n => n.notification_type === 'employee').length;
    const promotionCount = notifications.filter(n => n.notification_type === 'promotion').length;
    
    const unreadCount = notifications.filter(n => n.isUnread).length;
    const totalCount = orderCount + paymentCount + systemCount + employeeCount + promotionCount || 1;

    const summaryData = [
        { name: 'Orders', value: orderCount, color: '#22c55e', percent: `${Math.round((orderCount/totalCount)*100)}%` },
        { name: 'Payments', value: paymentCount, color: '#f97316', percent: `${Math.round((paymentCount/totalCount)*100)}%` },
        { name: 'System', value: systemCount, color: '#ef4444', percent: `${Math.round((systemCount/totalCount)*100)}%` },
        { name: 'Employees', value: employeeCount, color: '#3b82f6', percent: `${Math.round((employeeCount/totalCount)*100)}%` },
        { name: 'Promotions', value: promotionCount, color: '#d946ef', percent: `${Math.round((promotionCount/totalCount)*100)}%` },
    ];

    const tabs = [
        { name: 'All Notifications', count: null },
        { name: 'Unread', count: unreadCount },
        { name: 'Orders', count: orderCount },
        { name: 'Payments', count: paymentCount },
        { name: 'System', count: systemCount },
        { name: 'Employees', count: employeeCount },
        { name: 'Promotions', count: promotionCount },
    ];

    const [toggles, setToggles] = useState({
        sound: true,
        email: true,
        push: true
    });

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'All Notifications') return true;
        if (activeTab === 'Unread') return notif.isUnread;
        if (activeTab === 'Orders') return notif.notification_type === 'order';
        if (activeTab === 'Payments') return notif.notification_type === 'payment' || notif.notification_type === 'payment_failed';
        if (activeTab === 'System') return notif.notification_type === 'system';
        if (activeTab === 'Employees') return notif.notification_type === 'employee';
        if (activeTab === 'Promotions') return notif.notification_type === 'promotion';
        return true;
    });

    return (
        <div className="space-y-6 pb-10 font-inter">
            
            {/* Top Navigation & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.name}
                            onClick={() => { setActiveTab(tab.name); setCurrentPage(1); }}
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
                    <button 
                        onClick={() => markAllReadMutation.mutate()}
                        className="flex items-center text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm"
                    >
                        <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                        Mark all as read
                    </button>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Feed (Span 2) */}
                <div className="lg:col-span-2 flex flex-col bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden min-h-[500px]">
                    
                    {/* Feed Header */}
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h2 className="text-sm font-bold text-gray-900">{activeTab}</h2>
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
                        {filteredNotifications.length > 0 ? filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((notif) => (
                            <div 
                                key={notif.id} 
                                onClick={() => { if(notif.isUnread) markReadMutation.mutate(notif.id) }} 
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 flex items-start group transition-colors cursor-pointer ${!notif.isUnread ? 'opacity-70' : ''}`}
                            >
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
                        )) : (
                            <div className="p-10 text-center text-gray-400 text-xs font-bold">No notifications found for this category.</div>
                        )}
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredNotifications.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                        itemName="notifications"
                    />
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
                                    <span className="text-xl font-black text-gray-900 leading-none">{unreadCount}</span>
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
