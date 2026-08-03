import api from './api';

export const kitchenApi = {
    getStats: async () => {
        const response = await api.get('/kitchen/stats');
        return response.data;
    },
    getOrders: async () => {
        const response = await api.get('/kitchen/orders');
        return response.data;
    },
    getPreparedItems: async () => {
        const response = await api.get('/kitchen/prepared');
        return response.data;
    },
    updateItemStatus: async (itemId, status) => {
        const response = await api.patch(`/kitchen/items/${itemId}/status`, { status });
        return response.data;
    },
    updateOrderItemsStatus: async (orderId, status) => {
        const response = await api.patch(`/kitchen/orders/${orderId}/status`, { status });
        return response.data;
    }
};

export default kitchenApi;
