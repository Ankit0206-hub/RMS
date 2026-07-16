import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';

export default function WaiterNotifications() {
    const navigate = useNavigate();
    const notifications = [
        { id: 1, type: 'Order Ready', message: "Table T02's order #129 is ready to serve", time: '2 mins ago', icon: CheckCircle2, iconColor: 'text-green-500', iconBg: 'bg-green-100', unread: true },
        { id: 2, type: 'New Assigned Table', message: 'You have been assigned Table T05', time: '15 mins ago', icon: UserPlus, iconColor: 'text-orange-500', iconBg: 'bg-orange-100', unread: false }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-4 max-w-3xl mx-auto w-full pb-24">
                {notifications.map(notif => (
                    <div key={notif.id} className={`bg-white rounded-2xl p-4 shadow-sm border flex items-start ${notif.unread ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${notif.iconBg}`}><notif.icon className={`h-6 w-6 ${notif.iconColor}`} /></div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-[15px] font-bold text-gray-900">{notif.type}</h3>
                            <p className="text-sm text-gray-600 mt-0.5 font-medium leading-snug">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">{notif.time}</p>
                        </div>
                        {notif.unread && <div className="h-2.5 w-2.5 rounded-full bg-[#ff5722] mt-2"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
