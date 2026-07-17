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
            case 'new_order': return <ChefHat size={20} className="text-[#0f5132]" />;
            case 'addition': return <FilePlus size={20} className="text-amber-600" />;
            case 'picked_up': return <CheckCircle size={20} className="text-blue-600" />;
            default: return <Bell size={20} className="text-gray-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'new_order': return 'bg-[#f0f9f4] border-[#0f5132]/20';
            case 'addition': return 'bg-amber-50 border-amber-200';
            case 'picked_up': return 'bg-blue-50 border-blue-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-800 font-bold text-lg">Notifications</h2>
                <button className="text-[#0f5132] font-bold text-sm">Mark all read</button>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-3">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={`p-4 rounded-xl shadow-sm border flex items-start gap-4 ${getBgColor(notif.type)} ${!notif.read ? 'opacity-100' : 'opacity-70'}`}
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                            {getIcon(notif.type)}
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900">{notif.title}</span>
                                {!notif.read && <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0"></span>}
                            </div>
                            <span className="text-gray-700 font-medium text-sm leading-snug">{notif.message}</span>
                            <span className="text-gray-500 text-xs font-semibold mt-2">{notif.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
