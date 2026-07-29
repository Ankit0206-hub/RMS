import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft, CheckCircle2, UserPlus, BellRing, ClipboardList, Receipt, Loader2} from 'lucide-react';
import waiterApi from '../../services/waiterApi';
import toast from 'react-hot-toast';

export default function WaiterNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await waiterApi.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const token = localStorage.getItem('token');
        const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/waiter?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'NEW_NOTIFICATION') {
                    fetchNotifications();
                    toast.success('New Notification received!');
                }
            } catch (error) {
                console.error("Error parsing websocket message", error);
            }
        };

        return () => ws.close();
    }, []);

    const handleMarkRead = async (id, isRead) => {
        if (isRead) return;
        try {
            await waiterApi.markNotificationRead(id);
            setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };
    
    const getIcon = (type) => {
        switch(type) {
            case 'ORDER_READY': return { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-500/10 border-teal-200/50' };
            case 'NEW_ORDER': return { icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-200/50' };
            case 'BILL_REQUEST': return { icon: Receipt, color: 'text-rose-600', bg: 'bg-rose-500/10 border-rose-200/50' };
            case 'CUSTOMER_ASSISTANCE': return { icon: BellRing, color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200/50' };
            default: return { icon: UserPlus, color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-200/50' };
        }
    };
    
    const formatTime = (timeStr) => {
        const date = new Date(timeStr);
        const diff = (new Date() - date) / 60000; // in mins
        if (diff < 1) return 'Just Now';
        if (diff < 60) return `${Math.floor(diff)} mins ago`;
        return `${Math.floor(diff/60)} hours ago`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4  py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                    <div className="relative flex items-center w-full  mx-auto justify-center">
                        <button onClick={() => navigate('/waiter/tables')} className="absolute left-0 p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors shadow-sm">
                            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                        <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Notifications</h1>
                    </div>
                </div>

                <div className="px-4 md:px-8 mt-4 md:mt-8 flex-1 space-y-4 w-full pb-24 mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 font-bold bg-white/20 backdrop-blur-xl rounded-[24px] border border-white/40">No notifications yet.</div>
                    ) : (
                        notifications.map(notif => {
                            const style = getIcon(notif.type);
                            const IconCmp = style.icon;
                            return (
                                <div key={notif.id} onClick={() => handleMarkRead(notif.id, notif.is_read)} className={`bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border flex items-start transition-colors cursor-pointer ${!notif.is_read ? 'border-white/60 bg-white/30' : 'border-white/40 opacity-75'}`}>
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border backdrop-blur-md ${style.bg}`}>
                                        <IconCmp className={`h-6 w-6 ${style.color}`} />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-[15px] md:text-base font-black text-gray-800">{notif.title}</h3>
                                        <p className="text-sm md:text-[15px] text-gray-600 mt-1 font-bold leading-snug">{notif.message}</p>
                                        <p className="text-xs text-gray-500 mt-2 font-bold">{formatTime(notif.time)}</p>
                                    </div>
                                    {!notif.is_read && <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mt-2 ring-4 ring-rose-500/20 shadow-sm"></div>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
