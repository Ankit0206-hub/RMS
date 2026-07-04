import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

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
        const wsUrl = `ws://localhost:8000/api/v1/ws/${channel}?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`Connected to WebSocket channel: ${channel}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket event received:", data);

                if (data.event === 'order.created') {
                    toast.success(`New order #${data.payload.id} received!`);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
                } else if (data.event === 'order.updated') {
                    toast(`Order #${data.payload.id} status updated to ${data.payload.status}`, {
                        icon: 'ℹ️',
                    });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
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
            ws.close();
        };
    }, [user, queryClient]);

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
