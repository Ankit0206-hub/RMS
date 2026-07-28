import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { ChevronRight, Maximize, ZoomIn, ZoomOut, Plus, RefreshCcw, Map, Save, X, Trash2, Pencil } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const FloorPlan = () => {
    const [activeSection, setActiveSection] = useState('Main Hall');
    const [zoom, setZoom] = useState(100);
    const [isEditing, setIsEditing] = useState(false);
    const [positions, setPositions] = useState({});
    const [draggingTable, setDraggingTable] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [deleteModalSection, setDeleteModalSection] = useState(null);
    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [tableForm, setTableForm] = useState({ table_number: '', capacity: 4, floor: 'Main Hall' });
    const queryClient = useQueryClient();

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

    const { data: settingsResponse } = useQuery({
        queryKey: ['operator-settings'],
        queryFn: async () => {
            const res = await api.get('/operator/settings/');
            return res.data;
        }
    });

    const tables = tablesResponse?.data || [];
    const analyticsData = analyticsResponse?.data;
    const settings = settingsResponse?.data || {};

    const customFloors = settings.floors_or_areas || [];
    const floorsOrAreas = ['Main Hall', ...customFloors.filter(f => f !== 'Main Hall')];

    const sections = floorsOrAreas.map(floor => ({
        name: floor,
        tables: tables.filter(t => t.floor === floor || (floor === 'Main Hall' && !t.floor)).length
    }));

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

    const getDefaultPosition = (idx) => {
        const cols = 4;
        const x = (idx % cols) * 160 + 50;
        const y = Math.floor(idx / cols) * 140 + 50;
        return { x, y };
    };

    // Initialize positions when current tables change or data loads
    useEffect(() => {
        const newPos = { ...positions };
        let changed = false;
        currentTables.forEach((t, idx) => {
            if (!newPos[t.id]) {
                newPos[t.id] = (t.x_position || t.y_position) 
                    ? { x: t.x_position, y: t.y_position } 
                    : getDefaultPosition(idx);
                changed = true;
            }
        });
        if (changed) {
            setPositions(newPos);
        }
    }, [currentTables]);

    const handlePointerDown = (e, tableId) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();
        
        const rect = e.currentTarget.getBoundingClientRect();
        
        setDraggingTable({
            id: tableId,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        });
    };

    const handlePointerMove = (e) => {
        if (!isEditing || !draggingTable) return;
        
        const container = document.getElementById('floor-plan-canvas-inner');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        const rawX = e.clientX - containerRect.left - draggingTable.offsetX;
        const rawY = e.clientY - containerRect.top - draggingTable.offsetY;
        
        const scaledX = rawX / (zoom / 100);
        const scaledY = rawY / (zoom / 100);
        
        setPositions(prev => ({
            ...prev,
            [draggingTable.id]: { x: Math.max(0, scaledX), y: Math.max(0, scaledY) }
        }));
    };

    const handlePointerUp = () => {
        if (draggingTable) setDraggingTable(null);
    };

    const saveMutation = useMutation({
        mutationFn: async (updates) => {
            return api.put('/admin/tables/batch', { tables: updates });
        },
        onSuccess: () => {
            toast.success("Floor plan saved successfully!");
            queryClient.invalidateQueries({ queryKey: ['operator-tables'] });
            setIsEditing(false);
        },
        onError: () => toast.error("Failed to save floor plan")
    });

    const handleSaveLayout = () => {
        const updates = currentTables.map(t => ({
            id: t.id,
            x_position: positions[t.id]?.x || 0,
            y_position: positions[t.id]?.y || 0
        }));
        saveMutation.mutate(updates);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Re-init positions from db
        const newPos = {};
        currentTables.forEach((t, idx) => {
            newPos[t.id] = (t.x_position || t.y_position) 
                ? { x: t.x_position, y: t.y_position } 
                : getDefaultPosition(idx);
        });
        setPositions(newPos);
    };

    const settingsMutation = useMutation({
        mutationFn: async (updatedSettings) => {
            return api.put('/operator/settings/', updatedSettings);
        },
        onSuccess: () => {
            toast.success("Section added successfully!");
            queryClient.invalidateQueries({ queryKey: ['operator-settings'] });
        },
        onError: () => toast.error("Failed to add section")
    });

    const handleAddSectionSubmit = () => {
        if (newSectionName && newSectionName.trim() !== '') {
            const newName = newSectionName.trim();
            if (newName === 'Main Hall') {
                toast.error("Main Hall already exists!");
                return;
            }
            const currentFloors = settings?.floors_or_areas || [];
            if (!currentFloors.includes(newName)) {
                const updatedSettings = {
                    ...settings,
                    floors_or_areas: [...currentFloors, newName]
                };
                settingsMutation.mutate(updatedSettings);
                setAddModalOpen(false);
                setNewSectionName('');
            } else {
                toast.error("Section already exists!");
            }
        }
    };

    const handleDeleteSectionSubmit = () => {
        if (deleteModalSection && deleteModalSection !== 'Main Hall') {
            const currentFloors = settings?.floors_or_areas || [];
            const updatedSettings = {
                ...settings,
                floors_or_areas: currentFloors.filter(f => f !== deleteModalSection)
            };
            settingsMutation.mutate(updatedSettings);
            if (activeSection === deleteModalSection) {
                setActiveSection('Main Hall');
            }
            setDeleteModalSection(null);
        }
    };

    const openTableModal = (table = null) => {
        if (table) {
            setEditingTable(table);
            setTableForm({ table_number: table.table_number, capacity: table.capacity, floor: table.floor || 'Main Hall' });
        } else {
            setEditingTable(null);
            setTableForm({ table_number: '', capacity: 4, floor: activeSection });
        }
        setTableModalOpen(true);
    };

    const tableMutation = useMutation({
        mutationFn: async (data) => {
            if (editingTable) {
                return api.put(`/admin/tables/${editingTable.id}`, data);
            } else {
                return api.post('/admin/tables/', data);
            }
        },
        onSuccess: () => {
            toast.success(editingTable ? "Table updated!" : "Table created!");
            queryClient.invalidateQueries({ queryKey: ['operator-tables'] });
            setTableModalOpen(false);
        },
        onError: () => toast.error("Failed to save table")
    });

    const handleTableSubmit = () => {
        if (tableForm.table_number && tableForm.capacity > 0) {
            tableMutation.mutate(tableForm);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Loading Floor Plan...</div>;

    return (
        <div className="flex h-full font-inter overflow-hidden relative">
            <div className="flex-1 flex flex-col overflow-y-auto">
                
                {/* Header Action Buttons */}
                <div className="flex justify-end mb-4">
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <button onClick={() => openTableModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors">
                                    <Plus size={16} className="mr-2" /> Add Table
                                </button>
                                <button onClick={handleCancelEdit} className="bg-white dark:bg-slate-900 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center hover:bg-red-50 transition-colors">
                                    <X size={16} className="mr-2" /> Cancel
                                </button>
                                <button onClick={handleSaveLayout} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors">
                                    <Save size={16} className="mr-2" /> Save Layout
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="bg-white dark:bg-slate-900 border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center hover:bg-indigo-50 transition-colors">
                                    <RefreshCcw size={16} className="mr-2" /> Edit Floor Plan
                                </button>
                                <button onClick={() => setAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors">
                                    <span className="text-lg mr-1">+</span> Add Section
                                </button>
                            </>
                        )}
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
                                <div key={sec.name} className="relative group">
                                    <button 
                                        onClick={() => !isEditing && setActiveSection(sec.name)}
                                        disabled={isEditing}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                                            activeSection === sec.name ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300'
                                        } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                        <ChevronRight size={14} className={`${activeSection === sec.name ? 'text-indigo-500' : 'text-gray-300'} ${(!isEditing && sec.name !== 'Main Hall') ? 'group-hover:opacity-0' : 'opacity-100'} transition-opacity`} />
                                    </button>
                                    {!isEditing && sec.name !== 'Main Hall' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDeleteModalSection(sec.name); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center: Floor Plan Canvas */}
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
                        {/* Canvas Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>Available</div>
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5"></span>Occupied</div>
                                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></span>Reserved</div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {isEditing && <span className="text-xs font-bold text-indigo-600 animate-pulse mr-2">Editing Layout...</span>}
                                <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                                    <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"><ZoomOut size={16} /></button>
                                    <span className="text-xs font-bold px-2 text-gray-700 dark:text-slate-300 w-12 text-center">{zoom}%</span>
                                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"><ZoomIn size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Canvas Area (Blueprint Background) */}
                        <div 
                            className="flex-1 overflow-hidden bg-slate-50 relative" 
                            style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        >
                            <div 
                                id="floor-plan-canvas-inner"
                                className="w-full h-full relative origin-top-left touch-none"
                                style={{ transform: `scale(${zoom / 100})`, width: '2000px', height: '2000px' }}
                            >
                                {currentTables.map((table, idx) => {
                                    const colors = getStatusColor(table.status);
                                    const seats = Array.from({ length: table.capacity }).map((_, i) => i);
                                    const pos = positions[table.id] || getDefaultPosition(idx);
                                    
                                    return (
                                        <div 
                                            key={table.id} 
                                            className={`absolute group cursor-pointer ${isEditing ? 'cursor-grab active:cursor-grabbing hover:ring-4 hover:ring-indigo-300/50 rounded-xl' : ''} ${draggingTable?.id === table.id ? 'z-50 opacity-90' : 'z-10'}`}
                                            style={{ left: pos.x, top: pos.y, width: '96px', height: '64px' }}
                                            onPointerDown={(e) => handlePointerDown(e, table.id)}
                                        >
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
                                            
                                            {isEditing && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); openTableModal(table); }}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    className="absolute -top-3 -right-3 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                            )}

                                            <div className={`w-24 h-16 rounded-xl border-2 ${colors.border} ${colors.bg} flex flex-col items-center justify-center shadow-sm relative transition-transform ${!isEditing && 'group-hover:scale-105'}`}>
                                                <span className={`font-black text-[15px] ${colors.text}`}>{table.table_number}</span>
                                                <span className={`text-[10px] font-bold ${colors.text} opacity-80`}>{table.capacity} Seats</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {currentTables.length === 0 && (
                                    <div className="text-gray-400 dark:text-slate-500 font-bold flex flex-col items-center mt-20 absolute w-full left-0">
                                        <Map size={48} className="mb-4 opacity-50" />
                                        <p>No tables configured for this section yet.</p>
                                    </div>
                                )}
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
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Add Section Modal */}
            {addModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-[400px] border border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Section</h2>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Section Name</label>
                            <input 
                                type="text" 
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="e.g. Patio, Rooftop"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleAddSectionSubmit} disabled={!newSectionName.trim() || settingsMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">Add Section</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Section Modal */}
            {deleteModalSection && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-[400px] border border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Section</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Are you sure you want to delete the section <strong>{deleteModalSection}</strong>? Tables assigned to this section will still remain but may not appear correctly unless reassigned.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setDeleteModalSection(null)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleDeleteSectionSubmit} disabled={settingsMutation.isPending} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">Delete Section</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Settings Modal */}
            {tableModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-[400px] border border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Table Number</label>
                                <input 
                                    type="text" 
                                    value={tableForm.table_number}
                                    onChange={(e) => setTableForm({...tableForm, table_number: e.target.value})}
                                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    placeholder="e.g. T1, Balcony-1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Capacity (Seats)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={tableForm.capacity}
                                    onChange={(e) => setTableForm({...tableForm, capacity: parseInt(e.target.value) || 1})}
                                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Section / Floor</label>
                                <select 
                                    value={tableForm.floor}
                                    onChange={(e) => setTableForm({...tableForm, floor: e.target.value})}
                                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                >
                                    {floorsOrAreas.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setTableModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleTableSubmit} disabled={!tableForm.table_number || tableMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
                                {editingTable ? 'Save Changes' : 'Create Table'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloorPlan;
