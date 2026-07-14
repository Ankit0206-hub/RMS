import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ChevronRight, Maximize, ZoomIn, ZoomOut, Plus, RefreshCcw, Map } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const FloorPlan = () => {
    const [activeSection, setActiveSection] = useState('Main Hall');
    const [zoom, setZoom] = useState(100);

    const { data: tablesResponse, isLoading } = useQuery({
        queryKey: ['operator-tables'],
        queryFn: async () => {
            const res = await api.get('/admin/tables', { params: { page: 1, page_size: 1000 } });
            return res.data;
        }
    });

    const { data: analyticsResponse } = useQuery({
        queryKey: ['operator-analytics-today'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/dashboard?timeframe=today');
            return res.data;
        }
    });

    const tables = tablesResponse?.data || [];
    const analyticsData = analyticsResponse?.data;

    const sections = [
        { name: 'Main Hall', tables: tables.filter(t => !t.floor || t.floor === 'Main Hall').length },
        { name: 'Garden Area', tables: tables.filter(t => t.floor === 'Garden Area').length },
        { name: 'Terrace', tables: tables.filter(t => t.floor === 'Terrace').length },
        { name: 'VIP Room', tables: tables.filter(t => t.floor === 'VIP Room').length }
    ];

    const currentTables = tables.filter(t => (t.floor || 'Main Hall') === activeSection);

    const available = tables.filter(t => t.status === 'Available').length;
    const occupied = tables.filter(t => t.status === 'Occupied').length;
    const reserved = tables.filter(t => t.status === 'Reserved').length;
    const cleaning = tables.filter(t => t.status === 'Cleaning').length;
    const outOfService = tables.filter(t => t.status === 'Out of Service' || t.status === 'Out of Order').length;
    const totalTables = tables.length;
    const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

    const pieData = [
        { name: 'Available', value: available, color: '#10b981' },
        { name: 'Occupied', value: occupied, color: '#f97316' },
        { name: 'Reserved', value: reserved, color: '#6366f1' },
        { name: 'Cleaning', value: cleaning, color: '#3b82f6' },
        { name: 'Out of Service', value: outOfService, color: '#9ca3af' }
    ].filter(d => d.value > 0);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Available': return { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' };
            case 'Occupied': return { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' };
            case 'Reserved': return { border: 'border-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-700' };
            case 'Cleaning': return { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' };
            default: return { border: 'border-gray-400', bg: 'bg-gray-50 dark:bg-slate-800/50', text: 'text-gray-700 dark:text-slate-300' };
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Loading Floor Plan...</div>;

    return (
        <div className="flex h-full font-inter overflow-hidden">
            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center text-[13px] font-medium text-gray-500 dark:text-slate-400 mb-2">
                            <span>Dashboard</span>
                            <ChevronRight size={14} className="mx-1" />
                            <span>Restaurant</span>
                            <ChevronRight size={14} className="mx-1" />
                            <span className="text-gray-900 dark:text-white font-bold">Floor Plan</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Restaurant / Floor Plan</h2>
                    </div>
                    <div className="flex space-x-3">
                        <button className="bg-white dark:bg-slate-900 border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center hover:bg-indigo-50 transition-colors">
                            <RefreshCcw size={16} className="mr-2" /> Edit Floor Plan
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors">
                            <span className="text-lg mr-1">+</span> Add Section
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                    
                    {/* Left Sidebar: Sections */}
                    <div className="w-full lg:w-[220px] bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm shrink-0 overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Sections</h3>
                            <button className="text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"><Plus size={16}/></button>
                        </div>
                        <div className="p-2 space-y-1">
                            {sections.map(sec => (
                                <button 
                                    key={sec.name}
                                    onClick={() => setActiveSection(sec.name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                                        activeSection === sec.name ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${activeSection === sec.name ? 'bg-indigo-100' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                                            <Maximize size={16} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm leading-tight">{sec.name}</p>
                                            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">{sec.tables} Tables</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className={activeSection === sec.name ? 'text-indigo-500' : 'text-gray-300'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Center: Floor Plan Canvas */}
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
                        {/* Canvas Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50/50 rounded-t-2xl">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>Available</div>
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5"></span>Occupied</div>
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></span>Reserved</div>
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></span>Cleaning</div>
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-1.5"></span>Out of Service</div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <select className="border border-gray-200 dark:border-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 outline-none">
                                    <option>{activeSection}</option>
                                </select>
                                <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                                    <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400"><ZoomOut size={16} /></button>
                                    <span className="text-xs font-bold px-2 text-gray-700 dark:text-slate-300 w-12 text-center">{zoom}%</span>
                                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400"><ZoomIn size={16} /></button>
                                </div>
                                <button className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
                                    <Maximize size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Canvas Area (Blueprint Background) */}
                        <div className="flex-1 overflow-auto bg-slate-50 relative p-8" style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            <div 
                                className="flex flex-wrap gap-8 justify-center items-center h-full transition-transform origin-top-left"
                                style={{ transform: `scale(${zoom / 100})` }}
                            >
                                {currentTables.map((table, idx) => {
                                    const colors = getStatusColor(table.status);
                                    // Generate seats (dots) around the table based on capacity
                                    const seats = Array.from({ length: table.capacity }).map((_, i) => i);
                                    
                                    return (
                                        <div key={table.id} className="relative group cursor-pointer m-4">
                                            {/* Seats top/bottom representation */}
                                            <div className="absolute -top-2 left-0 right-0 flex justify-center gap-2">
                                                {seats.slice(0, Math.ceil(table.capacity / 2)).map(s => (
                                                    <div key={`t-${s}`} className={`w-3 h-3 rounded-full border-2 ${colors.border} bg-white dark:bg-slate-900`}></div>
                                                ))}
                                            </div>
                                            <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2">
                                                {seats.slice(Math.ceil(table.capacity / 2)).map(s => (
                                                    <div key={`b-${s}`} className={`w-3 h-3 rounded-full border-2 ${colors.border} bg-white dark:bg-slate-900`}></div>
                                                ))}
                                            </div>
                                            
                                            {/* Table Body */}
                                            <div className={`w-24 h-16 rounded-xl border-2 ${colors.border} ${colors.bg} flex flex-col items-center justify-center shadow-sm relative z-10 transition-transform group-hover:scale-105`}>
                                                <span className={`font-black text-[15px] ${colors.text}`}>{table.table_number}</span>
                                                <span className={`text-[10px] font-bold ${colors.text} opacity-80`}>{table.capacity} Seats</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {currentTables.length === 0 && (
                                    <div className="text-gray-400 font-bold flex flex-col items-center mt-20">
                                        <Map size={48} className="mb-4 opacity-50" />
                                        <p>No tables configured for this section yet.</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Entrance Label Mock */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
                                <div className="w-16 border-t-2 border-slate-400 mb-1"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Entrance</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Overview */}
                    <div className="w-full lg:w-[260px] flex flex-col gap-6 shrink-0">
                        {/* Floor Plan Overview (Chart) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
                            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] mb-4">Floor Plan Overview</h3>
                            <div className="flex flex-col items-center">
                                <div className="h-32 w-full relative mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData.length > 0 ? pieData : [{name: 'None', value: 1, color: '#e5e7eb'}]}
                                                cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                                                dataKey="value" paddingAngle={2} stroke="none"
                                            >
                                                {(pieData.length > 0 ? pieData : [{name: 'None', value: 1, color: '#e5e7eb'}]).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} Tables`, 'Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full space-y-2">
                                    {pieData.map(data => (
                                        <div key={data.name} className="flex justify-between items-center text-[11px] font-bold">
                                            <div className="flex items-center text-gray-600 dark:text-slate-400">
                                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: data.color }}></span>
                                                {data.name}
                                            </div>
                                            <div className="text-gray-900 dark:text-white">
                                                {data.value} ({totalTables > 0 ? Math.round((data.value/totalTables)*100) : 0}%)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800/50 pb-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Tables</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{totalTables}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800/50 pb-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Capacity</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{totalCapacity} Seats</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800/50 pb-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Occupied</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{totalTables > 0 ? Math.round((occupied/totalTables)*100) : 0}%</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800/50 pb-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Average Party Size</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {analyticsData?.kpis?.total_orders ? (analyticsData.kpis.total_customers / analyticsData.kpis.total_orders).toFixed(1) : '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Today's Orders</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{analyticsData?.today_summary?.today_orders || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FloorPlan;
