import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const WaiterDashboard = () => {
    const { data: waiterData, isLoading } = useQuery({
        queryKey: ['waiter_me'],
        queryFn: async () => {
            const res = await api.get('/waiter/me');
            return res.data;
        }
    });

    if (isLoading) return <div className="text-gray-900">Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Waiter Dashboard</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <p className="text-gray-500">Welcome back, {waiterData?.employee_code}</p>
                <p className="text-gray-500 mt-2">Check your assigned tables and confirm orders here.</p>
            </div>
        </div>
    );
};

export default WaiterDashboard;
