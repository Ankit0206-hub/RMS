export const getOrderStatusMap = (currentStatus) => {
    const stepOrder = ["Order Placed", "Confirmed", "Preparing", "Ready to Serve", "Served"];
    const backendStatusMap = {
        "Placed": 0,
        "Pending": 0,
        "Confirmed": 1,
        "Preparing": 2,
        "Cooked": 3,
        "Served": 4,
        "Completed": 4,
        "Delivered": 4
    };
    
    const currentIdx = backendStatusMap[currentStatus] ?? 0;

    return (stepName) => {
        const stepIdx = stepOrder.indexOf(stepName);
        if (stepIdx < currentIdx) return "completed";
        if (stepIdx === currentIdx) return "completed"; // as requested, tick marked immediately
        return "pending";
    };
};
