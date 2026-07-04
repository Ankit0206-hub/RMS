import React from 'react';

const PaymentMethods = () => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-[500px]">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Methods</h2>
                <p className="text-gray-500">Configure accepted payment gateways.</p>
            </div>
        </div>
    );
};

export default PaymentMethods;
