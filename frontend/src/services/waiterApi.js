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

    // Menu
    getMenu: async () => {
        const response = await api.get('/waiter/menu');
        return response.data;
    },

    // Orders
    createOrder: async (sessionId, data) => {
        const response = await api.post(`/waiter/sessions/${sessionId}/orders`, data);
        return response.data;
    }
};

export default waiterApi;
