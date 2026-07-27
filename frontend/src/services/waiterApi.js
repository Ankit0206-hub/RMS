import api from './api';

export const waiterApi = {
    // Tables
    getTables: async () => {
        const response = await api.get('/waiter/tables');
        return response.data;
    },

    getActiveSession: async (tableId) => {
        const response = await api.get(`/waiter/tables/${tableId}/active_session`);
        return response.data;
    },

    startSession: async (tableId, data) => {
        const response = await api.post(`/waiter/tables/${tableId}/sessions`, data);
        return response.data;
    },

    requestBill: async (sessionId) => {
        const response = await api.post(`/waiter/sessions/${sessionId}/request-bill`);
        return response.data;
    },

    transferSession: async (sessionId, targetTableId) => {
        const response = await api.put(`/waiter/sessions/${sessionId}/transfer`, { target_table_id: targetTableId });
        return response.data;
    },

    // Menu
    getMenu: async () => {
        const response = await api.get('/waiter/menu');
        return response.data;
    },

    // Orders
    createOrder: async (sessionId, data) => {
        const response = await api.post(`/waiter/sessions/${sessionId}/orders`, data);
        return response.data;
    },

    getOrders: async () => {
        const response = await api.get('/admin/ordering/orders?page_size=50');
        return response.data;
    },

    getOrder: async (orderId) => {
        const response = await api.get(`/admin/ordering/orders/${orderId}`);
        return response.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/admin/ordering/orders/${orderId}/status`, { status });
        return response.data;
    },

    // Requests
    getRequests: async () => {
        const response = await api.get('/waiter/requests');
        return response.data;
    },

    resolveRequest: async (requestId) => {
        const response = await api.put(`/waiter/requests/${requestId}/resolve`);
        return response.data;
    },

    // Notifications
    getNotifications: async () => {
        const response = await api.get('/waiter/notifications');
        return response.data;
    },

    markNotificationRead: async (notificationId) => {
        const response = await api.put(`/waiter/notifications/${notificationId}/read`);
        return response.data;
    }
};

export default waiterApi;
