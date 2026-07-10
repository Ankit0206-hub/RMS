import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
    // Top-level Tabs
    const [mainTab, setMainTab] = useState('Active Bill');

    // Left Column State
    const [activeBills, setActiveBills] = useState([
        { id: 'T-03', status: 'Active', customer: 'Rahul Sharma', pax: 2, time: '25 min', orderType: 'Dine In', startedAt: '10:00 AM' },
        { id: 'T-07', status: 'Preparing', customer: 'Neha Singh', pax: 4, time: '18 min', orderType: 'Dine In', startedAt: '11:15 AM' },
        { id: 'T-12', status: 'Active', customer: 'Amit Verma', pax: 3, time: '35 min', orderType: 'Dine In', startedAt: '09:45 AM' },
        { id: 'T-02', status: 'Active', customer: 'Priya Patel', pax: 2, time: '15 min', orderType: 'Dine In', startedAt: '11:30 AM' },
        { id: 'T-08', status: 'Billed', customer: 'Walk-in Customer', pax: 2, time: '40 min', orderType: 'Takeaway', startedAt: '09:20 AM' },
    ]);

    const [selectedBillId, setSelectedBillId] = useState('T-03');

    // Middle Column Ordered Items Dictionary (keyed by bill ID)
    const initialOrders = {
        'T-03': [
            { id: 1, name: 'Paneer Butter Masala', qty: 1, price: 280.00, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=50&h=50&q=80' },
            { id: 2, name: 'Veg Biryani', qty: 1, price: 240.00, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=50&h=50&q=80' },
            { id: 3, name: 'Garlic Naan', qty: 2, price: 60.00, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=50&h=50&q=80' },
            { id: 4, name: 'Masala Cold Drink', qty: 2, price: 40.00, img: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=50&h=50&q=80' },
            { id: 5, name: 'Gulab Jamun', qty: 1, price: 60.00, img: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=50&h=50&q=80' },
        ],
        'T-07': [
            { id: 6, name: 'Chicken Tikka', qty: 2, price: 320.00, img: 'https://images.unsplash.com/photo-1599487405620-8e6d2c88f910?auto=format&fit=crop&w=50&h=50&q=80' },
            { id: 7, name: 'Butter Naan', qty: 4, price: 50.00, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=50&h=50&q=80' },
        ],
        'T-12': [
            { id: 8, name: 'Mutton Rogan Josh', qty: 1, price: 450.00, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=50&h=50&q=80' },
            { id: 9, name: 'Jeera Rice', qty: 2, price: 150.00, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=50&h=50&q=80' },
        ],
        'T-02': [
            { id: 10, name: 'Pasta Alfredo', qty: 1, price: 350.00, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=50&h=50&q=80' },
        ],
        'T-08': [
            { id: 11, name: 'Family Thali', qty: 2, price: 600.00, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=50&h=50&q=80' },
        ]
    };

    const [ordersMap, setOrdersMap] = useState(initialOrders);
    
    // Get current items
    const currentItems = ordersMap[selectedBillId] || [];

    const handleQtyChange = (itemId, delta) => {
        setOrdersMap(prev => ({
            ...prev,
            [selectedBillId]: prev[selectedBillId].map(item => {
                if (item.id === itemId) {
                    const newQty = Math.max(1, item.qty + delta);
                    return { ...item, qty: newQty };
                }
                return item;
            })
        }));
    };

    const handleRemoveItem = (itemId) => {
        setOrdersMap(prev => ({
            ...prev,
            [selectedBillId]: prev[selectedBillId].filter(item => item.id !== itemId)
        }));
        toast.success("Item removed from bill");
    };

    const handleAddWalkInBill = () => {
        const newId = `T-${Math.floor(Math.random() * 90) + 10}`;
        const newBill = { id: newId, status: 'Active', customer: 'New Walk-in', pax: 1, time: '0 min', orderType: 'Dine In', startedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
        setActiveBills([newBill, ...activeBills]);
        setOrdersMap({ ...ordersMap, [newId]: [] });
        setSelectedBillId(newId);
        toast.success("New walk-in bill created!");
    };

    // Right Column Calculations
    const subtotal = currentItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const serviceCharge = subtotal * 0.05;
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const totalAmount = subtotal + serviceCharge + cgst + sgst;
    
    // Discount and Round off states per bill could be stored, but we use global for UI demo
    const [discountPercentage, setDiscountPercentage] = useState(10);
    const [isRoundOff, setIsRoundOff] = useState(true);
    
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
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const selectedBillData = activeBills.find(b => b.id === selectedBillId);

    // Button Handlers
    const handleGenerateBill = () => {
        toast.success(`Bill generated successfully for ${selectedBillId}!`);
        // Mark as billed
        setActiveBills(bills => bills.map(b => b.id === selectedBillId ? { ...b, status: 'Billed' } : b));
    };

    const handlePrintKOT = () => toast.success("KOT sent to Kitchen Printer!");
    const handleHoldBill = () => toast("Bill placed on hold", { icon: '⏸️' });
    const handleProceedToBill = () => toast.success("Ready for payment collection!");
    const handleAddItem = () => toast("Opening menu catalog...", { icon: '📋' });
    const handleChangeTable = () => toast("Select new table from Floor Plan", { icon: '🔀' });

    return (
        <div className="bg-[#f8f9fc] min-h-screen -m-6 p-6 font-inter">
            <Toaster position="top-right" />
            
            {/* Header Tabs Section */}
            <div className="flex space-x-8 border-b border-gray-200 mb-6 px-2">
                <button 
                    onClick={() => setMainTab('Active Bill')}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${mainTab === 'Active Bill' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Active Bill
                    {mainTab === 'Active Bill' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => { setMainTab('Recent Bills'); toast("Recent Bills tab clicked"); }}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${mainTab === 'Recent Bills' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
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
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative hover:opacity-80 transition-opacity">
                        <div className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex justify-between items-center cursor-pointer">
                            <div className="flex items-center space-x-2 text-indigo-600">
                                <Receipt className="w-4 h-4" />
                                <span className="text-xs font-bold">Dine In</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>

                    {/* Bills List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar pr-1">
                        {activeBills.map((bill) => {
                            const isSelected = bill.id === selectedBillId;
                            const billTotal = ordersMap[bill.id]?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0;
                            // Add taxes approx for display
                            const displayTotal = billTotal > 0 ? (billTotal * 1.1).toFixed(2) : '0.00';

                            return (
                                <div 
                                    key={bill.id} 
                                    onClick={() => setSelectedBillId(bill.id)}
                                    className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${isSelected ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-extrabold text-gray-900 text-sm">{bill.id}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyles(bill.status)}`}>
                                                {bill.status}
                                            </span>
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm">₹ {displayTotal}</p>
                                    </div>
                                    <div className="flex items-center space-x-1.5 text-gray-600 text-[11px] font-semibold mb-2">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{bill.customer}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-gray-500 text-[11px] font-semibold">
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
                            className="w-full mt-2 py-3 bg-white border border-gray-200 text-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            New Walk-in Bill
                        </button>
                    </div>

                </div>

                {/* ----------------- MIDDLE COLUMN: Order Details ----------------- */}
                {selectedBillData && (
                    <div className="w-full lg:w-2/4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                        
                        {/* Middle Header */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <h2 className="font-bold text-gray-900 text-sm">Table / Order Details</h2>
                                <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold">{selectedBillData.orderType}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="font-bold text-gray-900 text-sm">Table {selectedBillData.id}</span>
                                <button 
                                    onClick={handleChangeTable}
                                    className="px-3 py-1.5 border border-indigo-200 text-indigo-600 font-bold text-[11px] rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                                >
                                    Change Table
                                </button>
                            </div>
                        </div>

                        {/* Customer Info Meta */}
                        <div className="p-5 border-b border-gray-100 grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 mb-1">Customer</p>
                                <div className="flex items-center space-x-1.5 text-gray-900 font-semibold text-[11px]">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{selectedBillData.customer}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white mb-1">Pax</p>
                                <div className="flex items-center space-x-1.5 text-gray-900 font-semibold text-[11px]">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{selectedBillData.pax} People</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 mb-1">Started At</p>
                                <div className="text-gray-900 font-semibold text-[11px]">{selectedBillData.startedAt}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 mb-1">Order Type</p>
                                <div className="text-gray-900 font-semibold text-[11px]">{selectedBillData.orderType}</div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="p-5 flex-1 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-gray-900 text-sm">Ordered Items ({currentItems.length})</h3>
                                <button 
                                    onClick={handleAddItem}
                                    className="flex items-center text-indigo-600 font-bold text-[11px] hover:text-indigo-800 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                                </button>
                            </div>

                            {/* List Header */}
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
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
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center border-b border-gray-50 pb-4 hover:bg-gray-50 transition-colors p-1 -mx-1 rounded-lg">
                                            <div className="col-span-6 flex items-center space-x-3">
                                                <img src={item.img} alt={item.name} className="w-8 h-8 rounded-md object-cover border border-gray-200" />
                                                <span className="font-bold text-gray-900 text-[11px]">{item.name}</span>
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                    <button 
                                                        onClick={() => handleQtyChange(item.id, -1)}
                                                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 font-bold text-[11px] transition-colors"
                                                    >−</button>
                                                    <span className="px-2 text-[11px] font-bold text-gray-900 min-w-[20px] text-center">{item.qty}</span>
                                                    <button 
                                                        onClick={() => handleQtyChange(item.id, 1)}
                                                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 font-bold text-[11px] transition-colors"
                                                    >+</button>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-right text-[11px] font-semibold text-gray-900">
                                                ₹ {(item.price).toFixed(2)}
                                            </div>
                                            <div className="col-span-2 flex justify-end items-center space-x-3">
                                                <span className="text-[11px] font-bold text-gray-900">₹ {(item.price * item.qty).toFixed(2)}</span>
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
                            <div className="mt-6 border-b border-gray-100 pb-6">
                                <label className="block text-[11px] font-bold text-gray-700 mb-2">Add Restaurant Note</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Extra spicy, no onion, etc..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[11px] font-medium text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Order Timeline */}
                            <div className="mt-6">
                                <h3 className="font-bold text-gray-900 text-sm mb-6">KOT / Order Status</h3>
                                
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
                                        <div key={idx} className="flex flex-col items-center bg-white px-2 cursor-help" title={step.status}>
                                            {step.done ? (
                                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" fill="white" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                                    <Circle className="w-5 h-5 text-gray-300" fill="#f3f4f6" />
                                                </div>
                                            )}
                                            <p className={`text-[10px] font-bold mt-2 ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Middle Column Footer Actions */}
                        <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
                            <button 
                                onClick={handlePrintKOT}
                                className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-xl font-bold text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                            >
                                Print KOT
                            </button>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={handleHoldBill}
                                    className="px-6 py-2.5 border border-indigo-200 text-indigo-600 bg-white rounded-xl font-bold text-xs hover:bg-indigo-50 active:bg-indigo-100 transition-colors shadow-sm"
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
                )}

                {/* ----------------- RIGHT COLUMN: Bill Summary ----------------- */}
                <div className="w-full lg:w-1/4 flex flex-col">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col flex-1 p-6">
                        
                        <h2 className="font-bold text-gray-900 text-sm mb-5">Bill Summary</h2>
                        
                        {/* Summary List */}
                        <div className="space-y-3.5 mb-6 text-[11px] font-bold border-b border-gray-100 pb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({currentItems.length} Items)</span>
                                <span className="text-gray-900 font-mono">₹ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 group cursor-help">
                                <span className="flex items-center">Service Charge (5%) <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors" /></span>
                                <span className="text-gray-900 font-mono">₹ {serviceCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 group cursor-help">
                                <span className="flex items-center">CGST (2.5%) <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors" /></span>
                                <span className="text-gray-900 font-mono">₹ {cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 group cursor-help">
                                <span className="flex items-center">SGST (2.5%) <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors" /></span>
                                <span className="text-gray-900 font-mono">₹ {sgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 pt-2 font-extrabold text-sm">
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
                                <select className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option>Percentage (%)</option>
                                    <option>Flat Amount (₹)</option>
                                </select>
                                <input 
                                    type="number" 
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(e.target.value)}
                                    className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-center text-gray-900 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                />
                                <span className="text-green-600 font-bold w-16 text-right font-mono">- ₹ {discountAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Round Off Toggle */}
                        <div className="flex justify-between items-center mb-6 text-[11px] font-bold">
                            <span className="flex items-center text-gray-700">Round Off <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" /></span>
                            <div className="flex items-center space-x-3">
                                {/* Custom Toggle */}
                                <div 
                                    className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${isRoundOff ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    onClick={() => setIsRoundOff(!isRoundOff)}
                                >
                                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${isRoundOff ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-gray-900 font-bold min-w-[40px] text-right font-mono">{roundOffDiff > 0 ? '+' : ''}{roundOffDiff.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Grand Total Banner */}
                        <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center mb-6 shadow-inner">
                            <span className="font-extrabold text-indigo-900 text-sm">Grand Total</span>
                            <span className="font-extrabold text-indigo-600 text-xl tracking-tight font-mono">₹ {grandTotal.toFixed(2)}</span>
                        </div>

                        {/* Payment Methods */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 text-[11px] mb-3">Payment Methods</h3>
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
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${selectedPaymentMethod === method.id ? 'border-green-500 bg-green-50 text-green-700 shadow-sm ring-1 ring-green-500' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <method.icon className={`w-5 h-5 mb-1 ${selectedPaymentMethod === method.id ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`text-[9px] font-bold ${selectedPaymentMethod === method.id ? 'text-green-700' : 'text-gray-600'}`}>{method.id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Received Input */}
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                            <span className="text-[11px] font-bold text-gray-700">Payment Received</span>
                            <input 
                                type="number" 
                                value={paymentReceived}
                                onChange={(e) => setPaymentReceived(Number(e.target.value))}
                                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-right text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                            />
                        </div>

                        {/* Change Amount */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[11px] font-bold text-gray-700">Change</span>
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
                                className="w-full py-3 bg-white text-gray-700 font-bold text-xs hover:text-indigo-600 active:bg-gray-50 rounded-xl transition-colors"
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
