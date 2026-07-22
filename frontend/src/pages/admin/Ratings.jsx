import React, { useState } from 'react';
import { 
    Search, Filter, Eye, Star, Utensils
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { DataTable, Pagination } from '../../components/ui';

const Ratings = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: reviewsResponse, isLoading } = useQuery({
        queryKey: ['adminReviews', currentPage, itemsPerPage],
        queryFn: async () => {
            const response = await adminApi.getReviews(currentPage, itemsPerPage);
            return response;
        }
    });

    const reviewsData = React.useMemo(() => {
        if (!reviewsResponse?.data) return [];
        let data = reviewsResponse.data.map(review => ({
            id: review.id,
            name: review.customer_name || 'Walk-in Customer',
            rating: review.rating,
            comment: review.comment || '-',
            date: review.created_at ? new Date(review.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            itemReviews: review.item_reviews || []
        }));

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(r => r.name.toLowerCase().includes(lowerSearch));
        }
        return data;
    }, [reviewsResponse, searchTerm]);

    const totalReviews = reviewsResponse?.meta?.total || 0;

    const columns = [
        { 
            header: "#", 
            cell: (row) => <span className="text-gray-900 dark:text-white font-semibold text-xs">{row.id}</span> 
        },
        { 
            header: "Customer Name", 
            cell: (row) => <span className="text-gray-900 dark:text-white font-bold text-[11px]">{row.name}</span> 
        },
        { 
            header: "Overall Rating", 
            cell: (row) => (
                <div className="flex items-center">
                    <span className="text-gray-900 dark:text-white font-bold text-[11px] mr-1">{row.rating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                </div>
            )
        },
        { 
            header: "Comment", 
            cell: (row) => <span className="text-gray-600 dark:text-slate-400 font-semibold text-[11px] truncate max-w-[200px] inline-block">{row.comment}</span> 
        },
        { 
            header: "Date", 
            cell: (row) => <span className="text-gray-600 dark:text-slate-400 font-semibold text-[11px]">{row.date}</span> 
        },
        { 
            header: "Actions", 
            className: "text-right",
            cellClassName: "text-right",
            cell: (row) => (
                <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => setSelectedReview(row)}
                        className={`p-1.5 rounded-lg transition-colors ${selectedReview?.id === row.id ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}`}
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 pb-6 font-inter">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Ratings & Reviews</h1>
            
            <div className={`flex flex-col xl:flex-row gap-6 items-start ${selectedReview ? '' : 'w-full'}`}>
                
                {/* Data Table */}
                <div className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col w-full transition-colors ${selectedReview ? 'xl:w-1/2 2xl:w-3/5' : ''}`}>
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search by customer name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-80 transition-all font-medium placeholder-gray-400 dark:placeholder-slate-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                        <DataTable 
                            columns={columns} 
                            data={reviewsData} 
                            isLoading={isLoading} 
                            emptyMessage="No reviews found." 
                        />
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalItems={totalReviews}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                        itemName="reviews"
                    />
                </div>

                {/* Right Side: Details Drawer */}
                {selectedReview && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden transition-opacity" 
                            onClick={() => setSelectedReview(null)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0 xl:static xl:w-1/2 2xl:w-2/5 xl:max-w-none xl:rounded-xl xl:shadow-sm xl:border xl:border-gray-100 xl:dark:border-slate-800 xl:transform-none xl:z-0 xl:h-auto">
                            
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Review Details</h2>
                                    <button 
                                        onClick={() => setSelectedReview(null)}
                                        className="rounded-lg p-2 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{selectedReview.name}</h3>
                                        <div className="flex items-center">
                                            <span className="text-gray-900 dark:text-white font-bold mr-1">{selectedReview.rating.toFixed(1)}</span>
                                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 italic">"{selectedReview.comment}"</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-semibold">{selectedReview.date}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 p-6 rounded-b-xl transition-colors">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Items Rated</h3>
                                {selectedReview.itemReviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedReview.itemReviews.map((ir, idx) => (
                                            <div key={idx} className="flex items-start justify-between bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                                        <Utensils className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{ir.menu_item_name || `Item #${ir.menu_item_id}`}</p>
                                                        {ir.comment && <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 max-w-[200px] truncate">{ir.comment}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white mr-1">{ir.rating.toFixed(1)}</span>
                                                    <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-slate-400">No specific items were rated in this review.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Ratings;
