import React from 'react';
import { Bell, FilePlus, ChefHat, CheckCircle } from 'lucide-react';

const Notifications = () => {
    // Dummy data based on spec
    const notifications = [
        { id: 1, type: 'new_order', title: 'New Order Received', message: 'Table T07 - Order #128', time: '2 min ago', read: false },
        { id: 2, type: 'addition', title: 'Additional Items Added', message: 'Table T02 added Ice Cream to Order #126', time: '15 min ago', read: false },
        { id: 3, type: 'picked_up', title: 'Order Picked Up', message: 'Waiter John picked up Order #125', time: '1 hour ago', read: true },
        { id: 4, type: 'system', title: 'System Notification', message: 'Shift change in 30 minutes.', time: '2 hours ago', read: true },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'new_order': return <ChefHat size={22} className="text-emerald-400" />;
            case 'addition': return <FilePlus size={22} className="text-amber-400" />;
            case 'picked_up': return <CheckCircle size={22} className="text-blue-400" />;
            default: return <Bell size={22} className="text-zinc-400" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'new_order': return 'bg-emerald-500/10 border-emerald-500/30';
            case 'addition': return 'bg-amber-500/10 border-amber-500/30';
            case 'picked_up': return 'bg-blue-500/10 border-blue-500/30';
            default: return 'bg-zinc-800/80 border-zinc-700/50';
        }
    };

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-4 min-h-screen bg-[#0f172a] text-zinc-100 font-sans w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Notifications
                </h2>
                <button className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                    Mark all read
                </button>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-4 max-w-4xl">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={`p-5 rounded-2xl shadow-lg border flex items-start gap-5 transition-all ${getBgColor(notif.type)} ${!notif.read ? 'opacity-100 hover:shadow-xl' : 'opacity-60'}`}
                    >
                        <div className="bg-zinc-900/80 p-3 rounded-xl shadow-inner border border-zinc-700/50 shrink-0">
                            {getIcon(notif.type)}
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className={`font-black text-lg ${notif.read ? 'text-zinc-400' : 'text-white'}`}>{notif.title}</span>
                                {!notif.read && <span className="w-3 h-3 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>}
                            </div>
                            <span className="text-zinc-300 font-bold text-base leading-snug">{notif.message}</span>
                            <span className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-3 block">{notif.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
