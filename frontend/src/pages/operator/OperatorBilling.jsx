import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Search, 
    ChevronDown, 
    User, 
    Users, 
    Clock, 
    Trash2, 
    Info, 
    CheckCircle2, 
    Circle,
    Banknote,
    CreditCard,
    Smartphone,
    SplitSquareHorizontal,
    FileText,
    Receipt,
    Plus
} from 'lucide-react';

const Bills = () => {
    const queryClient = useQueryClient();
    const [mainTab, setMainTab] = useState('Active Bill');
    const [selectedBillId, setSelectedBillId] = useState(null);

    const { data: sessionsResponse } = useQuery({
        queryKey: ['operator-sessions'],
        queryFn: async () => {
            const res = await api.get('/admin/ordering/sessions?page_size=100');
            return res.data.data;
        }
    });

    const { data: billsResponse } = useQuery({
        queryKey: ['operator-bills'],
        queryFn: async () => {
            const res = await api.get('/admin/billing/bills?payment_status=Pending&page_size=100');
            return res.data.data;
        }
    });

    const activeBills = (sessionsResponse || [])
        .filter(s => s.status !== 'Completed')
        .map(session => {
            const startedAtDate = new Date(session.created_at);
            const startedAt = startedAtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const diffMs = new Date() - startedAtDate;
            const diffMins = Math.floor(diffMs / 60000);
            
            const matchingBill = (billsResponse || []).find(b => b.session_id === session.id);
            const status = matchingBill ? 'Billed' : (session.status === 'Active' ? 'Active' : 'Preparing');

            return {
                id: session.id,
                status,
                customer: session.customer_name || 'Walk-in',
                pax: session.number_of_people || 1,
                time: `${diffMins} min`,
                orderType: session.table_id ? 'Dine In' : 'Takeaway',
                startedAt,
                originalSession: session,
                billId: matchingBill?.id,
                matchingBill
            };
        });

    useEffect(() => {
        if (!selectedBillId && activeBills.length > 0) {
            setSelectedBillId(activeBills[0].id);
        }
    }, [activeBills, selectedBillId]);

    const selectedBillData = activeBills.find(b => b.id === selectedBillId);
    const selectedSession = selectedBillData?.originalSession;

    const currentItems = [];
    if (selectedSession) {
        selectedSession.orders.forEach(order => {
            if (order.status !== 'Cancelled') {
                order.items.forEach(item => {
                    const existing = currentItems.find(i => i.id === item.menu_item_id);
                    if (existing) {
                        existing.qty += item.quantity;
                    } else {
                        currentItems.push({
                            id: item.menu_item_id,
                            name: item.menu_item_name,
                            qty: item.quantity,
                            price: parseFloat(item.price_at_order),
                            img: item.menu_item_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                        });
                    }
                });
            }
        });
    }

    const handleQtyChange = (itemId, delta) => toast("Modify items in the Ordering page, not Billing", { icon: '⚠️' });
    const handleRemoveItem = (itemId) => toast("Modify items in the Ordering page, not Billing", { icon: '⚠️' });
    const handleAddWalkInBill = () => toast("Please start a new session from Dashboard/Tables", { icon: 'ℹ️' });

    // Right Column Calculations
    const matchingBill = selectedBillData?.matchingBill;
    const subtotal = matchingBill ? matchingBill.subtotal : currentItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const serviceCharge = matchingBill ? matchingBill.service_charge : subtotal * 0.05;
    const cgst = matchingBill ? (matchingBill.total_tax / 2) : subtotal * 0.025;
    const sgst = matchingBill ? (matchingBill.total_tax / 2) : subtotal * 0.025;
    const totalAmount = matchingBill ? (matchingBill.subtotal + matchingBill.service_charge + matchingBill.total_tax) : subtotal + serviceCharge + cgst + sgst;
    
    // Discount and Round off states per bill could be stored, but we use global for UI demo
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isRoundOff, setIsRoundOff] = useState(false);
    
    const discountAmount = totalAmount * (discountPercentage / 100);
    const totalAfterDiscount = totalAmount - discountAmount;
    
    const grandTotal = isRoundOff ? Math.round(totalAfterDiscount) : totalAfterDiscount;
    const roundOffDiff = isRoundOff ? (grandTotal - totalAfterDiscount) : 0;

    // Payment states
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
    const [paymentReceived, setPaymentReceived] = useState(grandTotal);

    // Keep payment received updated when total changes
    useEffect(() => {
        setPaymentReceived(grandTotal);
    }, [grandTotal]);

    const getStatusStyles = (status) => {
        switch(status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Preparing': return 'bg-orange-100 text-orange-700';
            case 'Billed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300';
        }
    };

    const generateBillMutation = useMutation({
        mutationFn: async (sessionId) => {
            const res = await api.post('/admin/billing/bills', { session_id: sessionId });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Bill generated successfully!');
            queryClient.invalidateQueries({ queryKey: ['operator-bills'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Error generating bill');
        }
    });

    const recordPaymentMutation = useMutation({
        mutationFn: async ({ billId, amount, method }) => {
            const res = await api.post(`/admin/billing/bills/${billId}/payments`, {
                amount,
                payment_method: method
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Payment recorded and session completed!');
            queryClient.invalidateQueries({ queryKey: ['operator-sessions'] });
            queryClient.invalidateQueries({ queryKey: ['operator-bills'] });
            setSelectedBillId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Error recording payment');
        }
    });

    // Button Handlers
    const handleGenerateBill = () => {
        if (!selectedBillId) return;
        generateBillMutation.mutate(selectedBillId);
    };

    const handlePrintKOT = () => toast.success("KOT sent to Kitchen Printer!");
    const handleHoldBill = () => toast("Bill placed on hold", { icon: '⏸️' });
    
    const handleProceedToBill = () => {
        if (!selectedBillData) return;
        if (!selectedBillData.billId) {
            toast.error("Please generate the bill first!");
            return;
        }
        
        recordPaymentMutation.mutate({
            billId: selectedBillData.billId,
            amount: paymentReceived,
            method: selectedPaymentMethod
        });
    };
    
    const handleAddItem = () => toast("Opening menu catalog...", { icon: '📋' });
    const handleChangeTable = () => toast("Select new table from Floor Plan", { icon: '🔀' });

    return (
        <div className="-m-6 p-6 font-inter h-full">
            <Toaster position="top-right" />
            
            {/* Header Tabs Section */}
            <div className="flex space-x-8 border-b border-gray-200 dark:border-slate-700 mb-6 px-2">
                <button 
                    onClick={() => setMainTab('Active Bill')}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${mainTab === 'Active Bill' ? 'text-indigo-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'}`}
                >
                    Active Bill
                    {mainTab === 'Active Bill' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => { setMainTab('Recent Bills'); toast("Recent Bills tab clicked"); }}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${mainTab === 'Recent Bills' ? 'text-indigo-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'}`}
                >
                    Recent Bills
                    {mainTab === 'Recent Bills' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* ----------------- LEFT COLUMN: Active Bills ----------------- */}
                <div className="w-full lg:w-1/4 flex flex-col space-y-4">
                    
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search table / order / customer..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative hover:opacity-80 transition-opacity">
                        <div className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex justify-between items-center cursor-pointer">
                            <div className="flex items-center space-x-2 text-indigo-600">
                                <Receipt className="w-4 h-4" />
                                <span className="text-xs font-bold">Dine In</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </div>
                    </div>

                    {/* Bills List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar pr-1">
                        {activeBills.map((bill) => {
                            const isSelected = bill.id === selectedBillId;
                            let billTotal = 0;
                            if (bill.matchingBill) {
                                billTotal = bill.matchingBill.subtotal;
                            } else if (bill.originalSession) {
                                bill.originalSession.orders.forEach(order => {
                                    if (order.status !== 'Cancelled') {
                                        order.items.forEach(item => {
                                            billTotal += parseFloat(item.price_at_order) * item.quantity;
                                        });
                                    }
                                });
                            }
                            // Add taxes approx for display
                            const displayTotal = billTotal > 0 ? (billTotal * 1.1).toFixed(2) : '0.00';

                            return (
                                <div 
                                    key={bill.id} 
                                    onClick={() => setSelectedBillId(bill.id)}
                                    className={`bg-white dark:bg-slate-900 rounded-xl p-4 border transition-all cursor-pointer ${isSelected ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500' : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">{bill.id}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyles(bill.status)}`}>
                                                {bill.status}
                                            </span>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">₹ {displayTotal}</p>
                                    </div>
                                    <div className="flex items-center space-x-1.5 text-gray-600 dark:text-slate-400 text-[11px] font-semibold mb-2">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{bill.customer}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-gray-500 dark:text-slate-400 text-[11px] font-semibold">
                                        <div className="flex items-center space-x-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{bill.pax} People</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{bill.time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* New Bill Button */}
                        <button 
                            onClick={handleAddWalkInBill}
                            className="w-full mt-2 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 active:bg-gray-100 dark:bg-slate-800 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            New Walk-in Bill
                        </button>
                    </div>

                </div>

                {/* ----------------- MIDDLE COLUMN: Order Details ----------------- */}
                {selectedBillData ? (
                    <div className="w-full lg:w-2/4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col">
                        
                        {/* Middle Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Table / Order Details</h2>
                                <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold">{selectedBillData.orderType}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">Table {selectedBillData.id}</span>
                                <button 
                                    onClick={handleChangeTable}
                                    className="px-3 py-1.5 border border-indigo-200 text-indigo-600 font-bold text-[11px] rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                                >
                                    Change Table
                                </button>
                            </div>
                        </div>

                        {/* Customer Info Meta */}
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">Customer</p>
                                <div className="flex items-center space-x-1.5 text-gray-900 dark:text-white font-semibold text-[11px]">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{selectedBillData.customer}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white mb-1">Pax</p>
                                <div className="flex items-center space-x-1.5 text-gray-900 dark:text-white font-semibold text-[11px]">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{selectedBillData.pax} People</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">Started At</p>
                                <div className="text-gray-900 dark:text-white font-semibold text-[11px]">{selectedBillData.startedAt}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">Order Type</p>
                                <div className="text-gray-900 dark:text-white font-semibold text-[11px]">{selectedBillData.orderType}</div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="p-5 flex-1 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Ordered Items ({currentItems.length})</h3>
                                <button 
                                    onClick={handleAddItem}
                                    className="flex items-center text-indigo-600 font-bold text-[11px] hover:text-indigo-800 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                                </button>
                            </div>

                            {/* List Header */}
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                <div className="col-span-6">Item</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Unit Price</div>
                                <div className="col-span-2 text-right pr-4">Amount</div>
                            </div>

                            {/* List Items */}
                            <div className="space-y-4 min-h-[150px]">
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 font-medium text-xs">No items ordered yet. Click "Add Item".</div>
                                ) : (
                                    currentItems.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center border-b border-gray-50 dark:border-slate-800/50 pb-4 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors p-1 -mx-1 rounded-lg">
                                            <div className="col-span-6 flex items-center space-x-3">
                                                <img src={item.img} alt={item.name} className="w-8 h-8 rounded-md object-cover border border-gray-200 dark:border-slate-700" />
                                                <span className="font-bold text-gray-900 dark:text-white text-[11px]">{item.name}</span>
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                                    <button 
                                                        onClick={() => handleQtyChange(item.id, -1)}
                                                        className="px-2 py-1 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-indigo-600 font-bold text-[11px] transition-colors"
                                                    >−</button>
                                                    <span className="px-2 text-[11px] font-bold text-gray-900 dark:text-white min-w-[20px] text-center">{item.qty}</span>
                                                    <button 
                                                        onClick={() => handleQtyChange(item.id, 1)}
                                                        className="px-2 py-1 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-indigo-600 font-bold text-[11px] transition-colors"
                                                    >+</button>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-right text-[11px] font-semibold text-gray-900 dark:text-white">
                                                ₹ {(item.price).toFixed(2)}
                                            </div>
                                            <div className="col-span-2 flex justify-end items-center space-x-3">
                                                <span className="text-[11px] font-bold text-gray-900 dark:text-white">₹ {(item.price * item.qty).toFixed(2)}</span>
                                                <button 
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Restaurant Note Input */}
                            <div className="mt-6 border-b border-gray-100 dark:border-slate-800 pb-6">
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-2">Add Restaurant Note</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Extra spicy, no onion, etc..."
                                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-[11px] font-medium text-gray-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-900 transition-all"
                                />
                            </div>

                            {/* Order Timeline */}
                            <div className="mt-6">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-6">KOT / Order Status</h3>
                                
                                <div className="relative flex justify-between items-start max-w-lg mx-auto">
                                    {/* Connecting Line */}
                                    <div className="absolute top-2.5 left-6 right-6 h-0.5 bg-gray-200 -z-10"></div>
                                    <div className={`absolute top-2.5 left-6 h-0.5 bg-green-500 -z-10 transition-all duration-500 ${selectedBillData.status === 'Billed' ? 'w-full' : 'w-3/4'}`}></div>
                                    
                                    {/* Timeline Steps */}
                                    {[
                                        { status: 'Placed', time: selectedBillData.startedAt, done: true },
                                        { status: 'Confirmed', time: '...', done: true },
                                        { status: 'Preparing', time: '...', done: selectedBillData.status !== 'Active' },
                                        { status: 'Ready to Serve', time: '...', done: selectedBillData.status === 'Billed' },
                                        { status: 'Served', time: '', done: selectedBillData.status === 'Billed' },
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center bg-white dark:bg-slate-900 px-2 cursor-help" title={step.status}>
                                            {step.done ? (
                                                <div className="w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" fill="white" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                    <Circle className="w-5 h-5 text-gray-300" fill="#f3f4f6" />
                                                </div>
                                            )}
                                            <p className={`text-[10px] font-bold mt-2 ${step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Middle Column Footer Actions */}
                        <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50/50 rounded-b-2xl">
                            <button 
                                onClick={handlePrintKOT}
                                className="px-6 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 active:bg-gray-100 dark:bg-slate-800 transition-colors shadow-sm"
                            >
                                Print KOT
                            </button>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={handleHoldBill}
                                    className="px-6 py-2.5 border border-indigo-200 text-indigo-600 bg-white dark:bg-slate-900 rounded-xl font-bold text-xs hover:bg-indigo-50 active:bg-indigo-100 transition-colors shadow-sm"
                                >
                                    Hold Bill
                                </button>
                                <button 
                                    onClick={handleProceedToBill}
                                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
                                >
                                    Proceed to Bill
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="w-full lg:w-2/4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Receipt className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">No Active Bill Selected</h3>
                        <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm">
                            Select an active session from the list on the left or start a new table session to view order details and process payments.
                        </p>
                    </div>
                )}

                {/* ----------------- RIGHT COLUMN: Bill Summary ----------------- */}
                <div className="w-full lg:w-1/4 flex flex-col">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col flex-1 p-6">
                        
                        <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-5">Bill Summary</h2>
                        
                        {/* Summary List */}
                        <div className="space-y-3.5 mb-6 text-[11px] font-bold border-b border-gray-100 dark:border-slate-800 pb-6">
                            <div className="flex justify-between text-gray-600 dark:text-slate-400">
                                <span>Subtotal ({currentItems.length} Items)</span>
                                <span className="text-gray-900 dark:text-white font-mono">₹ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-slate-400 group cursor-help">
                                <span className="flex items-center">Service Charge (5%) <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors" /></span>
                                <span className="text-gray-900 dark:text-white font-mono">₹ {serviceCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-slate-400 group cursor-help">
                                <span className="flex items-center">CGST (2.5%) <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors" /></span>
                                <span className="text-gray-900 dark:text-white font-mono">₹ {cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-slate-400 group cursor-help">
                                <span className="flex items-center">SGST (2.5%) <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors" /></span>
                                <span className="text-gray-900 dark:text-white font-mono">₹ {sgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 dark:text-white pt-2 font-extrabold text-sm">
                                <span>Total Amount</span>
                                <span className="font-mono">₹ {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Apply Discount */}
                        <div className="mb-4 text-[11px]">
                            <div className="flex items-center text-indigo-600 font-bold mb-2 cursor-pointer hover:text-indigo-800 transition-colors">
                                <div className="w-4 h-4 bg-indigo-50 flex items-center justify-center rounded-sm mr-2">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                                </div>
                                Apply Discount
                            </div>
                            <div className="flex space-x-2 items-center">
                                <select className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-2 text-gray-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option>Percentage (%)</option>
                                    <option>Flat Amount (₹)</option>
                                </select>
                                <input 
                                    type="number" 
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(e.target.value)}
                                    className="w-16 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-2 text-center text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                />
                                <span className="text-green-600 font-bold w-16 text-right font-mono">- ₹ {discountAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Round Off Toggle */}
                        <div className="flex justify-between items-center mb-6 text-[11px] font-bold">
                            <span className="flex items-center text-gray-700 dark:text-slate-300">Round Off <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" /></span>
                            <div className="flex items-center space-x-3">
                                {/* Custom Toggle */}
                                <div 
                                    className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${isRoundOff ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    onClick={() => setIsRoundOff(!isRoundOff)}
                                >
                                    <div className={`bg-white dark:bg-slate-900 w-3 h-3 rounded-full shadow-md transform transition-transform ${isRoundOff ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-gray-900 dark:text-white font-bold min-w-[40px] text-right font-mono">{roundOffDiff > 0 ? '+' : ''}{roundOffDiff.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Grand Total Banner */}
                        <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center mb-6 shadow-inner">
                            <span className="font-extrabold text-indigo-900 text-sm">Grand Total</span>
                            <span className="font-extrabold text-indigo-600 text-xl tracking-tight font-mono">₹ {grandTotal.toFixed(2)}</span>
                        </div>

                        {/* Payment Methods */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-[11px] mb-3">Payment Methods</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'Cash', icon: Banknote },
                                    { id: 'UPI', icon: Smartphone },
                                    { id: 'Card', icon: CreditCard },
                                    { id: 'Split', icon: SplitSquareHorizontal },
                                ].map(method => (
                                    <div 
                                        key={method.id}
                                        onClick={() => setSelectedPaymentMethod(method.id)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${selectedPaymentMethod === method.id ? 'border-green-500 bg-green-50 text-green-700 shadow-sm ring-1 ring-green-500' : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
                                    >
                                        <method.icon className={`w-5 h-5 mb-1 ${selectedPaymentMethod === method.id ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`text-[9px] font-bold ${selectedPaymentMethod === method.id ? 'text-green-700' : 'text-gray-600 dark:text-slate-400'}`}>{method.id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Received Input */}
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-4">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Payment Received</span>
                            <input 
                                type="number" 
                                value={paymentReceived}
                                onChange={(e) => setPaymentReceived(Number(e.target.value))}
                                className="w-24 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-right text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                            />
                        </div>

                        {/* Change Amount */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Change</span>
                            <span className="text-[12px] font-bold text-green-600 font-mono">₹ {Math.max(0, paymentReceived - grandTotal).toFixed(2)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto flex flex-col space-y-3">
                            <button 
                                onClick={handleGenerateBill}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-md"
                            >
                                <Receipt className="w-4 h-4 mr-2" />
                                Generate Bill
                            </button>
                            <button 
                                onClick={() => toast("Bill saved to drafts")}
                                className="w-full py-3 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 font-bold text-xs hover:text-indigo-600 active:bg-gray-50 dark:bg-slate-800/50 rounded-xl transition-colors"
                            >
                                Save as Draft
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Bills;
