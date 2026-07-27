import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    MessageSquare, Star, Search, Filter, 
    ThumbsUp, Calendar, ChevronLeft, ChevronRight,
    TrendingUp
} from 'lucide-react';

const OperatorTestimonials = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('All Ratings');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 12;

    const { data: reviewsResponse, isLoading } = useQuery({
        queryKey: ['adminReviews'],
        queryFn: async () => {
            const res = await api.get('/admin/reviews', { params: { page: 1, page_size: 100 } });
            return res.data;
        }
    });

    const reviewsData = reviewsResponse?.data || [];

    const filteredReviews = useMemo(() => {
        return reviewsData.filter(review => {
            const matchesSearch = (review.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRating = selectedRating === 'All Ratings' || review.rating === parseInt(selectedRating);

            return matchesSearch && matchesRating;
        });
    }, [reviewsData, searchTerm, selectedRating]);

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredReviews.length);
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    // KPIs
    const totalReviews = reviewsData.length;
    const averageRating = totalReviews > 0 
        ? (reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : 0;
    const fiveStarReviews = reviewsData.filter(r => r.rating === 5).length;
    const positivePercentage = totalReviews > 0 ? Math.round((reviewsData.filter(r => r.rating >= 4).length / totalReviews) * 100) : 0;

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star 
                key={index} 
                size={14} 
                className={index < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 dark:fill-slate-700 text-gray-200 dark:text-slate-700"} 
            />
        ));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Unknown';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-inter">Loading Testimonials...</div>;
    }

    return (
        <div className="font-inter min-h-[calc(100vh-64px)] pb-12">
            <div className="flex-1 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Customer Feedback</h1>
                        <p className="text-[13px] md:text-sm font-semibold text-gray-500 dark:text-slate-400 mt-1">Monitor ratings, reviews, and testimonials from your guests.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mr-4"><MessageSquare size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Total Reviews</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalReviews}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-500 mr-4"><Star size={20} className="fill-amber-500"/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Average Rating</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{averageRating} <span className="text-[13px] font-semibold text-gray-500">/ 5</span></h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mr-4"><ThumbsUp size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Positive Rate</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{positivePercentage}%</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500 mr-4"><TrendingUp size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">5-Star Reviews</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{fiveStarReviews}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search in reviews or by customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-[13px] font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                    
                    <div className="flex w-full md:w-auto gap-3">
                        <select
                            value={selectedRating}
                            onChange={(e) => {
                                setSelectedRating(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-[13px] font-semibold text-gray-700 dark:text-slate-200 outline-none cursor-pointer appearance-none min-w-[140px]"
                        >
                            <option>All Ratings</option>
                            <option value="5">5 Stars Only</option>
                            <option value="4">4 Stars Only</option>
                            <option value="3">3 Stars Only</option>
                            <option value="2">2 Stars Only</option>
                            <option value="1">1 Star Only</option>
                        </select>
                    </div>
                </div>

                {/* Reviews Grid */}
                {paginatedReviews.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-12 text-center">
                        <MessageSquare size={40} className="mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                        <p className="text-[14px] font-semibold text-gray-500 dark:text-slate-400">No testimonials found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {paginatedReviews.map((review) => (
                            <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                                            {(review.customer_name || 'G')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-gray-900 dark:text-white capitalize">{review.customer_name || 'Guest'}</h4>
                                            <div className="flex items-center text-[11px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
                                                <Calendar size={12} className="mr-1" />
                                                {formatDate(review.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {renderStars(review.rating || 0)}
                                    </div>
                                </div>
                                <p className="text-[13px] font-semibold text-gray-600 dark:text-slate-300 leading-relaxed flex-1 italic">
                                    "{review.comment || 'No comment provided.'}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-gray-500 dark:text-slate-400">
                            Showing {startIndex + 1} to {endIndex} of {filteredReviews.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center transition-colors"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center transition-colors"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatorTestimonials;
