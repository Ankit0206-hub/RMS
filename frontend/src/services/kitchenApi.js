import api from './api';

export const kitchenApi = {
    getOrders: async (status) => {
        const url = status ? `/admin/ordering/orders?status=${status}&page_size=50` : '/admin/ordering/orders?page_size=50';
        const response = await api.get(url);
        return response.data;
    },
    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/admin/ordering/orders/${orderId}/status`, { status });
        return response.data;
    }
};

export default kitchenApi;
