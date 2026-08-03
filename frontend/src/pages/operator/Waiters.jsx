import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
    Users, UserCheck, Bell, ClipboardList, Wallet, 
    ChevronRight, Plus, Search, Filter, RotateCcw, Eye, 
    MoreVertical, X, Phone, Mail, MapPin, Clock, Calendar, Star,
    ChevronLeft, ChevronDown, Power
} from 'lucide-react';
import { Modal, Input } from '../../components/ui';

const Waiters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedAvailability, setSelectedAvailability] = useState('All');
    const [selectedSection, setSelectedSection] = useState('All Sections');
    const [selectedWaiter, setSelectedWaiter] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [isAddWaiterModalOpen, setIsAddWaiterModalOpen] = useState(false);
    const [isEditWaiterModalOpen, setIsEditWaiterModalOpen] = useState(false);
    const [editingWaiterData, setEditingWaiterData] = useState(null);
    const [newWaiterData, setNewWaiterData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        employee_code: '',
        password: '',
        role_id: 2, // Waiter
        is_active: true
    });

    const { data: employeesData, isLoading: employeesLoading } = useQuery({
        queryKey: ['adminEmployees'],
        queryFn: async () => {
            const res = await api.get('/admin/employees', { params: { page: 1, page_size: 100 } });
            return res.data.data || [];
        }
    });

    const { data: nextCodeResponse } = useQuery({
        queryKey: ['nextEmployeeCode', 2],
        queryFn: async () => {
            const res = await api.get('/admin/employees/next-code', { params: { role_id: 2 } });
            return res.data;
        },
        enabled: isAddWaiterModalOpen
    });
    const nextCode = nextCodeResponse?.data || '';

    const queryClient = useQueryClient();

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

    useEffect(() => {
        if (nextCode && !newWaiterData.employee_code) {
            setNewWaiterData(prev => ({ ...prev, employee_code: nextCode }));
        }
    }, [nextCode, newWaiterData.employee_code]);

    const addWaiterMutation = useMutation({
        mutationFn: async (newWaiter) => {
            const response = await api.post('/admin/employees/', newWaiter);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Waiter added successfully');
            queryClient.invalidateQueries(['adminEmployees']);
            setIsAddWaiterModalOpen(false);
            setNewWaiterData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                employee_code: '',
                password: '',
                role_id: 2,
                is_active: true
            });
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to add waiter';
            toast.error(message);
        }
    });

    const updateWaiterMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.put(`/admin/employees/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success('Waiter updated successfully');
            queryClient.invalidateQueries(['adminEmployees']);
            setIsEditWaiterModalOpen(false);
            setEditingWaiterData(null);
            if (selectedWaiter && selectedWaiter.id === variables.id) {
                // Update the side panel if it's open
                const updated = { ...selectedWaiter, ...variables.data };
                if (variables.data.is_active === false) {
                    setSelectedWaiter(null); // Close panel if deactivated
                } else {
                    setSelectedWaiter(updated);
                }
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update waiter';
            toast.error(message);
        }
    });

    const handleEditWaiterChange = (e) => {
        let { name, value } = e.target;
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'first_name' || name === 'last_name') {
            value = value.replace(/[^A-Za-z\s]/g, '');
        }
        setEditingWaiterData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditWaiterSubmit = (e) => {
        e.preventDefault();
        if (!editingWaiterData) return;
        const payload = { ...editingWaiterData };
        if (!payload.password) delete payload.password; // Don't send empty password
        updateWaiterMutation.mutate({ id: editingWaiterData.id, data: payload });
    };

    const handleAddWaiterChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'first_name' || name === 'last_name') {
            value = value.replace(/[^A-Za-z\s]/g, '');
        }

        setNewWaiterData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddWaiterSubmit = (e) => {
        e.preventDefault();
        addWaiterMutation.mutate(newWaiterData);
    };

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

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    // Update current page if filtered results change and page goes out of bounds
    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filteredWaiters.length / rowsPerPage));
        if (currentPage > maxPage) {
            setCurrentPage(1);
        }
    }, [filteredWaiters.length, rowsPerPage, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredWaiters.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredWaiters.length);
    const paginatedWaiters = filteredWaiters.slice(startIndex, endIndex);

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
                            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl md:rounded-2xl text-[13px] font-bold text-gray-700 dark:text-slate-300 w-full min-h-[44px] overflow-hidden">
                                <input 
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent border-none outline-none w-full h-full px-4 text-center cursor-pointer"
                                />
                            </div>
                            <button 
                                onClick={() => setIsAddWaiterModalOpen(true)}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-2xl text-[13px] font-bold flex items-center justify-center shadow-sm transition-colors w-full min-h-[44px]"
                            >
                                <Plus size={16} className="mr-1.5" /> Add Waiter
                            </button>
                        </div>
                    </div>

                    {/* Filters & Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                        {/* Filters */}
                        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search waiter by name, phone or ID..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full pb-2">
                                <div className={`flex-col md:flex-row md:items-center gap-3 w-full ${showMobileFilters ? 'flex' : 'hidden md:flex'}`}>
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
                                </div>
                                <div className="flex items-end h-full pt-4 shrink-0 md:ml-auto">
                                    <button 
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                        className="md:hidden flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-[13px] font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 mr-2"
                                    >
                                        <Filter size={14} className="mr-1.5" /> Filters
                                    </button>
                                    <button 
                                        onClick={() => queryClient.invalidateQueries(['adminEmployees'])}
                                        className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse hidden md:table">
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
                                    {paginatedWaiters.length > 0 ? paginatedWaiters.map((waiter) => (
                                        <tr 
                                            key={waiter.id} 
                                            onClick={() => setSelectedWaiter(waiter)}
                                            className={`border-b border-gray-50 dark:border-slate-800/50 cursor-pointer transition-colors ${selectedWaiter?.id === waiter.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
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
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedWaiter(waiter); }}
                                                        className="p-1.5 text-indigo-500 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if(window.confirm(`Are you sure you want to deactivate ${waiter.first_name}?`)) {
                                                                updateWaiterMutation.mutate({ id: waiter.id, data: { ...waiter, is_active: false } });
                                                            }
                                                        }}
                                                        className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition-colors"
                                                        title="Deactivate Waiter"
                                                    >
                                                        <Power size={16} />
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
                            
                            {/* Mobile Card Layout */}
                            <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800">
                                {paginatedWaiters.length > 0 ? paginatedWaiters.map((waiter) => (
                                    <div 
                                        key={waiter.id}
                                        onClick={() => setSelectedWaiter(waiter)}
                                        className="p-4 flex flex-col space-y-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 active:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-3">
                                                <img src={waiter.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700" />
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-gray-900 dark:text-white">{waiter.first_name} {waiter.last_name}</h4>
                                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">{waiter.employee_code || `WT00${waiter.id}`}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(waiter.status)}`}>
                                                    {waiter.status}
                                                </span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if(window.confirm(`Are you sure you want to deactivate ${waiter.first_name}?`)) {
                                                            updateWaiterMutation.mutate({ id: waiter.id, data: { ...waiter, is_active: false } });
                                                        }
                                                    }}
                                                    className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition-colors"
                                                >
                                                    <Power size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700/50">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">Tables</p>
                                                <p className="text-[12px] font-black text-gray-900 dark:text-white truncate">{waiter.currentTables}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700/50">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">Sales</p>
                                                <p className="text-[12px] font-black text-gray-900 dark:text-white truncate">₹ {waiter.salesToday > 0 ? waiter.salesToday.toLocaleString() : '0.00'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-[13px] text-gray-500 dark:text-slate-400 font-medium">
                                        No waiters found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination Area */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-b-2xl">
                            <span className="text-[12px] font-semibold text-gray-500 dark:text-slate-400">
                                Showing {filteredWaiters.length > 0 ? startIndex + 1 : 0} to {endIndex} of {filteredWaiters.length} waiters
                            </span>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft size={16}/>
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                                                currentPage === i + 1 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight size={16}/>
                                    </button>
                                </div>
                                <div className="flex items-center text-[12px] font-semibold text-gray-500 dark:text-slate-400">
                                    Rows per page: 
                                    <select 
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="ml-2 bg-transparent font-bold text-gray-700 dark:text-slate-300 outline-none"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
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
                            <button onClick={() => setSelectedWaiter(null)} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 p-1.5 rounded-lg transition-colors">
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
                                    <Phone size={16} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Phone</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.phone || '-'}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <Mail size={16} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Email</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right truncate">{selectedWaiter.email}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <MapPin size={16} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Section</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.section}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <Clock size={16} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Shift</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.shift}</span>
                                </div>
                                <div className="flex items-center text-[13px]">
                                    <Calendar size={16} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                                    <span className="font-semibold text-gray-500 dark:text-slate-400 w-24">Joined On</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex-1 text-right">{selectedWaiter.joinedOn}</span>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-slate-800" />

                            {/* Current Assignment */}
                            <div>
                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">Current Assignment</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start text-[13px]">
                                        <span className="font-semibold text-gray-500 dark:text-slate-400 flex-1 flex items-center pt-1 shrink-0">
                                            <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded mr-2 flex items-center justify-center"><ClipboardList size={10} className="text-gray-500 dark:text-slate-400"/></div>
                                            Table(s)
                                        </span>
                                        <div className="flex flex-wrap gap-1.5 flex-1 justify-end ml-4">
                                            {selectedWaiter.currentTables && selectedWaiter.currentTables !== '-' 
                                                ? selectedWaiter.currentTables.split(',').map((t, i) => (
                                                    <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded text-[11px] border border-indigo-100 dark:border-indigo-800">
                                                        {t.trim()}
                                                    </span>
                                                )) 
                                                : <span className="font-bold text-gray-900 dark:text-white">-</span>}
                                        </div>
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
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 shrink-0">
                            <button 
                                onClick={() => {
                                    setEditingWaiterData({ ...selectedWaiter, password: '' });
                                    setIsEditWaiterModalOpen(true);
                                }}
                                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 py-3 rounded-xl text-[13px] font-bold transition-colors"
                            >
                                Edit Profile
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

            {/* Add Waiter Modal */}
            <Modal
                isOpen={isAddWaiterModalOpen}
                onClose={() => setIsAddWaiterModalOpen(false)}
                title="Add New Waiter"
            >
                <form onSubmit={handleAddWaiterSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Employee Code"
                            name="employee_code"
                            value={newWaiterData.employee_code}
                            placeholder="Auto-generated"
                            readOnly
                            disabled
                        />
                        <Input
                            label="First Name"
                            name="first_name"
                            value={newWaiterData.first_name}
                            onChange={handleAddWaiterChange}
                            placeholder="First Name"
                            required
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            value={newWaiterData.last_name}
                            onChange={handleAddWaiterChange}
                            placeholder="Last Name"
                            required
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={newWaiterData.phone}
                            onChange={handleAddWaiterChange}
                            placeholder="10-digit number"
                            pattern="[0-9]*"
                            maxLength="10"
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={newWaiterData.email}
                            onChange={handleAddWaiterChange}
                            placeholder="email@example.com"
                            required
                            autoComplete="new-password"
                        />
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Gender</label>
                            <select
                                name="gender"
                                value={newWaiterData.gender || ''}
                                onChange={handleAddWaiterChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            >
                                <option value="">Select Gender (Optional)</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={newWaiterData.password}
                            onChange={handleAddWaiterChange}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsAddWaiterModalOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addWaiterMutation.isPending}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {addWaiterMutation.isPending ? 'Adding...' : 'Add Waiter'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Waiter Modal */}
            <Modal
                isOpen={isEditWaiterModalOpen}
                onClose={() => {
                    setIsEditWaiterModalOpen(false);
                    setEditingWaiterData(null);
                }}
                title="Edit Waiter Profile"
            >
                {editingWaiterData && (
                    <form onSubmit={handleEditWaiterSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Employee Code"
                                name="employee_code"
                                value={editingWaiterData.employee_code}
                                readOnly
                                disabled
                            />
                            <Input
                                label="First Name"
                                name="first_name"
                                value={editingWaiterData.first_name}
                                onChange={handleEditWaiterChange}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="last_name"
                                value={editingWaiterData.last_name}
                                onChange={handleEditWaiterChange}
                                required
                            />
                            <Input
                                label="Phone Number"
                                name="phone"
                                value={editingWaiterData.phone || ''}
                                onChange={handleEditWaiterChange}
                                pattern="[0-9]*"
                                maxLength="10"
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                value={editingWaiterData.email}
                                onChange={handleEditWaiterChange}
                                required
                            />
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Gender</label>
                                <select
                                    name="gender"
                                    value={editingWaiterData.gender || ''}
                                    onChange={handleEditWaiterChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                >
                                    <option value="">Select Gender (Optional)</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <Input
                                label="New Password (Optional)"
                                type="password"
                                name="password"
                                value={editingWaiterData.password || ''}
                                onChange={handleEditWaiterChange}
                                placeholder="Leave blank to keep current"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditWaiterModalOpen(false);
                                    setEditingWaiterData(null);
                                }}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateWaiterMutation.isPending}
                                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {updateWaiterMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Waiters;
