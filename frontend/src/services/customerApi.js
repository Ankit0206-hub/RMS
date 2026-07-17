import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1/customer',
    headers: {
        'Content-Type': 'application/json',
    }
});

export const customerApi = {
    // Tables
    getTables: async () => {
        const response = await api.get('/tables');
        return response.data;
    },
    
    // Sessions
    startSession: async (data) => {
        const response = await api.post('/sessions', data);
        return response.data;
    },

    // Menu
    getMenu: async () => {
        const response = await api.get('/menu');
        return response.data;
    },

    // Orders
    createOrder: async (sessionId, data) => {
        const response = await api.post(`/sessions/${sessionId}/orders`, data);
        return response.data;
    },

    // Session Details
    getSessionDetails: async (sessionId) => {
        const response = await api.get(`/sessions/${sessionId}`);
        return response.data;
    },

    // Billing
    requestBill: async (sessionId) => {
        const response = await api.post(`/sessions/${sessionId}/request-bill`);
        return response.data;
    }
};

export default customerApi;
