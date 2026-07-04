import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Save, Store, Receipt, Bell, Shield, MapPin, 
    Mail, Phone, Clock, Link, Percent, DollarSign, CheckCircle2 
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
        business_hours: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings/');
                setSettings(response.data.data);
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'number' ? Number(value) : value
        });
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
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
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
                                                value={settings.restaurant_name} 
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
                                                value={settings.address} 
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
                                                value={settings.contact_email} 
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
                                                value={settings.contact_phone} 
                                                onChange={handleChange} 
                                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Business Hours</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="business_hours" 
                                                value={settings.business_hours} 
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
                                                value={settings.currency} 
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
                                                value={settings.gst_percentage} 
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
                                                value={settings.service_charge_percentage} 
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

                        {/* Tab Content: Notifications & Security (Placeholders) */}
                        {(activeTab === 'notifications' || activeTab === 'security') && (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'notifications' ? <Bell className="w-8 h-8 text-gray-400" /> : <Shield className="w-8 h-8 text-gray-400" />}
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Coming Soon</h3>
                                <p className="text-[11px] font-medium text-gray-500 max-w-sm">
                                    {activeTab === 'notifications' 
                                        ? 'Detailed notification preferences (email, push, SMS) are currently being developed and will be available in a future update.'
                                        : 'Advanced security controls, two-factor authentication, and IP whitelisting will be available in a future update.'}
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
