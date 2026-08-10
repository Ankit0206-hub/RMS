import React from 'react';
import { Check } from 'lucide-react';

export default function OrderTimeline({ status }) {
    const steps = [
        { id: 'Pending', label: 'Placed' },
        { id: 'Preparing', label: 'Preparing' },
        { id: 'Cooked', label: 'Ready' },
        { id: 'Served', label: 'Served' }
    ];

    const getStepStatus = (stepId) => {
        const statusMap = {
            'Pending': ['Pending', 'Preparing', 'Cooked', 'Served', 'Completed'],
            'Verification Pending': ['Verification Pending', 'Pending', 'Preparing', 'Cooked', 'Served', 'Completed'],
            'Preparing': ['Preparing', 'Cooked', 'Served', 'Completed'],
            'Cooked': ['Cooked', 'Served', 'Completed'],
            'Served': ['Served', 'Completed'],
            'Completed': ['Completed']
        };
        
        let normalizedStatus = status;
        if (status === 'Verification Pending') normalizedStatus = 'Pending';
        
        const activeMap = {
            'Pending': 'Pending',
            'Preparing': 'Preparing',
            'Cooked': 'Cooked',
            'Served': null,
            'Completed': null 
        };

        if (status === 'Completed' || status === 'Cancelled') {
            return statusMap[stepId] && statusMap[stepId].includes('Completed') ? 'completed' : 'completed';
        }

        if (activeMap[stepId] === normalizedStatus) return 'active';
        if (statusMap[stepId] && statusMap[stepId].includes(normalizedStatus) && activeMap[stepId] !== normalizedStatus) return 'completed';
        return 'pending';
    };

    return (
        <div className="flex items-center justify-between w-full mt-4 px-1">
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(step.id);
                const isLast = index === steps.length - 1;
                
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 text-[10px] shadow-sm transition-all duration-300 ${
                                stepStatus === 'completed' ? 'bg-teal-500 border-teal-500 text-white' :
                                stepStatus === 'active' ? 'bg-white border-teal-500 text-teal-500 ring-4 ring-teal-500/10' :
                                'bg-white border-gray-200 text-gray-300'
                            }`}>
                                {stepStatus === 'completed' ? <Check size={14} strokeWidth={3} /> : 
                                 stepStatus === 'active' ? <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-teal-500" /> : null}
                            </div>
                            <span className={`text-[9px] md:text-[11px] font-bold mt-1.5 transition-colors ${
                                stepStatus === 'completed' || stepStatus === 'active' ? 'text-gray-700' : 'text-gray-400'
                            }`}>{step.label}</span>
                        </div>
                        
                        {!isLast && (
                            <div className={`flex-1 h-[2px] -mt-5 md:-mt-6 mx-1 md:mx-2 rounded-full transition-colors duration-300 ${
                                stepStatus === 'completed' ? 'bg-teal-500' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
