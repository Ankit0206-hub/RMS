import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getWsUrl } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { playNotificationSound } from '../utils/audio';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || !user.role) return;

        // Skip customer websocket connection here, they connect via session_id on the QR page
        if (user.role === 'customer') return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Determine correct channel based on role
        let channel = user.role;
        // Connect to websocket
        const wsUrl = `${getWsUrl()}/ws/${channel}?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`Connected to WebSocket channel: ${channel}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket event received:", data);

                if (data.event === 'order.created') {
                    playNotificationSound();
                    toast.success(`New order #${data.payload.id} received!`);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['sessions'] });
                    queryClient.invalidateQueries({ queryKey: ['analytics_dashboard'] });
                    queryClient.invalidateQueries({ queryKey: ['tables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminTables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
                    queryClient.invalidateQueries({ queryKey: ['kitchen_stats'] });
                } else if (data.event === 'order.updated') {
                    playNotificationSound();
                    toast(`Order #${data.payload.id} status updated to ${data.payload.status}`, {
                        icon: 'ℹ️',
                    });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['sessions'] });
                    queryClient.invalidateQueries({ queryKey: ['tables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminTables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
                    queryClient.invalidateQueries({ queryKey: ['kitchen_stats'] });
                } else if (data.event === 'bill.created') {
                    toast.success(`Bill generated for Table ${data.payload.table_number || data.payload.session_id}`);
                    queryClient.invalidateQueries({ queryKey: ['bills'] });
                    queryClient.invalidateQueries({ queryKey: ['sessions'] });
                    queryClient.invalidateQueries({ queryKey: ['analytics_dashboard'] });
                    queryClient.invalidateQueries({ queryKey: ['tables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminTables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
                } else if (data.event === 'ORDER_ITEM_UPDATED') {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['kitchen_stats'] });
                    queryClient.invalidateQueries({ queryKey: ['prepared_items'] });
                } else if (data.event === 'menu.updated') {
                    window.dispatchEvent(new Event('menuUpdated'));
                    queryClient.invalidateQueries({ queryKey: ['admin_menu'] }); // If admin uses it
                } else if (data.event === 'CUSTOMER_REQUESTED_BILL' || data.event === 'WAITER_REQUESTED_BILL') {
                    playNotificationSound();
                    toast(`Table ${data.payload.table_id} requested the bill!`, {
                        icon: '📝',
                    });
                    queryClient.invalidateQueries({ queryKey: ['tables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminTables'] });
                    queryClient.invalidateQueries({ queryKey: ['sessions'] });
                } else if (data.event === 'NEW_NOTIFICATION') {
                    queryClient.invalidateQueries({ queryKey: ['waiter_notifications'] });
                } else if (data.event === 'BILL_PAID') {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['tables'] });
                    queryClient.invalidateQueries({ queryKey: ['adminTables'] });
                    queryClient.invalidateQueries({ queryKey: ['sessions'] });
                    queryClient.invalidateQueries({ queryKey: ['bills'] });
                    queryClient.invalidateQueries({ queryKey: ['analytics_dashboard'] });
                }
            } catch (err) {
                console.error("Failed to parse websocket message", err);
            }
        };

        ws.onclose = () => {
            console.log(`Disconnected from WebSocket channel: ${channel}`);
        };

        setSocket(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            } else if (ws.readyState === WebSocket.CONNECTING) {
                // Wait for the connection to establish before closing to prevent the "closed before connection established" error
                ws.onopen = () => ws.close();
            } else {
                ws.close();
            }
        };
    }, [user, queryClient]);

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    );
};
