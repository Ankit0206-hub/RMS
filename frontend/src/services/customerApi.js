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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404)) {
            // Only force clear session if it's an authorization/session-level error, wait, 404 might be for specific entities, not just session.
            // Let's only do it for 401/403.
            if (error.response.status === 401 || error.response.status === 403) {
                localStorage.removeItem('customer_token');
                localStorage.removeItem('customerSession');
                // Redirect if not already on the splash/landing page
                if (!window.location.pathname.match(/^\/customer(\/landing)?$/)) {
                    window.location.href = '/customer';
                }
            }
        }
        return Promise.reject(error);
    }
);

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

    getGlobalOrderHistory: async (sessionId) => {
        const response = await api.get(`/sessions/${sessionId}/orders/history`);
        return response.data;
    },

    // Billing
    requestBill: async (sessionId) => {
        const response = await api.post(`/sessions/${sessionId}/request-bill`);
        return response.data;
    },

    // Assistance
    callWaiter: async (sessionId, requestType, message) => {
        const response = await api.post(`/sessions/${sessionId}/call-waiter`, { request_type: requestType, message });
        return response.data;
    },

    // Reviews
    submitReview: async (data) => {
        const response = await api.post(`/reviews`, data);
        return response.data;
    }
};

export default customerApi;
