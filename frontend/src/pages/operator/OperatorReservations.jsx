import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    Search, ChevronDown, ChevronLeft, ChevronRight, 
    Calendar, Users, User, Clock, Star, Leaf, Plus
} from 'lucide-react';

const OperatorReservations = () => {
    const [leftTab, setLeftTab] = useState('RESERVATION');
    const [selectedTable, setSelectedTable] = useState(null);

    // Mock Data
    const seated = [
        { time: '6:00 PM', name: 'John Doe', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T1', icon: null },
        { time: '6:10 PM', name: 'Emma Clark', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T2', icon: 'star' },
        { time: '6:20 PM', name: 'David Johnson', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T6', icon: null },
        { time: '7:00 PM', name: 'John Davis', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T11', icon: null },
        { time: '7:05 PM', name: 'Maria', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T3', icon: 'leaf' },
        { time: '7:37 PM', name: 'Emma Watson', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T10', icon: 'both' },
    ];

    const upcoming = [
        { time: '8:15 PM', name: 'Sarah K.', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T9' },
        { time: '8:30 PM', name: 'Cathy Clark', phone: '05254989796', guests: 3, room: 'Main Room', table: 'T5' },
    ];

    // Table Data for Floor Plan
    const tables = [
        // Column 1
        { id: 'T1', status: 'Occupied', guest: 'John Doe', seats: 4, type: 'horizontal' },
        { id: 'T2', status: 'Occupied', guest: 'Emma Clark', seats: 4, type: 'horizontal' },
        { id: 'T3', status: 'Occupied', guest: 'Maria', seats: 4, type: 'horizontal' },
        // Column 2
        { id: 'T4', status: 'Vacant', guest: null, seats: 6, type: 'vertical' },
        { id: 'T5', status: 'Reserved', guest: 'Cathy', time: '8:30', seats: 6, type: 'vertical' },
        // Column 3
        { id: 'T12', status: 'Vacant', guest: null, seats: 2, type: 'square' },
        { id: 'T6', status: 'Occupied', guest: 'David Joh...', seats: 2, type: 'square' },
        { id: 'T7', status: 'Vacant', guest: null, seats: 2, type: 'square' },
        { id: 'T8', status: 'Vacant', guest: null, seats: 2, type: 'square' },
        // Column 4
        { id: 'T9', status: 'Reserved', guest: 'Sarah K.', time: '8:15', seats: 4, type: 'horizontal' },
        { id: 'T10', status: 'Occupied', guest: 'Emma Watson', seats: 4, type: 'horizontal' },
        { id: 'T11', status: 'Occupied', guest: 'John Davis', seats: 4, type: 'horizontal' },
    ];

    // Status Colors (Light Theme Adapted)
    const getStatusColor = (status) => {
        switch(status) {
            case 'Occupied': return { border: 'bg-cyan-400', text: 'text-cyan-600', badge: 'border-cyan-300 text-cyan-700' };
            case 'Vacant': return { border: 'bg-green-500', text: 'text-green-600', badge: 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400' };
            case 'Reserved': return { border: 'bg-amber-400', text: 'text-amber-600', badge: 'border-amber-400 text-amber-700' };
            default: return { border: 'bg-gray-300', text: 'text-gray-500 dark:text-slate-400', badge: 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400' };
        }
    };

    const handleTableClick = (tableId) => {
        setSelectedTable(tableId);
        toast(`Table ${tableId} Selected`, { icon: '🍽️' });
    };

    const handleGuestClick = (tableId) => {
        setSelectedTable(tableId);
    };

    // Render chairs based on seats and type
    const renderChairs = (seats, type) => {
        const chairs = [];
        if (type === 'horizontal' && seats === 4) {
            // 2 top, 2 bottom
            chairs.push(<div key="t1" className="absolute -top-1.5 left-4 w-6 h-3 bg-gray-200 rounded-t-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="t2" className="absolute -top-1.5 right-6 w-6 h-3 bg-gray-200 rounded-t-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="b1" className="absolute -bottom-1.5 left-4 w-6 h-3 bg-gray-200 rounded-b-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="b2" className="absolute -bottom-1.5 right-6 w-6 h-3 bg-gray-200 rounded-b-full transition-colors group-hover:bg-indigo-100"></div>);
        } else if (type === 'vertical' && seats === 6) {
            // 3 left, 3 right
            chairs.push(<div key="l1" className="absolute top-4 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="l2" className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="l3" className="absolute bottom-4 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r1" className="absolute top-4 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r2" className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r3" className="absolute bottom-4 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
        } else if (type === 'square' && seats === 2) {
            // 1 left, 1 right
            chairs.push(<div key="l1" className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-6 bg-gray-200 rounded-l-full transition-colors group-hover:bg-indigo-100"></div>);
            chairs.push(<div key="r1" className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-6 bg-gray-200 rounded-r-full transition-colors group-hover:bg-indigo-100"></div>);
        }
        return chairs;
    };

    return (
        <div className="min-h-[90vh] -m-6 flex font-inter shadow-inner">
            <Toaster position="top-right" />
            
            {/* ---------------- LEFT SIDEBAR (Reservations List) ---------------- */}
            <div className="w-[300px] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col flex-shrink-0">
                
                {/* Tabs */}
                <div className="flex p-4 pb-0">
                    <button 
                        onClick={() => setLeftTab('RESERVATION')}
                        className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${leftTab === 'RESERVATION' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'}`}
                    >
                        RESERVATION
                    </button>
                    <button 
                        onClick={() => setLeftTab('WAITING')}
                        className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${leftTab === 'WAITING' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'}`}
                    >
                        WAITING
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search Guest"
                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Seated List */}
                    <div className="px-4 pb-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-bold text-indigo-500 tracking-wider">SEATED</h3>
                            <div className="flex items-center text-indigo-500 text-xs font-bold space-x-1">
                                <User className="w-3.5 h-3.5" />
                                <span>18</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {seated.map((guest, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => handleGuestClick(guest.table)}
                                    className={`flex items-start justify-between p-2 rounded-lg cursor-pointer transition-colors border ${selectedTable === guest.table ? 'bg-indigo-50/50 border-indigo-200' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="text-right w-14 pt-0.5">
                                            <div className="text-gray-900 dark:text-white font-bold text-xs">{guest.time.split(' ')[0]}</div>
                                            <div className="text-gray-400 font-semibold text-[9px]">{guest.time.split(' ')[1]}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white font-bold text-xs">{guest.name}</div>
                                            <div className="text-gray-500 dark:text-slate-400 font-medium text-[10px] my-0.5">{guest.phone}</div>
                                            <div className="text-gray-400 font-semibold text-[9px]">{guest.guests} Guests / {guest.room}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className={`border rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusColor('Occupied').badge}`}>
                                            {guest.table}
                                        </div>
                                        <div className="flex space-x-1">
                                            {(guest.icon === 'star' || guest.icon === 'both') && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                            {(guest.icon === 'leaf' || guest.icon === 'both') && <Leaf className="w-3 h-3 text-green-500 fill-green-500" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming List */}
                    <div className="px-4 pb-6 mt-2">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-bold text-indigo-500 tracking-wider">UPCOMING</h3>
                            <div className="flex items-center text-indigo-500 text-xs font-bold space-x-1">
                                <User className="w-3.5 h-3.5" />
                                <span>7</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {upcoming.map((guest, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => handleGuestClick(guest.table)}
                                    className={`flex items-start justify-between p-2 rounded-lg cursor-pointer transition-colors border ${selectedTable === guest.table ? 'bg-amber-50/50 border-amber-200' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="text-right w-14 pt-0.5">
                                            <div className="text-gray-900 dark:text-white font-bold text-xs">{guest.time.split(' ')[0]}</div>
                                            <div className="text-gray-400 font-semibold text-[9px]">{guest.time.split(' ')[1]}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white font-bold text-xs">{guest.name}</div>
                                            <div className="text-gray-500 dark:text-slate-400 font-medium text-[10px] my-0.5">{guest.phone}</div>
                                            <div className="text-gray-400 font-semibold text-[9px]">{guest.guests} Guests / {guest.room}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className={`border rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusColor('Reserved').badge}`}>
                                            {guest.table}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- MAIN AREA (Floor Plan) ---------------- */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                
                {/* Top Toolbar */}
                <div className="h-16 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                    
                    {/* Left Controls */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 shadow-sm">
                            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-900 dark:text-white" />
                            <span className="mx-3">Thu, Jan 19</span>
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-900 dark:text-white" />
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors">
                            <span>Dinner</span>
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </div>
                    </div>

                    {/* Center Room Tabs */}
                    <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-600 dark:text-slate-400">
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-white border-b-2 border-indigo-600 pb-1 cursor-pointer">
                            <span>Main Room</span>
                            <span className="bg-green-100 text-green-700 px-1.5 rounded text-[10px]">8/12</span>
                        </div>
                        <div className="flex items-center space-x-2 pb-1 hover:text-gray-800 dark:text-slate-200 cursor-pointer transition-colors">
                            <span>Patio</span>
                            <span className="bg-green-100 text-green-700 px-1.5 rounded text-[10px]">2/8</span>
                        </div>
                        <div className="flex items-center space-x-2 pb-1 hover:text-gray-800 dark:text-slate-200 cursor-pointer transition-colors">
                            <span>Terrace</span>
                            <span className="bg-red-100 text-red-600 px-1.5 rounded text-[10px]">6/6</span>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-5">
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-xs">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                <div>
                                    <div className="text-gray-500 dark:text-slate-400 font-semibold text-[9px]">Avg. Wait</div>
                                    <div className="text-gray-900 dark:text-white font-bold leading-tight">30 min</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                <Users className="w-4 h-4 text-indigo-500" />
                                <div>
                                    <div className="text-gray-500 dark:text-slate-400 font-semibold text-[9px]">Current Capacity</div>
                                    <div className="text-gray-900 dark:text-white font-bold leading-tight">80% Full</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-6 w-px bg-gray-200"></div>

                        <div className="flex space-x-3">
                            <button className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm">
                                <Calendar className="w-4 h-4" />
                            </button>
                            <button className="hidden sm:flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm active:scale-95">
                                <Plus className="w-4 h-4 mr-1.5" />
                                New Reservation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floor Plan Canvas */}
                <div className="flex-1 p-8 overflow-auto relative">
                    <div className="max-w-5xl mx-auto min-w-[800px]">
                        
                        {/* Grid Layout matching the mockup */}
                        <div className="grid grid-cols-4 gap-x-12 gap-y-16">
                            
                            {/* Column 1 */}
                            <div className="flex flex-col space-y-12 items-center">
                                {tables.filter(t => ['T1', 'T2', 'T3'].includes(t.id)).map(table => (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table.id)}
                                        className={`relative w-36 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex
                                            ${selectedTable === table.id ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-200' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        {/* Colored Status Stripe */}
                                        <div className={`w-3 shrink-0 rounded-l-2xl ${getStatusColor(table.status).border}`}></div>
                                        
                                        {/* Table Content */}
                                        <div className="flex-1 p-3 flex flex-col justify-center">
                                            <span className="text-gray-400 font-bold text-xs">{table.id}</span>
                                            {table.guest && <span className="text-gray-900 dark:text-white font-bold text-xs mt-1 truncate max-w-full block">{table.guest}</span>}
                                            <span className={`text-[10px] font-bold mt-0.5 ${getStatusColor(table.status).text}`}>{table.status}</span>
                                        </div>

                                        {renderChairs(table.seats, table.type)}
                                    </div>
                                ))}
                            </div>

                            {/* Column 2 (Vertical Tables) */}
                            <div className="flex flex-col space-y-8 items-center justify-center">
                                {tables.filter(t => ['T4', 'T5'].includes(t.id)).map(table => (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table.id)}
                                        className={`relative w-20 h-44 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex flex-col
                                            ${selectedTable === table.id ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-200' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        <div className="flex-1 p-3 flex flex-col items-center justify-between py-6">
                                            <span className="text-gray-400 font-bold text-xs">{table.id}</span>
                                            <div className="flex flex-col items-center">
                                                {table.guest && <span className="text-gray-900 dark:text-white font-bold text-[10px] truncate max-w-[60px]">{table.guest}</span>}
                                                <span className={`text-[10px] font-bold ${getStatusColor(table.status).text}`}>{table.status}</span>
                                                {table.time && <span className="text-gray-500 dark:text-slate-400 text-[9px] font-bold">{table.time}</span>}
                                            </div>
                                        </div>

                                        {/* Colored Status Stripe on Right for vertical */}
                                        <div className={`h-full w-3 shrink-0 absolute right-0 top-0 rounded-r-2xl ${getStatusColor(table.status).border}`}></div>
                                        
                                        {renderChairs(table.seats, table.type)}
                                    </div>
                                ))}
                            </div>

                            {/* Column 3 (Small Square Tables) */}
                            <div className="flex flex-col space-y-12 items-center justify-center pt-8">
                                {tables.filter(t => ['T12', 'T6', 'T7', 'T8'].includes(t.id)).map(table => (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table.id)}
                                        className={`relative w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex
                                            ${selectedTable === table.id ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-200' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        {/* Colored Status Stripe */}
                                        <div className={`w-3 shrink-0 absolute right-0 top-0 h-full rounded-r-2xl ${getStatusColor(table.status).border}`}></div>
                                        
                                        <div className="flex-1 p-2 flex flex-col items-center justify-center pr-3">
                                            <span className="text-gray-400 font-bold text-xs mb-1">{table.id}</span>
                                            {table.guest && <span className="text-gray-900 dark:text-white font-bold text-[9px] truncate max-w-[50px]">{table.guest}</span>}
                                            <span className={`text-[9px] font-bold mt-0.5 ${getStatusColor(table.status).text}`}>{table.status}</span>
                                        </div>

                                        {renderChairs(table.seats, table.type)}
                                    </div>
                                ))}
                            </div>

                            {/* Column 4 */}
                            <div className="flex flex-col space-y-12 items-center pt-10">
                                {tables.filter(t => ['T9', 'T10', 'T11'].includes(t.id)).map(table => (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table.id)}
                                        className={`relative w-36 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex
                                            ${selectedTable === table.id ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-200' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        {/* Colored Status Stripe on Right for Column 4 */}
                                        <div className={`w-3 shrink-0 absolute right-0 top-0 h-full rounded-r-2xl ${getStatusColor(table.status).border}`}></div>
                                        
                                        {/* Table Content */}
                                        <div className="flex-1 p-3 flex flex-col justify-center pr-4">
                                            <span className="text-gray-400 font-bold text-xs">{table.id}</span>
                                            {table.guest && <span className="text-gray-900 dark:text-white font-bold text-xs mt-1 truncate block">{table.guest}</span>}
                                            <div className="flex space-x-1 items-center mt-0.5">
                                                <span className={`text-[10px] font-bold ${getStatusColor(table.status).text}`}>{table.status}</span>
                                                {table.time && <span className="text-gray-500 dark:text-slate-400 text-[9px] font-bold ml-1">{table.time}</span>}
                                            </div>
                                        </div>

                                        {renderChairs(table.seats, table.type)}
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OperatorReservations;
