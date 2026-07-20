import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1/customer',
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('customer_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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
    },

    // Assistance
    callWaiter: async (sessionId, requestType) => {
        const response = await api.post(`/sessions/${sessionId}/call-waiter`, { request_type: requestType });
        return response.data;
    }
};

export default customerApi;
