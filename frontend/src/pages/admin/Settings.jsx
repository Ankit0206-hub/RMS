import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Save, Store, Receipt, Bell, Shield, MapPin, 
    Mail, Phone, Clock, Link, Percent, DollarSign, CheckCircle2,
    Calendar, AlertTriangle, Plus, Trash2, Layout
} from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        restaurant_name: '',
        logo_url: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        currency: 'USD',
        gst_percentage: 0,
        service_charge_percentage: 0,
        business_hours: '',
        opening_time: '',
        closing_time: '',
        is_closed_early: false,
        holidays: [],
        merged_table_initial: 'M-',
        table_naming_convention: 'Numeric',
        total_tables: 0,
        floors_or_areas: []
    });
    
    const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });
    const [newFloor, setNewFloor] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings/');
                const data = response.data.data;
                // Ensure arrays are initialized
                if (!data.holidays) data.holidays = [];
                if (!data.floors_or_areas) data.floors_or_areas = [];
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        });
    };

    const handleAddHoliday = () => {
        if (newHoliday.date && newHoliday.reason) {
            setSettings({
                ...settings,
                holidays: [...settings.holidays, { ...newHoliday }]
            });
            setNewHoliday({ date: '', reason: '' });
        }
    };

    const handleRemoveHoliday = (index) => {
        const updated = [...settings.holidays];
        updated.splice(index, 1);
        setSettings({ ...settings, holidays: updated });
    };

    const handleAddFloor = () => {
        if (newFloor.trim() && !settings.floors_or_areas.includes(newFloor.trim())) {
            setSettings({
                ...settings,
                floors_or_areas: [...settings.floors_or_areas, newFloor.trim()]
            });
            setNewFloor('');
        }
    };

    const handleRemoveFloor = (index) => {
        const updated = [...settings.floors_or_areas];
        updated.splice(index, 1);
        setSettings({ ...settings, floors_or_areas: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.put('/admin/settings/', settings);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            
            // Auto hide message after 3 seconds
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General Details', icon: <Store className="w-4 h-4" /> },
        { id: 'billing', label: 'Billing & Taxes', icon: <Receipt className="w-4 h-4" /> },
        { id: 'operations', label: 'Timings & Operations', icon: <Clock className="w-4 h-4" /> },
        { id: 'tables', label: 'Table Settings', icon: <Layout className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
    ];

    return (
        <div className="space-y-6 font-inter pb-10">
            {/* Page Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                <p className="text-[11px] font-medium text-gray-500 mt-1">Manage your global restaurant configuration and preferences.</p>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Sidebar Navigation */}
                <div className="md:col-span-3 bg-white border border-gray-100 shadow-sm rounded-xl p-3">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-lg transition-colors ${
                                    activeTab === tab.id 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className={`mr-3 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Content Area */}
                <div className="md:col-span-9 space-y-6">
                    
                    {/* Success/Error Message */}
                    {message && (
                        <div className={`p-4 flex items-center rounded-lg border shadow-sm ${
                            message.type === 'success' 
                                ? 'bg-green-50/50 border-green-200 text-green-800' 
                                : 'bg-red-50/50 border-red-200 text-red-800'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                            ) : (
                                <Shield className="w-5 h-5 text-red-500 mr-3 shrink-0" />
                            )}
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                        
                        {/* Tab Content: General Details */}
                        {activeTab === 'general' && (
                            <div>
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">General Details</h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Basic information about your restaurant that appears on receipts and customer-facing interfaces.</p>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Restaurant Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Store className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="restaurant_name" 
                                                value={settings.restaurant_name || ''} 
                                                onChange={handleChange} 
                                                required 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Logo URL</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Link className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="logo_url" 
                                                value={settings.logo_url || ''} 
                                                onChange={handleChange} 
                                                placeholder="https://example.com/logo.png"
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Address</label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-0 pl-3 pointer-events-none text-gray-400">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <textarea 
                                                name="address" 
                                                value={settings.address || ''} 
                                                onChange={handleChange} 
                                                rows={3} 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="email" 
                                                name="contact_email" 
                                                value={settings.contact_email || ''} 
                                                onChange={handleChange} 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Phone</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="contact_phone" 
                                                value={settings.contact_phone || ''} 
                                                onChange={handleChange} 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Business Hours (Legacy)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="business_hours" 
                                                value={settings.business_hours || ''} 
                                                onChange={handleChange} 
                                                placeholder="e.g. Mon-Sun 9AM-10PM"
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Billing & Taxes */}
                        {activeTab === 'billing' && (
                            <div>
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Billing & Taxes</h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Configure your currency and global tax percentages applied to orders.</p>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Currency <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="currency" 
                                                value={settings.currency || 'USD'} 
                                                onChange={handleChange} 
                                                required 
                                                placeholder="e.g. USD, EUR, INR"
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">GST Percentage (%) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Percent className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="number" 
                                                name="gst_percentage" 
                                                value={settings.gst_percentage || 0} 
                                                onChange={handleChange} 
                                                min="0" max="100" step="0.01" 
                                                required 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Service Charge (%) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Percent className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="number" 
                                                name="service_charge_percentage" 
                                                value={settings.service_charge_percentage || 0} 
                                                onChange={handleChange} 
                                                min="0" max="100" step="0.01" 
                                                required 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Operations */}
                        {activeTab === 'operations' && (
                            <div>
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">Timings & Operations</h3>
                                        <p className="text-[11px] text-gray-500 font-medium">Configure daily operational hours and holiday schedules.</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-8">
                                    
                                    {/* Daily Timings */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-800 mb-4 flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Daily Timings
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Opening Time</label>
                                                <input 
                                                    type="time" 
                                                    name="opening_time" 
                                                    value={settings.opening_time || ''} 
                                                    onChange={handleChange} 
                                                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Closing Time</label>
                                                <input 
                                                    type="time" 
                                                    name="closing_time" 
                                                    value={settings.closing_time || ''} 
                                                    onChange={handleChange} 
                                                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Early Closing Override */}
                                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-red-900 flex items-center mb-1">
                                                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" /> Emergency Override
                                            </h4>
                                            <p className="text-[11px] font-medium text-red-600">Close the restaurant immediately to halt new orders and reservations.</p>
                                        </div>
                                        <div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    name="is_closed_early" 
                                                    checked={settings.is_closed_early || false}
                                                    onChange={handleChange} 
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Holidays Management */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-800 mb-4 flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Manage Holidays
                                        </h4>
                                        <div className="flex items-end gap-3 mb-4">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Date</label>
                                                <input 
                                                    type="date" 
                                                    value={newHoliday.date}
                                                    onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                                                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                                />
                                            </div>
                                            <div className="flex-[2]">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Reason (e.g. Christmas)</label>
                                                <input 
                                                    type="text" 
                                                    value={newHoliday.reason}
                                                    onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})}
                                                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleAddHoliday}
                                                disabled={!newHoliday.date || !newHoliday.reason}
                                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center h-[38px]"
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </button>
                                        </div>

                                        {settings.holidays && settings.holidays.length > 0 ? (
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Date</th>
                                                            <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Reason</th>
                                                            <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {settings.holidays.map((h, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{h.date}</td>
                                                                <td className="px-4 py-2 text-xs text-gray-500">{h.reason}</td>
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
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <Calendar className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                                <p className="text-[11px] font-medium text-gray-500">No holidays have been configured.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Table Settings */}
                        {activeTab === 'tables' && (
                            <div>
                                <div className="p-6 border-b border-gray-100 bg-white">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Table & Layout Settings</h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Configure table naming, limits, and floor areas.</p>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Merged Table Initial</label>
                                        <input 
                                            type="text" 
                                            name="merged_table_initial" 
                                            value={settings.merged_table_initial || ''} 
                                            onChange={handleChange} 
                                            placeholder="e.g. M-"
                                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Table Naming Convention</label>
                                        <select 
                                            name="table_naming_convention" 
                                            value={settings.table_naming_convention || 'Numeric'} 
                                            onChange={handleChange} 
                                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        >
                                            <option value="Numeric">Numeric (1, 2, 3)</option>
                                            <option value="Alphabetic">Alphabetic (A, B, C)</option>
                                            <option value="Custom">Custom / Free Text</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Total Tables</label>
                                        <input 
                                            type="number" 
                                            name="total_tables" 
                                            value={settings.total_tables || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Expected total number of tables.</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Floors or Areas</label>
                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="text" 
                                                value={newFloor}
                                                onChange={(e) => setNewFloor(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddFloor();
                                                    }
                                                }}
                                                placeholder="e.g. Ground Floor, Patio, Rooftop"
                                                className="block flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddFloor}
                                                disabled={!newFloor.trim()}
                                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center h-[38px]"
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add Area
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {settings.floors_or_areas && settings.floors_or_areas.map((floor, idx) => (
                                                <div key={idx} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-bold border border-indigo-100">
                                                    {floor}
                                                    <button type="button" onClick={() => handleRemoveFloor(idx)} className="text-indigo-400 hover:text-indigo-900 ml-1">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!settings.floors_or_areas || settings.floors_or_areas.length === 0) && (
                                                <span className="text-[11px] text-gray-400 italic">No areas defined yet. Add one above.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Security (Placeholder) */}
                        {activeTab === 'security' && (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Coming Soon</h3>
                                <p className="text-[11px] font-medium text-gray-500 max-w-sm">
                                    Advanced security controls, two-factor authentication, and IP whitelisting will be available in a future update.
                                </p>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving} 
                                className="flex items-center px-6 py-2.5 bg-[#5e5ce6] hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-indigo-200 transition-colors disabled:opacity-50"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving Changes...' : 'Save Settings'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
