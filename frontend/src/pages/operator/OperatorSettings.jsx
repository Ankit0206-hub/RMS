import React, { useState, useEffect } from 'react';
import { Camera, User, Clock, Layout, Calendar, AlertTriangle, Plus, Trash2, CheckCircle2, Shield, Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CustomTimePicker = ({ label, value, onChange, name }) => {
    const getParts = (val) => {
        if (!val) return { hour: '09', minute: '00', period: 'AM' };
        const [h, m] = val.split(':');
        let hr = parseInt(h, 10);
        let period = 'AM';
        
        // Handle Edge Cases
        if (isNaN(hr)) return { hour: '09', minute: '00', period: 'AM' };
        
        if (hr >= 12) {
            period = 'PM';
            if (hr > 12) hr -= 12;
        } else if (hr === 0) {
            hr = 12;
        }
        
        return { 
            hour: hr.toString().padStart(2, '0'), 
            minute: m ? m.padStart(2, '0').slice(0, 2) : '00', 
            period 
        };
    };

    const { hour, minute, period } = getParts(value);

    const updateTime = (newH, newM, newP) => {
        let hr24 = parseInt(newH, 10);
        if (newP === 'PM' && hr24 !== 12) hr24 += 12;
        if (newP === 'AM' && hr24 === 12) hr24 = 0;
        const time24 = `${hr24.toString().padStart(2, '0')}:${newM}`;
        onChange({ target: { name, value: time24, type: 'time' } });
    };

    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center">
                {label}
            </label>
            <div className="flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500 transition-all shadow-sm">
                <select 
                    value={hour} 
                    onChange={(e) => updateTime(e.target.value, minute, period)}
                    className="flex-1 bg-transparent border-none text-sm font-black text-gray-900 dark:text-white focus:ring-0 cursor-pointer appearance-none text-center outline-none hover:bg-gray-200 dark:hover:bg-slate-700 py-1.5 rounded transition-colors"
                >
                    {[...Array(12)].map((_, i) => {
                        const val = (i + 1).toString().padStart(2, '0');
                        return <option key={val} value={val} className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">{val}</option>;
                    })}
                </select>
                <span className="flex items-center justify-center font-black text-gray-400 dark:text-slate-500 px-1 text-lg">:</span>
                <select 
                    value={minute} 
                    onChange={(e) => updateTime(hour, e.target.value, period)}
                    className="flex-1 bg-transparent border-none text-sm font-black text-gray-900 dark:text-white focus:ring-0 cursor-pointer appearance-none text-center outline-none hover:bg-gray-200 dark:hover:bg-slate-700 py-1.5 rounded transition-colors"
                >
                    {['00', '15', '30', '45'].map(val => (
                        <option key={val} value={val} className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">{val}</option>
                    ))}
                </select>
                <div className="flex bg-gray-200/80 dark:bg-slate-900 p-1 rounded-md ml-3 border border-gray-200 dark:border-slate-700 shadow-inner">
                    <button 
                        type="button"
                        onClick={() => updateTime(hour, minute, 'AM')}
                        className={`px-3 py-1.5 rounded-[4px] text-[11px] font-black transition-all duration-200 ${period === 'AM' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm scale-105' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}
                    >
                        AM
                    </button>
                    <button 
                        type="button"
                        onClick={() => updateTime(hour, minute, 'PM')}
                        className={`px-3 py-1.5 rounded-[4px] text-[11px] font-black transition-all duration-200 ${period === 'PM' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm scale-105' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}
                    >
                        PM
                    </button>
                </div>
            </div>
        </div>
    );
};

const OperatorSettings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    
    // Profile State
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    
    // Restaurant Settings State
    const [restaurantSettings, setRestaurantSettings] = useState({
        opening_time: '',
        closing_time: '',
        is_closed_early: false,
        holidays: [],
        merged_table_initial: 'M-',
        normal_table_prefix: 'T-',
        table_naming_convention: 'Numeric',
        total_tables: 0,
        floors_or_areas: [],
        floor_prefixes: {}
    });

    const [actualTotalTables, setActualTotalTables] = useState(0);

    const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });
    const [newFloor, setNewFloor] = useState('');
    const [newFloorPrefix, setNewFloorPrefix] = useState('');

    const [status, setStatus] = useState({ loading: true, saving: false, error: null, successMessage: null });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/operator/settings');
                const data = response.data.data;
                if (!data.holidays) data.holidays = [];
                if (!data.floors_or_areas) data.floors_or_areas = [];
                if (!data.floor_prefixes) data.floor_prefixes = {};
                if (!data.normal_table_prefix) data.normal_table_prefix = 'T-';
                setRestaurantSettings(data);
                
                try {
                    const tablesRes = await api.get('/admin/tables/', { params: { page: 1, page_size: 1000 } });
                    setActualTotalTables(tablesRes.data.data?.length || 0);
                } catch (e) { console.error(e); }
                
                setStatus(prev => ({ ...prev, loading: false }));
            } catch (error) {
                console.error("Failed to load restaurant settings", error);
                setStatus(prev => ({ ...prev, loading: false }));
            }
        };
        fetchSettings();
    }, []);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
        if (status.error || status.successMessage) {
            setStatus({ ...status, error: null, successMessage: null });
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRestaurantSettings({
            ...restaurantSettings,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        });
        if (status.error || status.successMessage) {
            setStatus({ ...status, error: null, successMessage: null });
        }
    };

    // Holidays handlers
    const handleAddHoliday = () => {
        if (newHoliday.date && newHoliday.reason) {
            setRestaurantSettings(prev => ({
                ...prev,
                holidays: [...prev.holidays, { ...newHoliday }]
            }));
            setNewHoliday({ date: '', reason: '' });
        }
    };
    const handleRemoveHoliday = (index) => {
        const updated = [...restaurantSettings.holidays];
        updated.splice(index, 1);
        setRestaurantSettings(prev => ({ ...prev, holidays: updated }));
    };

    // Floors handlers
    const handleAddFloor = () => {
        if (newFloor.trim() && !restaurantSettings.floors_or_areas.includes(newFloor.trim())) {
            setRestaurantSettings(prev => ({
                ...prev,
                floors_or_areas: [...prev.floors_or_areas, newFloor.trim()],
                floor_prefixes: {
                    ...prev.floor_prefixes,
                    [newFloor.trim()]: newFloorPrefix.trim() || ''
                }
            }));
            setNewFloor('');
            setNewFloorPrefix('');
        }
    };
    const handleRemoveFloor = (index) => {
        const floorName = restaurantSettings.floors_or_areas[index];
        const updatedFloors = [...restaurantSettings.floors_or_areas];
        updatedFloors.splice(index, 1);
        
        const updatedPrefixes = { ...restaurantSettings.floor_prefixes };
        delete updatedPrefixes[floorName];
        
        setRestaurantSettings(prev => ({ ...prev, floors_or_areas: updatedFloors, floor_prefixes: updatedPrefixes }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus({ ...status, saving: true, error: null, successMessage: null });

        try {
            if (activeTab === 'profile') {
                await api.put('/operator/me', profileData);
                updateUser(profileData);
                setStatus({ ...status, saving: false, successMessage: 'Profile updated successfully!' });
            } else {
                await api.put('/operator/settings', restaurantSettings);
                setStatus({ ...status, saving: false, successMessage: 'Settings updated successfully!' });
            }
            
            setTimeout(() => {
                setStatus(prev => ({ ...prev, successMessage: null }));
            }, 3000);
        } catch (err) {
            console.error('Error saving:', err);
            setStatus({ 
                ...status,
                saving: false, 
                error: err.response?.data?.detail || 'Failed to save changes'
            });
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
        { id: 'operations', label: 'Timings & Operations', icon: <Clock className="w-4 h-4" /> },
        { id: 'tables', label: 'Table Settings', icon: <Layout className="w-4 h-4" /> }
    ];

    if (status.loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="font-inter pb-10">
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1">Operator Settings</h1>
                    <p className="text-[14px] font-medium text-gray-500 dark:text-slate-400">Manage your profile and restaurant operations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Sidebar Navigation */}
                    <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl p-3">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-lg transition-colors ${
                                        activeTab === tab.id 
                                            ? 'bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400' 
                                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span className={`mr-3 ${activeTab === tab.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'}`}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <div className="md:col-span-9 space-y-6">
                        
                        {/* Status Message */}
                        {status.successMessage && (
                            <div className="p-4 flex items-center rounded-lg border shadow-sm bg-green-50/50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                                <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                                <span className="text-sm font-bold">{status.successMessage}</span>
                            </div>
                        )}
                        {status.error && (
                            <div className="p-4 flex items-center rounded-lg border shadow-sm bg-red-50/50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                <Shield className="w-5 h-5 mr-3 shrink-0" />
                                <span className="text-sm font-bold">{status.error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                            
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <img 
                                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150" 
                                                alt="Profile" 
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-slate-800 shadow-sm"
                                            />
                                            <div>
                                                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                                                    {user?.first_name} {user?.last_name}
                                                </h2>
                                                <p className="text-[14px] font-medium text-gray-500 dark:text-slate-400 mt-0.5 capitalize">{user?.role || 'Operator'}</p>
                                            </div>
                                        </div>
                                        <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                            <Camera size={14} /> Change Photo
                                        </button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">First name</label>
                                            <input 
                                                type="text" name="first_name" value={profileData.first_name} onChange={handleProfileChange} required
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Last name</label>
                                            <input 
                                                type="text" name="last_name" value={profileData.last_name} onChange={handleProfileChange} required
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Email</label>
                                            <input 
                                                type="email" name="email" value={profileData.email} onChange={handleProfileChange} required
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phone number</label>
                                            <input 
                                                type="text" name="phone" value={profileData.phone} onChange={handleProfileChange}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Job title / Role</label>
                                            <input 
                                                type="text" value={user?.role || 'Operator'} disabled
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-500 dark:text-slate-400 cursor-not-allowed capitalize"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Company name</label>
                                            <input 
                                                type="text" value="DineOps Restaurant" disabled
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-500 dark:text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Operations Tab */}
                            {activeTab === 'operations' && (
                                <div>
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Timings & Operations</h3>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Configure daily operational hours and holiday schedules.</p>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        
                                        {/* Daily Timings */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-cyan-500" /> Daily Timings
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <CustomTimePicker 
                                                    label="Opening Time" 
                                                    name="opening_time" 
                                                    value={restaurantSettings.opening_time || ''} 
                                                    onChange={handleSettingsChange} 
                                                />
                                                <CustomTimePicker 
                                                    label="Closing Time" 
                                                    name="closing_time" 
                                                    value={restaurantSettings.closing_time || ''} 
                                                    onChange={handleSettingsChange} 
                                                />
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 dark:border-slate-800" />

                                        {/* Financial Timings */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                                <Receipt className="w-4 h-4 mr-2 text-cyan-500" /> Taxes & Fees
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">CGST Tax (%)</label>
                                                    <input 
                                                        type="number" min="0" max="100" step="0.1" name="cgst_percentage" value={restaurantSettings.cgst_percentage || 0} onChange={handleSettingsChange}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">SGST Tax (%)</label>
                                                    <input 
                                                        type="number" min="0" max="100" step="0.1" name="sgst_percentage" value={restaurantSettings.sgst_percentage || 0} onChange={handleSettingsChange}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Service Charge (%)</label>
                                                    <input 
                                                        type="number" min="0" max="100" step="0.1" name="service_charge_percentage" value={restaurantSettings.service_charge_percentage || 0} onChange={handleSettingsChange}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 dark:border-slate-800" />

                                        {/* Early Closing Override */}
                                        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-5 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-red-900 dark:text-red-400 flex items-center mb-1">
                                                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" /> Emergency Override
                                                </h4>
                                                <p className="text-[11px] font-medium text-red-600 dark:text-red-400/80">Close the restaurant immediately to halt new orders and reservations.</p>
                                            </div>
                                            <div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" name="is_closed_early" checked={restaurantSettings.is_closed_early || false} onChange={handleSettingsChange} 
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                                </label>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 dark:border-slate-800" />

                                        {/* Holidays */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-cyan-500" /> Manage Holidays
                                            </h4>
                                            <div className="flex items-end gap-3 mb-4">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Date</label>
                                                    <input 
                                                        type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                                                        className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                                    />
                                                </div>
                                                <div className="flex-[2]">
                                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Reason (e.g. Christmas)</label>
                                                    <input 
                                                        type="text" value={newHoliday.reason} onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})}
                                                        className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                                    />
                                                </div>
                                                <button 
                                                    type="button" onClick={handleAddHoliday} disabled={!newHoliday.date || !newHoliday.reason}
                                                    className="px-4 py-2 bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center h-[38px]"
                                                >
                                                    <Plus className="w-4 h-4" /> Add
                                                </button>
                                            </div>

                                            {restaurantSettings.holidays && restaurantSettings.holidays.length > 0 ? (
                                                <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                                        <thead className="bg-gray-50 dark:bg-slate-800">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Date</th>
                                                                <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Reason</th>
                                                                <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                                                            {restaurantSettings.holidays.map((h, i) => (
                                                                <tr key={i}>
                                                                    <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{h.date}</td>
                                                                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">{h.reason}</td>
                                                                    <td className="px-4 py-2 text-right">
                                                                        <button type="button" onClick={() => handleRemoveHoliday(i)} className="text-red-500 hover:text-red-700">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                                                    <p className="text-[11px] font-medium text-gray-500">No holidays defined.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tables Tab */}
                            {activeTab === 'tables' && (
                                <div>
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Table & Layout Settings</h3>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Configure table naming, limits, and floor areas.</p>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Merged Table Prefix</label>
                                            <input 
                                                type="text" name="merged_table_initial" value={restaurantSettings.merged_table_initial || ''} onChange={handleSettingsChange} placeholder="e.g. M-"
                                                className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Normal Table Prefix</label>
                                            <input 
                                                type="text" name="normal_table_prefix" value={restaurantSettings.normal_table_prefix || ''} onChange={handleSettingsChange} placeholder="e.g. T-"
                                                className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Table Naming Convention</label>
                                            <select 
                                                name="table_naming_convention" value={restaurantSettings.table_naming_convention || 'Numeric'} onChange={handleSettingsChange} 
                                                className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                            >
                                                <option value="Numeric">Numeric (1, 2, 3)</option>
                                                <option value="Alphabetic">Alphabetic (A, B, C)</option>
                                                <option value="Custom">Custom / Free Text</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Current Total Tables</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" value={actualTotalTables} disabled
                                                    className="block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-slate-400 cursor-not-allowed" 
                                                />
                                                <span className="absolute right-3 top-2 text-[10px] font-bold text-gray-400">READ ONLY</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Floors or Areas</label>
                                            <div className="flex gap-2 mb-3">
                                                <input 
                                                    type="text" value={newFloor} onChange={(e) => setNewFloor(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddFloor(); } }} placeholder="Area Name (e.g. Patio)"
                                                    className="block flex-[2] px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                                />
                                                <input 
                                                    type="text" value={newFloorPrefix} onChange={(e) => setNewFloorPrefix(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddFloor(); } }} placeholder="Prefix (e.g. P-)"
                                                    className="block flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                                />
                                                <button 
                                                    type="button" onClick={handleAddFloor} disabled={!newFloor.trim()}
                                                    className="px-4 py-2 bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" /> Add Area
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {restaurantSettings.floors_or_areas && restaurantSettings.floors_or_areas.map((floor, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 px-3 py-1.5 rounded-md text-xs font-bold border border-cyan-100 dark:border-slate-700">
                                                        {floor} {restaurantSettings.floor_prefixes?.[floor] ? `(${restaurantSettings.floor_prefixes[floor]})` : ''}
                                                        <button type="button" onClick={() => handleRemoveFloor(idx)} className="text-cyan-500 hover:text-cyan-900 dark:hover:text-cyan-200 ml-1">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!restaurantSettings.floors_or_areas || restaurantSettings.floors_or_areas.length === 0) && (
                                                    <span className="text-[11px] text-gray-400 italic">No areas defined.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-800/20 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                                <button 
                                    type="submit" disabled={status.saving} 
                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-slate-900 hover:bg-black text-white text-[12px] font-bold rounded-lg shadow-sm disabled:opacity-50 transition-all"
                                >
                                    {status.saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorSettings;
