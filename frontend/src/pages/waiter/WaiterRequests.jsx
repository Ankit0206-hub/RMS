import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Bell, Clock, Info, Loader2} from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';
import { getWsUrl } from '../../services/api';

export default function WaiterRequests() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Active');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await waiterApi.getRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        const token = localStorage.getItem('token');
        const wsUrl = `${getWsUrl()}/ws/waiter?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'CUSTOMER_NEEDS_ASSISTANCE' || data.event === 'CUSTOMER_REQUESTED_BILL' || data.event === 'WAITER_REQUESTED_BILL') {
                    fetchRequests();
                    toast.success(`New request from Table ${data.payload?.table_id || 'Unknown'}`);
                }
            } catch (error) {
                console.error("Error parsing websocket message", error);
            }
        };

        return () => ws.close();
    }, []);

    const filteredRequests = activeTab === 'Active' ? requests.filter(r => r.status === 'Active') : requests.filter(r => r.status === 'Resolved');

    const handleResolve = async (id) => {
        try {
            await waiterApi.resolveRequest(id);
            setRequests(requests.map(r => r.id === id ? {...r, status: 'Resolved'} : r));
            toast.success('Request marked as resolved!');
        } catch (error) {
            console.error("Failed to resolve:", error);
            toast.error("Failed to resolve request");
        }
    };

    const handleViewTable = (id, tableId) => {
        navigate(`/waiter/tables/${tableId}`);
        toast.success('Navigated to table!');
        handleResolve(id);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-center shadow-sm sticky top-0 z-20 border-b border-white/20 w-full shrink-0">
                    <div className="flex items-center w-full mx-auto relative justify-center">
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Requests</h1>
                        <button onClick={() => navigate('/waiter/notifications')} className="absolute right-0 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center transition-colors border border-white/40 shadow-sm">
                            <Bell className="h-5 w-5 text-gray-700"/>
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white/50"></span>
                        </button>
                    </div>
                </div>

                <div className="px-4 md:px-8 mt-4 flex-1 space-y-6 w-full pb-24 max-w-7xl mx-auto">
                    <div className="flex space-x-2 md:max-w-md">
                        <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab === 'Active' ? 'bg-rose-400/90 backdrop-blur-md text-white border-rose-400' : 'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'}`}>Active ({requests.filter(r => r.status === 'Active').length})</button>
                        <button onClick={() => setActiveTab('Resolved')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab === 'Resolved' ? 'bg-rose-400/90 backdrop-blur-md text-white border-rose-400' : 'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'}`}>Resolved ({requests.filter(r => r.status === 'Resolved').length})</button>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredRequests.map(request => (
                                <div key={request.id} className="bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border border-white/40 flex flex-col transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1.5">
                                                <h3 className="text-lg font-black text-gray-800">{request.type}</h3>
                                                <span className="bg-teal-500/10 text-teal-700 font-bold px-2 py-0.5 rounded-md text-xs border border-teal-200/50 backdrop-blur-md">Table {request.table}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 font-bold"><Clock className="h-3.5 w-3.5 mr-1"/> {request.time}</div>
                                        </div>
                                    </div>
                                    
                                    {request.message && (
                                        <div className="bg-amber-500/10 rounded-xl p-3 mb-4 flex items-start border border-amber-200/50 backdrop-blur-md">
                                            <Info className="h-4 w-4 text-amber-600 mr-2 shrink-0 mt-0.5"/>
                                            <p className="text-sm font-bold text-amber-800">{request.message}</p>
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto">
                                        {request.status === 'Active' && (
                                            <div className="border-t border-white/30 pt-4 mt-2">
                                                {request.type === 'Bill Request' ? (
                                                    <button onClick={() => handleViewTable(request.id, request.table)} className="w-full bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-xl py-3 font-bold text-sm shadow-sm active:scale-95 transition-all border border-rose-300/50">View Table</button>
                                                ) : (
                                                    <button onClick={() => handleResolve(request.id)} className="w-full bg-white/30 backdrop-blur-md text-rose-500 border border-white/40 rounded-xl py-3 font-bold text-sm shadow-sm transition-colors">Mark Resolved</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredRequests.length === 0 && <div className="col-span-full text-center py-12 text-gray-500 font-bold bg-white/20 backdrop-blur-xl rounded-[24px] border border-white/40">No {activeTab.toLowerCase()} requests.</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
