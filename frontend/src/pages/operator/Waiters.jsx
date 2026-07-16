import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Users, UserCheck, Bell, ClipboardList, Wallet, 
    ChevronRight, Plus, Search, Filter, RotateCcw, Eye, 
    MoreVertical, X, Phone, Mail, MapPin, Clock, Calendar, Star,
    ChevronLeft, ChevronDown
} from 'lucide-react';

const Waiters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedAvailability, setSelectedAvailability] = useState('All');
    const [selectedSection, setSelectedSection] = useState('All Sections');
    const [selectedWaiter, setSelectedWaiter] = useState(null);

    const { data: employeesData, isLoading: employeesLoading } = useQuery({
        queryKey: ['adminEmployees'],
        queryFn: async () => {
            const res = await api.get('/admin/employees', { params: { page: 1, page_size: 100 } });
            return res.data.data || [];
        }
    });

    const { data: analyticsResponse } = useQuery({
        queryKey: ['operator-analytics-today'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/dashboard?timeframe=today');
            return res.data;
        }
    });
    const analyticsData = analyticsResponse?.data;

    const { data: tablesData, isLoading: tablesLoading } = useQuery({
        queryKey: ['adminTables'],
        queryFn: async () => {
            const res = await api.get('/admin/tables', { params: { page: 1, page_size: 1000 } });
            return res.data.data || [];
        }
    });

    // Process Waiters Data
    const waiters = useMemo(() => {
        if (!employeesData) return [];
        
        // Filter out only waiters and add mock/calculated fields
        return employeesData
            .filter(e => e.role_name?.toLowerCase() === 'waiter' || e.role_id === 2 || e.role_id === 3) 
            .map(e => {
                const assignedTables = (tablesData || []).filter(t => t.assigned_waiter_id === e.id);
                const isServing = assignedTables.length > 0;
                
                // Real data if available in analytics top waiters, else 0
                const waiterAnalytics = (analyticsData?.top_waiters || []).find(tw => tw.id === e.id);
                const sales = waiterAnalytics ? waiterAnalytics.sales : 0;
                
                let status = isServing ? 'Serving' : 'Available';
                if (!e.is_active) status = 'Offline';

                const sections = ['Main Hall', 'Garden Area', 'Terrace'];
                const mockSection = sections[e.id % sections.length];

                return {
                    ...e,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(e.first_name + ' ' + e.last_name)}&background=random`,
                    status,
                    section: mockSection,
                    currentTables: assignedTables.map(t => t.table_number).join(', ') || '-',
                    ordersToday: isServing ? assignedTables.length : 0, // proxy for orders today
                    salesToday: sales,
                    rating: '5.0',
                    tips: 0,
                    shift: '10:00 AM - 06:00 PM',
                    joinedOn: e.created_at ? new Date(e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Mar 2024'
                };
            });
    }, [employeesData, tablesData, analyticsData]);

    const filteredWaiters = useMemo(() => {
        return waiters.filter(w => {
            const matchesSearch = (w.first_name + ' ' + w.last_name).toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (w.employee_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (w.phone || '').includes(searchTerm);
            
            const matchesStatus = selectedStatus === 'All Status' || w.status === selectedStatus;
            const matchesAvailability = selectedAvailability === 'All' || 
                (selectedAvailability === 'Serving' && w.status === 'Serving') ||
                (selectedAvailability === 'Available' && w.status === 'Available');
            const matchesSection = selectedSection === 'All Sections' || w.section === selectedSection;

            return matchesSearch && matchesStatus && matchesAvailability && matchesSection;
        });
    }, [waiters, searchTerm, selectedStatus, selectedAvailability, selectedSection]);

    // KPIs
    const totalWaiters = waiters.length;
    const activeWaiters = waiters.filter(w => w.status !== 'Offline').length;
    const inactiveWaiters = totalWaiters - activeWaiters;
    
    const availableWaiters = waiters.filter(w => w.status === 'Available').length;
    const availablePct = totalWaiters > 0 ? Math.round((availableWaiters / totalWaiters) * 100) : 0;
    
    const servingWaiters = waiters.filter(w => w.status === 'Serving').length;
    const servingPct = totalWaiters > 0 ? Math.round((servingWaiters / totalWaiters) * 100) : 0;

    const totalOrders = analyticsData?.today_summary?.today_orders || 0;
    const totalSales = analyticsData?.today_summary?.today_revenue || 0;
    const salesGrowth = analyticsData?.sales_summary?.growth || 0;
    const isGrowthPositive = salesGrowth >= 0;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Serving': return 'bg-emerald-50 text-emerald-600';
            case 'Available': return 'bg-blue-50 text-blue-600';
            case 'Break': return 'bg-orange-50 text-orange-500';
            case 'Offline': return 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400';
            default: return 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400';
        }
    };

    if (employeesLoading || tablesLoading) {
        return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Loading Waiters...</div>;
    }

    return (
        <div className="font-inter min-h-[calc(100vh-64px)] md:-m-8 flex flex-col">
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedWaiter ? 'lg:mr-[380px]' : ''}`}>
                <div className="flex-1 p-4 md:p-8 space-y-4">
                    {/* Header Section Removed */}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center">
                            <div className="p-2.5 md:p-3 bg-indigo-50 rounded-lg md:rounded-xl text-indigo-600 mb-2 md:mb-0 md:mr-4 shrink-0"><Users size={20} className="md:w-5 md:h-5"/></div>
                            <div className="flex-1 min-w-0 w-full">
                                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-0.5 md:mb-1 truncate">Total Waiters</p>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{totalWaiters}</h3>
                                <p className="text-[9px] md:text-[10px] font-semibold text-gray-500 dark:text-slate-400 truncate">
                                    Active: <span className="text-emerald-500">{activeWaiters}</span> <span className="hidden sm:inline">• Inactive: <span className="text-red-500">{inactiveWaiters}</span></span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center">
                            <div className="p-2.5 md:p-3 bg-emerald-50 rounded-lg md:rounded-xl text-emerald-600 mb-2 md:mb-0 md:mr-4 shrink-0"><UserCheck size={20} className="md:w-5 md:h-5"/></div>
                            <div className="flex-1 min-w-0 w-full">
                                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-0.5 md:mb-1 truncate">Available</p>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{availableWaiters}</h3>
                                <p className="text-[9px] md:text-[10px] font-semibold text-gray-500 dark:text-slate-400 truncate">{availablePct}% of total</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center">
                            <div className="p-2.5 md:p-3 bg-blue-50 rounded-lg md:rounded-xl text-blue-500 mb-2 md:mb-0 md:mr-4 shrink-0"><ClipboardList size={20} className="md:w-5 md:h-5"/></div>
                            <div className="flex-1 min-w-0 w-full">
                                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-0.5 md:mb-1 truncate">Today's Orders</p>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{totalOrders}</h3>
                                <p className="text-[9px] md:text-[10px] font-semibold text-gray-500 dark:text-slate-400 truncate">Handled by waiters</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 md:gap-4 h-full">
                            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl md:rounded-2xl text-[13px] font-bold text-gray-700 dark:text-slate-300 w-full min-h-[44px]">
                                <Calendar size={14} className="mr-2 text-indigo-600" />
                                May 20, 2025
                                <ChevronDown size={14} className="ml-2 text-gray-400" />
                            </div>
                            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-2xl text-[13px] font-bold flex items-center justify-center shadow-sm transition-colors w-full min-h-[44px]">
                                <Plus size={16} className="mr-1.5" /> Add Waiter
                            </button>
                        </div>
                    </div>

                    {/* Filters & Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                        {/* Filters */}
                        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search waiter by name, phone or ID..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 scrollbar-hide">
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1 ml-1">Status</span>
                                    <select 
                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-slate-300 outline-none"
                                        value={selectedStatus}
                                        onChange={e => setSelectedStatus(e.target.value)}
                                    >
                                        <option>All Status</option>
                                        <option>Serving</option>
                                        <option>Available</option>
                                        <option>Break</option>
                                        <option>Offline</option>
                                    </select>
                                </div>
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1 ml-1">Availability</span>
                                    <select 
                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-slate-300 outline-none"
                                        value={selectedAvailability}
                                        onChange={e => setSelectedAvailability(e.target.value)}
                                    >
                                        <option>All</option>
                                        <option>Serving</option>
                                        <option>Available</option>
                                    </select>
                                </div>
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1 ml-1">Section</span>
                                    <select 
                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-slate-300 outline-none"
                                        value={selectedSection}
                                        onChange={e => setSelectedSection(e.target.value)}
                                    >
                                        <option>All Sections</option>
                                        <option>Main Hall</option>
                                        <option>Garden Area</option>
                                        <option>Terrace</option>
                                    </select>
                                </div>
                                <div className="flex items-end h-full pt-4 shrink-0">
                                    <button className="flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-[13px] font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 mr-2">
                                        <Filter size={14} className="mr-1.5" /> Filters
                                    </button>
                                    <button className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50">
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800">
                                        <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Waiter</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee ID</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Section</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Current Table(s)</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Orders Today</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Sales Today</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWaiters.length > 0 ? filteredWaiters.map((waiter) => (
                                        <tr 
                                            key={waiter.id} 
                                            onClick={() => setSelectedWaiter(waiter)}
                                            className={`border-b border-gray-50 dark:border-slate-800/50 cursor-pointer transition-colors ${selectedWaiter?.id === waiter.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
                                        >
                                            <td className="py-3 px-6">
                                                <div className="flex items-center">
                                                    <img src={waiter.avatar} alt="Avatar" className="w-9 h-9 rounded-full mr-3 border border-gray-200 dark:border-slate-700" />
                                                    <span className="text-[13px] font-bold text-gray-900 dark:text-white">{waiter.first_name} {waiter.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-[13px] font-semibold text-gray-600 dark:text-slate-400">{waiter.employee_code || `WT00${waiter.id}`}</td>
                                            <td className="py-3 px-4 text-[13px] font-medium text-gray-600 dark:text-slate-400">{waiter.phone || '-'}</td>
                                            <td className="py-3 px-4 text-[13px] font-medium text-gray-600 dark:text-slate-400">{waiter.section}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(waiter.status)}`}>
                                                    {waiter.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[13px] font-bold text-gray-700 dark:text-slate-300">{waiter.currentTables}</td>
                                            <td className="py-3 px-4 text-[13px] font-bold text-gray-700 dark:text-slate-300 text-center">{waiter.ordersToday}</td>
                                            <td className="py-3 px-4 text-[13px] font-bold text-gray-900 dark:text-white text-right">
                                                ₹ {waiter.salesToday > 0 ? waiter.salesToday.toLocaleString() : '0.00'}
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button className="p-1.5 text-indigo-500 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="py-8 text-center text-[13px] text-gray-500 dark:text-slate-400 font-medium">
                                                No waiters found matching the criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-b-2xl">
                            <span className="text-[12px] font-semibold text-gray-500 dark:text-slate-400">
                                Showing 1 to {Math.min(10, filteredWaiters.length)} of {filteredWaiters.length} waiters
                            </span>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <button className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"><ChevronLeft size={16}/></button>
                                    <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-[13px] font-bold">1</button>
                                    <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-[13px] font-bold hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50">2</button>
                                    <button className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"><ChevronRight size={16}/></button>
                                </div>
                                <div className="flex items-center text-[12px] font-semibold text-gray-500 dark:text-slate-400">
                                    Rows per page: 
                                    <select className="ml-2 bg-transparent font-bold text-gray-700 dark:text-slate-300 outline-none">
                                        <option>10</option>
                                        <option>20</option>
                                        <option>50</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Slide-over Panel (Waiter Details) */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 ${selectedWaiter ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedWaiter && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Waiter Details</h2>
                            <button onClick={() => setSelectedWaiter(null)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center">
                                <img src={selectedWaiter.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-indigo-50 shadow-sm mr-4" />
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                                        {selectedWaiter.first_name} {selectedWaiter.last_name}
                                        <span className={`ml-3 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(selectedWaiter.status)}`}>
                                            {selectedWaiter.status}
                                        </span>
                                    </h3>
                                    <p className="text-[12px] font-semibold text-gray-500 dark:text-slate-400 mt-1">Waiter ID: {selectedWaiter.employee_code || `WT00${selectedWaiter.id}`}</p>
                                </div>
                            </div>

                            {/* Contact & Info */}
                            <div className="space-y-4">
                                <div className="flex items-center text-[13px]">
                                    <Phone size={16} className="text-gray-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Phone</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.phone || '-'}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <Mail size={16} className="text-gray-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Email</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right truncate">{selectedWaiter.email}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <MapPin size={16} className="text-gray-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Section</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.section}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <Clock size={16} className="text-gray-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Shift</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.shift}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <Calendar size={16} className="text-gray-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Joined On</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.joinedOn}</span>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-slate-800" />

                            {/* Current Assignment */}
                            <div>
                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">Current Assignment</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center text-[13px]">
                                        <span className="font-semibold text-gray-500 dark:text-slate-400 flex-1 flex items-center">
                                            <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded mr-2 flex items-center justify-center"><ClipboardList size={10} className="text-gray-500 dark:text-slate-400"/></div>
                                            Table(s)
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">{selectedWaiter.currentTables}</span>
                                    </div>
                                    <div className="flex items-center text-[13px]">
                                        <span className="font-semibold text-gray-500 dark:text-slate-400 flex-1 flex items-center">
                                            <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded mr-2 flex items-center justify-center"><Users size={10} className="text-gray-500 dark:text-slate-400"/></div>
                                            Guests
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">{selectedWaiter.currentTables !== '-' ? '6 + 4' : '-'}</span>
                                    </div>
                                    <div className="flex items-center text-[13px]">
                                        <span className="font-semibold text-gray-500 dark:text-slate-400 flex-1 flex items-center">
                                            <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded mr-2 flex items-center justify-center"><Clock size={10} className="text-gray-500 dark:text-slate-400"/></div>
                                            Assigned At
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">{selectedWaiter.currentTables !== '-' ? '10:05 AM' : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-slate-800" />

                            {/* Today's Performance */}
                            <div>
                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">Today's Performance</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-gray-100 dark:border-slate-800">
                                        <h5 className="text-[15px] font-black text-gray-900 dark:text-white">{selectedWaiter.ordersToday}</h5>
                                        <p className="text-[9px] font-semibold text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Orders</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-gray-100 dark:border-slate-800">
                                        <h5 className="text-[14px] font-black text-gray-900 dark:text-white">₹ {selectedWaiter.salesToday > 1000 ? (selectedWaiter.salesToday/1000).toFixed(1)+'k' : selectedWaiter.salesToday}</h5>
                                        <p className="text-[9px] font-semibold text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Sales</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                                        <div className="flex items-center justify-center text-[13px] font-black text-gray-900 dark:text-white">
                                            {selectedWaiter.rating} <Star size={10} className="ml-0.5 text-yellow-400 fill-current" />
                                        </div>
                                        <p className="text-[9px] font-semibold text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Rating</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-gray-100 dark:border-slate-800">
                                        <h5 className="text-[15px] font-black text-gray-900 dark:text-white">{selectedWaiter.tips}</h5>
                                        <p className="text-[9px] font-semibold text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Tips</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/50 shrink-0">
                            <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 py-3 rounded-xl text-[13px] font-bold transition-colors">
                                View Full Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Overlay for mobile (optional) */}
            {selectedWaiter && (
                <div 
                    className="fixed inset-0 bg-gray-900/10 z-10 lg:hidden"
                    onClick={() => setSelectedWaiter(null)}
                />
            )}
        </div>
    );
};

export default Waiters;
