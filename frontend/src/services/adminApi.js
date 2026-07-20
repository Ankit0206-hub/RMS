import api from './api';

export const adminApi = {
    // Reservations
    getReservations: async (page = 1, pageSize = 100) => {
        const response = await api.get('/admin/reservations', {
            params: { page, page_size: pageSize }
        });
        return response.data;
    },
    createReservation: async (data) => {
        const response = await api.post('/admin/reservations', data);
        return response.data;
    },
    updateReservation: async (id, data) => {
        const response = await api.put(`/admin/reservations/${id}`, data);
        return response.data;
    },
    deleteReservation: async (id) => {
        const response = await api.delete(`/admin/reservations/${id}`);
        return response.data;
    },

    // Tables
    getTables: async (page = 1, pageSize = 100) => {
        const response = await api.get('/admin/tables/', {
            params: { page, page_size: pageSize }
        });
        return response.data;
    },
    mergeTables: async (tableIds) => {
        const response = await api.post('/admin/tables/merge', { table_ids: tableIds });
        return response.data;
    }
};
