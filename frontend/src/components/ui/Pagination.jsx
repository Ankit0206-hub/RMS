import React from 'react';

const Pagination = ({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange, 
    onItemsPerPageChange,
    itemName = "items"
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const renderPageButtons = () => {
        const buttons = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(i);
            }
        } else {
            // Complex logic for large number of pages
            if (currentPage <= 3) {
                buttons.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                buttons.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return buttons.map((btn, idx) => (
            <React.Fragment key={idx}>
                {btn === '...' ? (
                    <span className="px-1 text-gray-400">...</span>
                ) : (
                    <button
                        onClick={() => onPageChange(btn)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                            currentPage === btn 
                                ? 'bg-indigo-600 text-white font-bold shadow' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-200'
                        }`}
                    >
                        {btn}
                    </button>
                )}
            </React.Fragment>
        ));
    };

    return (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-medium bg-white gap-4 sm:gap-0">
            <div>
                Showing {startItem} to {endItem} of {totalItems} {itemName}
            </div>
            
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-400 transition-colors"
                >
                    &lt;
                </button>
                
                {renderPageButtons()}
                
                <button 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors"
                >
                    &gt;
                </button>
            </div>
            
            <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <div className="relative">
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="appearance-none border border-gray-200 rounded-md pl-2 pr-6 py-1 outline-none font-semibold text-gray-700 bg-white hover:border-gray-300 transition-colors cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Pagination };
