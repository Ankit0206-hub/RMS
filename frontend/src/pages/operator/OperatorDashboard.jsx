import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, ClipboardList, TrendingUp, Clock, AlertCircle, ChefHat, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OperatorDashboard = () => {
    const navigate = useNavigate();

    const { data: operatorData } = useQuery({
        queryKey: ['operator_me'],
        queryFn: async () => {
            const res = await api.get('/operator/me');
            return res.data;
        }
    });

    const { data: tables } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const res = await api.get('/admin/tables/');
            return res.data.data;
        }
    });

    const { data: sessions } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await api.get('/admin/sessions/');
            return res.data.data;
        },
        refetchInterval: 10000 // Polling every 10s for live tracking
    });

    const { data: bills } = useQuery({
        queryKey: ['bills'],
        queryFn: async () => {
            const res = await api.get('/admin/bills/');
            return res.data.data;
        }
    });

    // Derive orders and map them to their table numbers for Live Tracking
    const activeOrders = useMemo(() => {
        if (!sessions || !tables) return [];
        let orders = [];
        sessions.filter(s => s.status === 'Active').forEach(session => {
            const table = tables.find(t => t.id === session.table_id);
            if (session.orders && session.orders.length > 0) {
                session.orders.forEach(order => {
                    if (['Pending', 'Confirmed', 'Cooked'].includes(order.status)) {
                        orders.push({
                            ...order,
                            table_number: table ? table.table_number : 'Unknown',
                            customer_name: session.customer_name || 'Walk-in'
                        });
                    }
                });
            }
        });
        // Sort by newest first
        return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [sessions, tables]);

    // Calculate metrics
    const allOrders = useMemo(() => {
        if (!sessions) return [];
        return sessions.flatMap(s => s.orders || []);
    }, [sessions]);

    const activeTables = tables?.filter(t => t.status === 'Occupied' || t.status === 'Reserved').length || 0;
    const pendingOrdersCount = activeOrders.length;
    const completedBills = bills?.filter(b => b.payment_status === 'paid') || [];
    const revenueToday = completedBills.reduce((acc, bill) => acc + parseFloat(bill.total_amount), 0);
    const avgOrderValue = completedBills.length > 0 ? (revenueToday / completedBills.length) : 0;
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(o => o.status === 'Completed' || o.status === 'Served').length;

    const getStatusStep = (status) => {
        switch(status) {
            case 'Pending': return 1;
            case 'Confirmed': return 2;
            case 'Cooked': return 3;
            case 'Served': return 4;
            case 'Completed': return 5;
            default: return 0;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-500 text-sm mt-1">Live metrics and operations for {operatorData?.employee_code || 'Operator'}.</p>
                </div>
            </div>

            {/* Sleek, Professional KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Floor Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tables</p>
                        <div className="flex items-baseline space-x-2 mt-1">
                            <h3 className="text-2xl font-bold text-gray-900">{activeTables}</h3>
                            <span className="text-sm font-medium text-gray-400">/ {tables?.length || 0}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600">
                        <Users className="h-5 w-5" />
                    </div>
                </div>

                {/* Card 2: Kitchen Queue */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Orders</p>
                        <div className="flex items-baseline space-x-2 mt-1">
                            <h3 className="text-2xl font-bold text-gray-900">{pendingOrdersCount}</h3>
                            <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded ml-2">In Kitchen</span>
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>

                {/* Card 3: Served Orders */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders Served</p>
                        <div className="flex items-baseline space-x-2 mt-1">
                            <h3 className="text-2xl font-bold text-gray-900">{completedOrders}</h3>
                            <span className="text-sm font-medium text-gray-400">/ {totalOrders}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </div>

                {/* Card 4: Revenue */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue Today</p>
                        <div className="flex items-baseline space-x-2 mt-1">
                            <h3 className="text-2xl font-bold text-gray-900">₹{revenueToday.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</h3>
                        </div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Live Order Tracking Column */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <UtensilsCrossed className="w-5 h-5 mr-2 text-cyan-600" /> Live Order Tracking
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Real-time order progress from placed to served.</p>
                            </div>
                            <button onClick={() => navigate('/operator/orders')} className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-4 py-2 rounded-lg transition-colors">Manage Orders</button>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                            {activeOrders.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                                        <CheckCircle2 className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">All caught up!</h4>
                                    <p className="text-gray-500 text-sm mt-1">No pending orders in the kitchen.</p>
                                </div>
                            ) : (
                                activeOrders.map(order => {
                                    const step = getStatusStep(order.status);
                                    return (
                                        <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-cyan-200 hover:shadow-md transition-all group relative overflow-hidden">
                                            {/* Progress Background bar */}
                                            <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
                                                <div className="h-full bg-cyan-500 transition-all duration-1000 ease-in-out" style={{ width: `${(step / 3) * 100}%` }}></div>
                                            </div>
                                            
                                            <div className="flex justify-between items-start mb-6 mt-2">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <span className="font-black text-gray-900 text-lg">Table {order.table_number}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="font-semibold text-gray-500">Order #{order.id}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{order.customer_name} • {order.items?.length || 0} items</p>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                                                    step === 1 ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    step === 2 ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    'bg-green-50 text-green-600 border-green-200'
                                                }`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Visual Progress Timeline */}
                                            <div className="relative">
                                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                                                    <div style={{ width: `${(step / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-500 transition-all duration-1000"></div>
                                                </div>
                                                <div className="flex justify-between text-xs font-semibold text-gray-400">
                                                    <div className={`flex flex-col items-center ${step >= 1 ? 'text-cyan-600' : ''}`}>
                                                        <ClipboardList className="w-4 h-4 mb-1" />
                                                        Placed
                                                    </div>
                                                    <div className={`flex flex-col items-center ${step >= 2 ? 'text-cyan-600' : ''}`}>
                                                        <ChefHat className="w-4 h-4 mb-1" />
                                                        Preparing
                                                    </div>
                                                    <div className={`flex flex-col items-center ${step >= 3 ? 'text-cyan-600' : ''}`}>
                                                        <CheckCircle2 className="w-4 h-4 mb-1" />
                                                        Ready/Cooked
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Floor Status Quick View */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Floor Status</h3>
                            <button onClick={() => navigate('/operator/tables')} className="text-sm font-semibold text-cyan-600 hover:text-cyan-700">View Map</button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-[600px]">
                            {tables?.map(table => (
                                <div 
                                    key={table.id} 
                                    onClick={() => navigate('/operator/tables')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1 ${
                                        table.status === 'Available' ? 'bg-white border-emerald-100 hover:border-emerald-400 shadow-sm' :
                                        table.status === 'Occupied' ? 'bg-red-50/30 border-red-200 hover:border-red-400 shadow-sm' :
                                        table.status === 'Cleaning' ? 'bg-blue-50/30 border-blue-200 hover:border-blue-400 shadow-sm' :
                                        'bg-orange-50/30 border-orange-200 hover:border-orange-400 shadow-sm'
                                    }`}
                                >
                                    <span className="font-black text-gray-900 text-xl mb-2">{table.table_number}</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        table.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                                        table.status === 'Occupied' ? 'bg-red-100 text-red-800' :
                                        table.status === 'Cleaning' ? 'bg-blue-100 text-blue-800' :
                                        'bg-orange-100 text-orange-800'
                                    }`}>
                                        {table.status}
                                    </span>
                                </div>
                            ))}
                            {(!tables || tables.length === 0) && (
                                <div className="col-span-full py-8 text-center text-gray-400">
                                    No tables configured yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
