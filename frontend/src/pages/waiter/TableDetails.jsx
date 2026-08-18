import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Plus, Utensils, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';
import api from '../../services/api';
import OrderTimeline from '../../components/waiter/OrderTimeline';

export default function TableDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const {tableId} = useParams();
    const id = tableId || 'T01';

    const {customerName, guests, isNewSession} = location.state || {};
    
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Transfer Table State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [availableTables, setAvailableTables] = useState([]);
    const [isTransferring, setIsTransferring] = useState(false);

    
    const handleClearTable = async () => {
        if (!window.confirm("Are you sure you want to free up this table?")) return;
        try {
            await api.post(`/waiter/tables/${id}/clear`);
            toast.success("Table cleared");
            navigate('/waiter/tables');
        } catch (error) {
            console.error(error);
            toast.error("Failed to clear table");
        }
    };

    useEffect(() => {
        if (isTransferModalOpen) {
            fetchAvailableTables();
        }
    }, [isTransferModalOpen]);

    const fetchAvailableTables = async () => {
        try {
            const tables = await waiterApi.getTables();
            // Assuming waiterApi.getTables returns all tables, filter for available ones
            setAvailableTables(tables.filter(t => t.status === 'Available' || t.status === 'available'));
        } catch (err) {
            console.error("Failed to fetch tables", err);
            toast.error("Failed to load tables");
        }
    };

    const handleTransfer = async (targetTableId) => {
        if (!sessionData?.session_id) return;
        setIsTransferring(true);
        try {
            await waiterApi.transferSession(sessionData.session_id, targetTableId);
            toast.success(`Transferred to Table ${targetTableId}`);
            setIsTransferModalOpen(false);
            navigate('/waiter/tables');
        } catch (err) {
            toast.error(err.response?.data?.detail || "Transfer failed");
        } finally {
            setIsTransferring(false);
        }
    };

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await waiterApi.getActiveSession(id);
                if (data && data.session_id) {
                    setSessionData(data);
                } else {
                    setSessionData(null);
                }
            } catch (err) {
                console.error("Failed to load session", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    const displayName = customerName || (sessionData ? 'Guest' : 'Rahul Sharma');
    const displayGuests = sessionData?.guests || guests || 4;
    const seatedTime = isNewSession ? 'Just now' : 'Active';
    const activeOrders = sessionData?.orders || [];

 return (
 <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">


 <div className="relative z-10 flex flex-col min-h-screen">
 <div className="bg-white/10 backdrop-blur-xl px-4 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20">
 <button onClick={() => navigate('/waiter/tables')} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
 <ArrowLeft className="h-5 w-5"/>
 </button>
 <div>
 <h1 className="text-lg font-black text-gray-800">Table {id}</h1>
 <p className="text-xs text-gray-600 font-medium">{displayName} • {displayGuests} Guests</p>
 </div>
 </div>

 <div className="px-4 py-6 w-full space-y-6 pb-24">
 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-black text-gray-800">Session Info</h2>
 <span className="bg-amber-500/10 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200/50">Occupied</span>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
 <Clock className="h-5 w-5 text-gray-500 mb-2"/>
 <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Seated Time</p>
 <p className="text-[15px] font-bold text-gray-800">{seatedTime}</p>
 </div>
 <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
 <Users className="h-5 w-5 text-gray-500 mb-2"/>
 <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Guests</p>
 <p className="text-[15px] font-bold text-gray-800">{displayGuests} People</p>
 </div>
 </div>
 </div>

 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-black text-gray-800">Active Orders</h2>
 {!isNewSession ? <button onClick={() => navigate('/waiter/tables/'+id+'/history')} className="text-xs font-bold text-teal-600">View History</button> : null}
 </div>
 
 {isNewSession || activeOrders.length === 0 ? (
 <div className="p-6 text-center text-gray-500 bg-white/10 backdrop-blur-md rounded-2xl border border-white/40 border-dashed">
 <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-400 opacity-50"/>
 <p className="text-sm font-bold text-gray-600">No active orders yet.</p>
 <p className="text-xs text-gray-500 mt-1">Tap Add Items to take the first order.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {activeOrders.map(order => (
 <div key={order.id} className="p-4 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md transition-colors">
 <div className="flex justify-between items-center mb-2">
 <span className="font-bold text-gray-800 text-sm">Order #{order.id}</span>
 <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 border border-rose-200/50">{order.status}</span>
 </div>
 <div className="text-xs text-gray-600 font-medium mb-3">
 {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
 </div>
 <OrderTimeline status={order.status} />
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="grid grid-cols-2 gap-3">
 <button 
     onClick={() => navigate(`/waiter/tables/${id}/menu`, { state: { tableId: id, sessionId: sessionData?.session_id } })} 
     className="flex items-center justify-center bg-white/20 backdrop-blur-xl border border-rose-200/80 text-rose-600 rounded-2xl py-3 px-2 font-bold shadow-sm transition-all text-sm disabled:opacity-50" 
     disabled={loading || sessionData?.bill_requested}>
 <div className="bg-rose-100/50 p-1.5 rounded-full mr-2 transition-colors">
 <Plus className="h-4 w-4"/>
 </div>
 Add Items
 </button>
 <button 
     onClick={async () => {
         if(!sessionData?.session_id) return;
         try {
             await waiterApi.requestBill(sessionData.session_id);
             toast.success('Bill requested successfully!');
             setSessionData({...sessionData, bill_requested: true});
         } catch (e) {
             toast.error('Failed to request bill');
         }
     }} 
     disabled={sessionData?.bill_requested || loading}
     className={`flex items-center justify-center text-white rounded-2xl py-3 px-2 font-bold shadow-sm transition-all border text-sm disabled:opacity-50 ${sessionData?.bill_requested ? 'bg-gray-400 border-gray-400' : 'bg-gradient-to-br from-rose-400 to-rose-500 border-rose-300/50'}`}>
 <Receipt className="h-4 w-4 mr-2"/>
 {sessionData?.bill_requested ? 'Bill Requested' : 'Request Bill'}
 </button>
 </div>
 
 {sessionData?.session_id && (
    <div className="mt-3">
        <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full flex items-center justify-center bg-white/20 backdrop-blur-xl border border-indigo-200/80 text-indigo-600 rounded-2xl py-3 px-2 font-bold shadow-sm transition-all text-sm"
        >
            Transfer Table
        </button>
    </div>
 )}
 </div>
 </div>

 {isTransferModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Transfer to Table</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
                {availableTables.map(t => (
                    <button 
                        key={t.id}
                        onClick={() => handleTransfer(t.id)}
                        disabled={isTransferring}
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 font-bold disabled:opacity-50"
                    >
                        Table {t.id} (Capacity: {t.capacity})
                    </button>
                ))}
                {availableTables.length === 0 && (
                    <p className="text-gray-500 text-sm text-center">No available tables.</p>
                )}
            </div>
            <button 
                onClick={() => setIsTransferModalOpen(false)}
                className="mt-4 w-full p-3 rounded-xl bg-gray-100 text-gray-700 font-bold"
            >
                Cancel
            </button>
        </div>
    </div>
 )}
 </div>
 );
}
