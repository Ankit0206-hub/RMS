import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    Search, ChevronDown, ChevronLeft, ChevronRight, 
    Calendar, Users, User, Clock, Star, Leaf, Plus, Unlink
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import ReservationModal from '../../components/ReservationModal';

const OperatorReservations = () => {
    const [leftTab, setLeftTab] = useState('RESERVATION');
    const [selectedTable, setSelectedTable] = useState(null);
    const [tables, setTables] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);

    // Merging states
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [selectedTablesForMerge, setSelectedTablesForMerge] = useState([]);
    const [merging, setMerging] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tablesRes, reservationsRes] = await Promise.all([
                adminApi.getTables(),
                adminApi.getReservations()
            ]);
            setTables(tablesRes.data || []);
            setReservations(reservationsRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Refresh periodically to update statuses based on time
        const interval = setInterval(() => {
            // trigger re-render to recalculate availability
            setReservations(prev => [...prev]); 
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleNewReservation = () => {
        setEditingReservation(null);
        setIsModalOpen(true);
    };

    const handleEditReservation = (res) => {
        setEditingReservation(res);
        setIsModalOpen(true);
    };

    const handleConfirmMerge = async () => {
        if (selectedTablesForMerge.length < 2) {
            toast.error("Select at least 2 tables to merge");
            return;
        }
        setMerging(true);
        try {
            await adminApi.mergeTables(selectedTablesForMerge);
            toast.success("Tables merged successfully");
            setIsMergeMode(false);
            setSelectedTablesForMerge([]);
            fetchData();
        } catch (error) {
            console.error("Merge error:", error);
            toast.error(error.response?.data?.detail || "Failed to merge tables");
        } finally {
            setMerging(false);
        }
    };

    const handleUnmerge = async (e, tableId) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to split this merged table back into its original tables?')) {
            try {
                await adminApi.unmergeTable(tableId);
                toast.success('Table split successfully');
                fetchData();
            } catch (err) {
                toast.error(err.response?.data?.detail || 'Failed to split table');
            }
        }
    };

    // Helper to format time
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Compute active tables
    const currentTime = new Date();
    
    // Sort reservations chronologically
    const sortedReservations = [...reservations].sort((a, b) => new Date(a.reservation_time) - new Date(b.reservation_time));
    
    const seated = [];
    const upcoming = [];
    
    sortedReservations.forEach(res => {
        if (res.status === 'Cancelled' || res.status === 'Completed') return;
        const resTime = new Date(res.reservation_time);
        
        if (res.status === 'Confirmed') {
            if (resTime <= currentTime) {
                seated.push(res);
            } else {
                upcoming.push(res);
            }
        } else if (res.status === 'Pending') {
             upcoming.push(res);
        }
    });

    // Map fetched tables to the floor plan logic
    const floorPlanTables = [
        { id: 'T1', type: 'horizontal', defaultSeats: 4 },
        { id: 'T2', type: 'horizontal', defaultSeats: 4 },
        { id: 'T3', type: 'horizontal', defaultSeats: 4 },
        { id: 'T4', type: 'vertical', defaultSeats: 6 },
        { id: 'T5', type: 'vertical', defaultSeats: 6 },
        { id: 'T12', type: 'square', defaultSeats: 2 },
        { id: 'T6', type: 'square', defaultSeats: 2 },
        { id: 'T7', type: 'square', defaultSeats: 2 },
        { id: 'T8', type: 'square', defaultSeats: 2 },
        { id: 'T9', type: 'horizontal', defaultSeats: 4 },
        { id: 'T10', type: 'horizontal', defaultSeats: 4 },
        { id: 'T11', type: 'horizontal', defaultSeats: 4 },
    ].map(fpt => {
        // Find matching table from DB (robust matching by extracting numbers)
        const dbTable = tables.find(t => {
            const dbNumStr = String(t.table_number).replace(/[^0-9]/g, '');
            const fptNumStr = String(fpt.id).replace(/[^0-9]/g, '');
            return dbNumStr === fptNumStr && dbNumStr !== '';
        });
        const seats = dbTable ? dbTable.capacity : fpt.defaultSeats;
        
        // Check for reservations on this table
        const tableReservations = sortedReservations.filter(r => 
            r.table_id === dbTable?.id && 
            (r.status === 'Confirmed' || r.status === 'Pending')
        );

        let status = dbTable?.status || 'Available';
        if (status === 'Vacant') status = 'Available';
        
        let guest = null;
        let timeStr = null;
        let isAvailableWithFutureRes = false;

        if (status === 'Occupied') {
            // keep occupied
        } else if (tableReservations.length > 0) {
            const nextRes = tableReservations.find(r => new Date(r.reservation_time) > currentTime);
            if (nextRes) {
                const resTime = new Date(nextRes.reservation_time);
                const diffMins = (resTime - currentTime) / 60000;
                
                guest = nextRes.customer_name;
                timeStr = formatTime(nextRes.reservation_time);
                
                if (diffMins <= 15) {
                    status = 'Reserved'; // Within 15 mins, strictly reserved
                } else {
                    status = 'Available'; // Available until 15 mins before
                    isAvailableWithFutureRes = true;
                }
            }
            
            const currentRes = tableReservations.find(r => new Date(r.reservation_time) <= currentTime);
            if (currentRes && status !== 'Reserved') {
                status = 'Occupied';
                guest = currentRes.customer_name;
                timeStr = formatTime(currentRes.reservation_time);
                isAvailableWithFutureRes = false;
            }
        }
        
        if (dbTable?.status === 'Merged') {
            status = 'Merged';
        }

        return {
            ...fpt,
            dbId: dbTable?.id,
            seats,
            status,
            guest,
            time: timeStr,
            isAvailableWithFutureRes,
            isMerged: dbTable?.status === 'Merged'
        };
    }).filter(t => t.dbId !== undefined);
    
    const virtualTables = tables.filter(t => t.is_virtual);

    const getStatusColor = (status, isAvailableWithFutureRes) => {
        if (isAvailableWithFutureRes) {
            return { border: 'bg-green-500', text: 'text-green-600', badge: 'border-amber-400 text-amber-700' };
        }
        switch(status) {
            case 'Occupied': return { border: 'bg-cyan-400', text: 'text-cyan-600', badge: 'border-cyan-300 text-cyan-700' };
            case 'Available': return { border: 'bg-green-500', text: 'text-green-600', badge: 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400' };
            case 'Reserved': return { border: 'bg-amber-400', text: 'text-amber-600', badge: 'border-amber-400 text-amber-700' };
            case 'Merged': return { border: 'bg-gray-200', text: 'text-gray-400', badge: 'border-gray-200 text-gray-400' };
            default: return { border: 'bg-gray-300', text: 'text-gray-500 dark:text-slate-400', badge: 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400' };
        }
    };

    const handleTableClick = (table) => {
        if (table.isMerged) return; // Prevent clicking grayed out merged tables
        
        if (isMergeMode) {
            if (!table.dbId) {
                toast.error(`Table ${table.id} is not configured in the database yet.`);
                return;
            }
            if (table.status !== 'Available') {
                toast.error(`Table ${table.id} is not available.`);
                return;
            }
            setSelectedTablesForMerge(prev => {
                if (prev.includes(table.dbId)) {
                    return prev.filter(id => id !== table.dbId);
                }
                return [...prev, table.dbId];
            });
        } else {
            setSelectedTable(table.id);
            toast(`Table ${table.id} Selected`, { icon: '🍽️' });
        }
    };

    const handleGuestClick = (res) => {
        if (res.table_number) {
            setSelectedTable(res.table_number);
        }
        handleEditReservation(res);
    };

    const renderChairs = (seats, status) => {
        const chairs = [];
        const topSeats = Math.ceil(seats / 2);
        const bottomSeats = Math.floor(seats / 2);
        
        const occupiedSeatsCount = status === 'Occupied' ? Math.max(1, seats - 1) : status === 'Reserved' ? seats : 0;
        let highlightedCount = 0;

        for (let i = 0; i < topSeats; i++) {
            const leftPct = (100 / (topSeats + 1)) * (i + 1);
            const isOccupied = highlightedCount < occupiedSeatsCount;
            if (isOccupied) highlightedCount++;
            const chairColor = (status === 'Reserved' && isOccupied) ? 'bg-amber-400' : (status === 'Occupied' && isOccupied) ? 'bg-cyan-400' : 'bg-gray-200 dark:bg-slate-700';
            
            chairs.push(<div key={`t${i}`} className={`absolute -top-1.5 w-6 h-3 rounded-t-full transition-colors group-hover:opacity-80 ${chairColor}`} style={{ left: `calc(${leftPct}% - 12px)` }}></div>);
        }
        for (let i = 0; i < bottomSeats; i++) {
            const leftPct = (100 / (bottomSeats + 1)) * (i + 1);
            const isOccupied = highlightedCount < occupiedSeatsCount;
            if (isOccupied) highlightedCount++;
            const chairColor = (status === 'Reserved' && isOccupied) ? 'bg-amber-400' : (status === 'Occupied' && isOccupied) ? 'bg-cyan-400' : 'bg-gray-200 dark:bg-slate-700';
            
            chairs.push(<div key={`b${i}`} className={`absolute -bottom-1.5 w-6 h-3 rounded-b-full transition-colors group-hover:opacity-80 ${chairColor}`} style={{ left: `calc(${leftPct}% - 12px)` }}></div>);
        }
        return chairs;
    };

    return (
        <div className="min-h-[90vh] -m-6 flex font-inter shadow-inner">
            <Toaster position="top-right" />
            
            <ReservationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                tables={tables}
                reservation={editingReservation}
            />
            
            {/* ---------------- LEFT SIDEBAR (Reservations List) ---------------- */}
            <div className="w-[300px] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col flex-shrink-0">
                
                {/* Tabs */}
                <div className="flex p-4 pb-0">
                    <button 
                        onClick={() => setLeftTab('RESERVATION')}
                        className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${leftTab === 'RESERVATION' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'}`}
                    >
                        RESERVATION
                    </button>
                    <button 
                        onClick={() => setLeftTab('WAITING')}
                        className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${leftTab === 'WAITING' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'}`}
                    >
                        WAITING
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search Guest"
                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 flex justify-center text-sm text-gray-500">Loading...</div>
                    ) : (
                        <>
                            {/* Seated List */}
                            <div className="px-4 pb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[10px] font-bold text-indigo-500 tracking-wider">SEATED</h3>
                                    <div className="flex items-center text-indigo-500 text-xs font-bold space-x-1">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{seated.length}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {seated.map((guest, idx) => (
                                        <div 
                                            key={guest.id}
                                            onClick={() => handleGuestClick(guest)}
                                            className={`flex items-start justify-between p-2 rounded-lg cursor-pointer transition-colors border ${selectedTable === guest.table?.table_number ? 'bg-indigo-50/50 border-indigo-200' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-right w-14 pt-0.5">
                                                    <div className="text-gray-900 dark:text-white font-bold text-xs">{formatTime(guest.reservation_time)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-900 dark:text-white font-bold text-xs">{guest.customer_name}</div>
                                                    <div className="text-gray-500 dark:text-slate-400 font-medium text-[10px] my-0.5">{guest.contact_number}</div>
                                                    <div className="text-gray-400 font-semibold text-[9px]">{guest.party_size} Guests</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <div className={`border rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusColor('Occupied', false).badge}`}>
                                                    {guest.table_number || 'No Table'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming List */}
                            <div className="px-4 pb-6 mt-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[10px] font-bold text-indigo-500 tracking-wider">UPCOMING</h3>
                                    <div className="flex items-center text-indigo-500 text-xs font-bold space-x-1">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{upcoming.length}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {upcoming.map((guest, idx) => (
                                        <div 
                                            key={guest.id}
                                            onClick={() => handleGuestClick(guest)}
                                            className={`flex items-start justify-between p-2 rounded-lg cursor-pointer transition-colors border ${selectedTable === guest.table?.table_number ? 'bg-amber-50/50 border-amber-200' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-right w-14 pt-0.5">
                                                    <div className="text-gray-900 dark:text-white font-bold text-xs">{formatTime(guest.reservation_time)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-900 dark:text-white font-bold text-xs">{guest.customer_name}</div>
                                                    <div className="text-gray-500 dark:text-slate-400 font-medium text-[10px] my-0.5">{guest.contact_number}</div>
                                                    <div className="text-gray-400 font-semibold text-[9px]">{guest.party_size} Guests</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <div className={`border rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusColor('Reserved', false).badge}`}>
                                                    {guest.table_number || 'No Table'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ---------------- MAIN AREA (Floor Plan) ---------------- */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0B1120] transition-colors">
                
                {/* Top Toolbar */}
                <div className="h-16 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                    
                    {/* Left Controls */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 shadow-sm">
                            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-900 dark:text-white" />
                            <span className="mx-3">{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-900 dark:text-white" />
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors">
                            <span>Dinner</span>
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </div>
                    </div>

                    {/* Center Room Tabs */}
                    <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-600 dark:text-slate-400">
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-white border-b-2 border-indigo-600 pb-1 cursor-pointer">
                            <span>Main Room</span>
                            <span className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 rounded text-[10px]">8/12</span>
                        </div>
                        <div className="flex items-center space-x-2 pb-1 hover:text-gray-800 dark:text-slate-200 cursor-pointer transition-colors">
                            <span>Patio</span>
                            <span className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 rounded text-[10px]">2/8</span>
                        </div>
                        <div className="flex items-center space-x-2 pb-1 hover:text-gray-800 dark:text-slate-200 cursor-pointer transition-colors">
                            <span>Terrace</span>
                            <span className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 rounded text-[10px]">6/6</span>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-5">
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-xs">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                <div>
                                    <div className="text-gray-500 dark:text-slate-400 font-semibold text-[9px]">Avg. Wait</div>
                                    <div className="text-gray-900 dark:text-white font-bold leading-tight">30 min</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                <Users className="w-4 h-4 text-indigo-500" />
                                <div>
                                    <div className="text-gray-500 dark:text-slate-400 font-semibold text-[9px]">Current Capacity</div>
                                    <div className="text-gray-900 dark:text-white font-bold leading-tight">80% Full</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

                        <div className="flex space-x-3">
                            <button onClick={fetchData} className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm">
                                <Calendar className="w-4 h-4" />
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setIsMergeMode(!isMergeMode);
                                    setSelectedTablesForMerge([]);
                                }}
                                className={`hidden sm:flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${isMergeMode ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/20' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                            >
                                {isMergeMode ? 'Cancel Merge' : 'Merge Tables'}
                            </button>

                            <button 
                                onClick={handleNewReservation}
                                className="hidden sm:flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                New Reservation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Merge Mode Action Bar */}
                {isMergeMode && (
                    <div className="w-full bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 px-4 py-3 border-b border-amber-100 dark:border-amber-900/30 flex justify-between items-center text-sm">
                        <span className="font-medium">
                            Select available tables from the floor plan to merge them into a single larger table. ({selectedTablesForMerge.length} selected)
                        </span>
                        <button 
                            onClick={handleConfirmMerge}
                            disabled={merging || selectedTablesForMerge.length < 2}
                            className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-colors ${merging || selectedTablesForMerge.length < 2 ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
                        >
                            {merging ? 'Merging...' : 'Confirm Merge'}
                        </button>
                    </div>
                )}

                {/* Floor Plan Canvas */}
                <div className="flex-1 p-8 overflow-auto relative">
                    <div className="max-w-5xl mx-auto min-w-[800px]">
                        
                        {/* Dynamic Grid Layout matching Table Assignment */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-x-4 gap-y-8">
                            {[...floorPlanTables].sort((a, b) => a.seats - b.seats).map(table => {
                                const isSelectedForMerge = isMergeMode && selectedTablesForMerge.includes(table.dbId);
                                const isSelected = selectedTable === table.id && !isMergeMode;
                                
                                let borderClass = getStatusColor(table.status, table.isAvailableWithFutureRes).border;
                                let textClass = getStatusColor(table.status, table.isAvailableWithFutureRes).text;
                                
                                let colSpanClass = 'col-span-1';
                                if (table.seats >= 5 && table.seats <= 8) {
                                    colSpanClass = 'col-span-1 sm:col-span-2';
                                } else if (table.seats > 8) {
                                    colSpanClass = 'col-span-2 sm:col-span-3';
                                }
                                
                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        className={`relative w-full h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex ${colSpanClass}
                                            ${table.isMerged ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                            ${isSelectedForMerge ? 'ring-2 ring-amber-500 ring-offset-2 border-amber-200' : isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 border-indigo-200 dark:border-indigo-800' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        <div className={`w-3 shrink-0 rounded-l-2xl ${borderClass}`}></div>
                                        
                                        <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="text-gray-400 dark:text-slate-500 font-bold text-[10px] lg:text-[11px] 2xl:text-xs truncate w-full">{table.id}</span>
                                                <div className="flex space-x-1 items-center w-full">
                                                    <span className={`text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold ${textClass} truncate max-w-full`}>
                                                        {table.status} {table.isAvailableWithFutureRes && '(Now)'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col w-full">
                                                {table.guest ? (
                                                    <span className="text-gray-900 dark:text-white font-bold text-xs lg:text-[14px] 2xl:text-base truncate w-full block leading-tight">
                                                        {table.guest}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-slate-500 font-bold text-xs lg:text-[14px] 2xl:text-base truncate w-full block leading-tight italic opacity-60">
                                                        No Reservation
                                                    </span>
                                                )}
                                                {table.time && <span className="text-gray-500 dark:text-slate-400 text-[9px] font-bold mt-0.5">Res: {table.time}</span>}
                                            </div>
                                        </div>

                                        {renderChairs(table.seats, table.status)}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Merged Tables Section */}
                        {virtualTables.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-6 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-indigo-500" />
                                    Merged Tables (Large Parties)
                                </h3>
                                <div className="flex flex-wrap gap-6">
                                    {virtualTables.map(table => (
                                        <div 
                                            key={table.id}
                                            onClick={() => handleTableClick({ id: table.table_number, isMerged: false, dbId: table.id, status: table.status })}
                                            className={`relative w-48 h-24 bg-indigo-50/50 dark:bg-slate-800 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-900 cursor-pointer transition-all hover:shadow-md flex items-center justify-center`}
                                            title={`Merged Tables: ${table.name}`}
                                        >
                                            <div className={`w-3 shrink-0 absolute left-0 top-0 h-full rounded-l-2xl ${getStatusColor(table.status, false).border}`}></div>
                                            <div className="flex flex-col items-center w-full px-8">
                                                <span className="text-indigo-900 dark:text-indigo-200 font-bold text-sm truncate w-full text-center">{table.table_number}</span>
                                                <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold mt-0.5">{table.capacity} Seats</span>
                                                <span className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded border ${getStatusColor(table.status, false).badge}`}>
                                                    {table.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => handleUnmerge(e, table.id)}
                                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 bg-white/50 dark:bg-slate-900/50 rounded-md transition-colors shadow-sm"
                                                title="Split Table"
                                            >
                                                <Unlink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OperatorReservations;
