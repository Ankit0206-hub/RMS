import re

with open(r'f:\Vivek\kvon\RMS\frontend\src\pages\operator\OperatorReservations.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace renderChairs
old_renderChairs = """    const renderChairs = (seats, type) => {
        const chairs = [];
        if (type === 'horizontal' && seats === 4) {
            chairs.push(<div key="t1" className="absolute -top-1.5 left-4 w-6 h-3 bg-gray-200 rounded-t-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="t2" className="absolute -top-1.5 right-6 w-6 h-3 bg-gray-200 rounded-t-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="b1" className="absolute -bottom-1.5 left-4 w-6 h-3 bg-gray-200 rounded-b-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="b2" className="absolute -bottom-1.5 right-6 w-6 h-3 bg-gray-200 rounded-b-full transition-colors group-hover:bg-indigo-100"></div>);
        } else if (type === 'vertical' && seats === 6) {
            chairs.push(<div key="l1" className="absolute top-4 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="l2" className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="l3" className="absolute bottom-4 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r1" className="absolute top-4 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r2" className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r3" className="absolute bottom-4 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
        } else if (type === 'square' && seats === 2) {
            chairs.push(<div key="l1" className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r1" className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
        }
        return chairs;
    };"""

new_renderChairs = """    const renderChairs = (seats, status) => {
        const chairs = [];
        const topSeats = Math.ceil(seats / 2);
        const bottomSeats = Math.floor(seats / 2);
        
        const occupiedSeatsCount = status === 'Occupied' ? Math.max(1, seats - 1) : status === 'Reserved' ? seats : 0;
        let highlightedCount = 0;

        for (let i = 0; i < topSeats; i++) {
            const leftPct = (100 / (topSeats + 1)) * (i + 1);
            const isOccupied = highlightedCount < occupiedSeatsCount;
            if (isOccupied) highlightedCount++;
            const chairColor = (status === 'Reserved' && isOccupied) ? 'bg-amber-400' : (status === 'Occupied' && isOccupied) ? 'bg-cyan-400' : 'bg-gray-200 dark:bg-slate-700';
            
            chairs.push(<div key={`t${i}`} className={`absolute -top-1.5 w-6 h-3 rounded-t-full transition-colors group-hover:opacity-80 ${chairColor}`} style={{ left: `calc(${leftPct}% - 12px)` }}></div>);
        }
        for (let i = 0; i < bottomSeats; i++) {
            const leftPct = (100 / (bottomSeats + 1)) * (i + 1);
            const isOccupied = highlightedCount < occupiedSeatsCount;
            if (isOccupied) highlightedCount++;
            const chairColor = (status === 'Reserved' && isOccupied) ? 'bg-amber-400' : (status === 'Occupied' && isOccupied) ? 'bg-cyan-400' : 'bg-gray-200 dark:bg-slate-700';
            
            chairs.push(<div key={`b${i}`} className={`absolute -bottom-1.5 w-6 h-3 rounded-b-full transition-colors group-hover:opacity-80 ${chairColor}`} style={{ left: `calc(${leftPct}% - 12px)` }}></div>);
        }
        return chairs;
    };"""

content = content.replace(old_renderChairs, new_renderChairs)

# Replace the grid layout block
start_marker = "                        {/* Grid Layout matching the mockup */}"
end_marker = "                        {/* Merged Tables Section */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_grid = """                        {/* Dynamic Grid Layout matching Table Assignment */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-x-4 gap-y-8">
                            {[...floorPlanTables].sort((a, b) => a.seats - b.seats).map(table => {
                                const isSelectedForMerge = isMergeMode && selectedTablesForMerge.includes(table.dbId);
                                const isSelected = selectedTable === table.id && !isMergeMode;
                                
                                let borderClass = getStatusColor(table.status, table.isAvailableWithFutureRes).border;
                                let textClass = getStatusColor(table.status, table.isAvailableWithFutureRes).text;
                                
                                let colSpanClass = 'col-span-1';
                                if (table.seats >= 5 && table.seats <= 8) {
                                    colSpanClass = 'col-span-1 sm:col-span-2';
                                } else if (table.seats > 8) {
                                    colSpanClass = 'col-span-2 sm:col-span-3';
                                }
                                
                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        className={`relative w-full h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex ${colSpanClass}
                                            ${table.isMerged ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                            ${isSelectedForMerge ? 'ring-2 ring-amber-500 ring-offset-2 border-amber-200' : isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 border-indigo-200 dark:border-indigo-800' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        <div className={`w-3 shrink-0 rounded-l-2xl ${borderClass}`}></div>
                                        
                                        <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="text-gray-400 dark:text-slate-500 font-bold text-[10px] lg:text-[11px] 2xl:text-xs truncate w-full">{table.id}</span>
                                                <div className="flex space-x-1 items-center w-full">
                                                    <span className={`text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold ${textClass} truncate max-w-full`}>
                                                        {table.status} {table.isAvailableWithFutureRes && '(Now)'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col w-full">
                                                {table.guest ? (
                                                    <span className="text-gray-900 dark:text-white font-bold text-xs lg:text-[14px] 2xl:text-base truncate w-full block leading-tight">
                                                        {table.guest}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-slate-500 font-bold text-xs lg:text-[14px] 2xl:text-base truncate w-full block leading-tight italic opacity-60">
                                                        No Reservation
                                                    </span>
                                                )}
                                                {table.time && <span className="text-gray-500 dark:text-slate-400 text-[9px] font-bold mt-0.5">Res: {table.time}</span>}
                                            </div>
                                        </div>

                                        {renderChairs(table.seats, table.status)}
                                    </div>
                                );
                            })}
                        </div>

"""
    content = content[:start_idx] + new_grid + content[end_idx:]

with open(r'f:\Vivek\kvon\RMS\frontend\src\pages\operator\OperatorReservations.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
