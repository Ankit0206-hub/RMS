import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Users, ArrowRight, CheckCircle, Utensils, AlertCircle, Bell } from 'lucide-react';
import waiterApi from '../../services/waiterApi';
import { getWsUrl } from '../../services/api';
import toast from 'react-hot-toast';
const TableGraphic = ({status, capacity = 4, guests = 0}) => {
 const getChairClass = (index) => {
 let style ='bg-white/70 backdrop-blur-sm border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.05)]'; // Default/Vacant
 
 // If not empty, and this specific chair is occupied (index < guests)
 if (status !=='Empty'&& index < guests) {
        if (status === 'Occupied') style = 'bg-amber-300/80 backdrop-blur-sm border-amber-300 shadow-[0_2px_8px_rgba(251,191,36,0.3)]';
        else if (status === 'Ready to Serve') style = 'bg-teal-300/80 backdrop-blur-sm border-teal-300 shadow-[0_2px_8px_rgba(45,212,191,0.3)]';
        else if (status === 'Bill Requested') style = 'bg-purple-300/80 backdrop-blur-sm border-purple-300 shadow-[0_2px_8px_rgba(168,85,247,0.3)]';
        else if (status === 'Payment Pending') style = 'bg-sky-300/80 backdrop-blur-sm border-sky-300 shadow-[0_2px_8px_rgba(125,211,252,0.3)]';
    }
    return `border rounded-full ${style} transition-all duration-300`;
};

const getTableStyle = () => {
    if (status === 'Occupied') return 'bg-amber-100/50 backdrop-blur-md border-amber-200 text-amber-700';
    if (status === 'Ready to Serve') return 'bg-teal-100/50 backdrop-blur-md border-teal-200 text-teal-700';
    if (status === 'Bill Requested') return 'bg-purple-100/50 backdrop-blur-md border-purple-200 text-purple-700';
    if (status === 'Payment Pending') return 'bg-sky-100/50 backdrop-blur-md border-sky-200 text-sky-700';
    return 'bg-white/60 backdrop-blur-md border-white/80 text-gray-500'; // Vacant
};

 const tableClass =`rounded-xl border z-10 flex flex-col items-center justify-center shadow-sm transition-all duration-300 ${getTableStyle()}`;

 const innerContent = (
 <>
 <Users className="h-3 w-3 mb-0.5 opacity-60"/>
 <span className="text-[9px] font-bold leading-none">{guests > 0 ? guests : capacity}</span>
 </>
 );

 let content;
 if (capacity === 2) {
 content = (
 <div className="relative w-14 h-14 flex items-center justify-center">
 <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-6 ${getChairClass(0)}`}></div>
 <div className={`absolute top-1/2 -translate-y-1/2 right-0 w-2.5 h-6 ${getChairClass(1)}`}></div>
 <div className={`w-8 h-12 ${tableClass}`}>{innerContent}</div>
 </div>
 );
} else if (capacity === 4) {
 content = (
 <div className="relative w-16 h-16 flex items-center justify-center">
 {/* Top chairs */}
 <div className={`absolute top-0 left-2.5 w-4 h-2.5 ${getChairClass(0)}`}></div>
 <div className={`absolute top-0 right-2.5 w-4 h-2.5 ${getChairClass(1)}`}></div>
 {/* Bottom chairs */}
 <div className={`absolute bottom-0 left-2.5 w-4 h-2.5 ${getChairClass(2)}`}></div>
 <div className={`absolute bottom-0 right-2.5 w-4 h-2.5 ${getChairClass(3)}`}></div>
 
 <div className={`w-12 h-10 ${tableClass}`}>{innerContent}</div>
 </div>
 );
} else {// 6 or more
 content = (
 <div className="relative w-20 h-16 flex items-center justify-center">
 {/* Top chairs */}
 <div className={`absolute top-0 left-2 w-4 h-2.5 ${getChairClass(0)}`}></div>
 <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2.5 ${getChairClass(1)}`}></div>
 <div className={`absolute top-0 right-2 w-4 h-2.5 ${getChairClass(2)}`}></div>
 {/* Bottom chairs */}
 <div className={`absolute bottom-0 left-2 w-4 h-2.5 ${getChairClass(3)}`}></div>
 <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2.5 ${getChairClass(4)}`}></div>
 <div className={`absolute bottom-0 right-2 w-4 h-2.5 ${getChairClass(5)}`}></div>
 
 <div className={`w-16 h-10 ${tableClass}`}>{innerContent}</div>
 </div>
 );
}

 return content;
};

export default function MyTables() {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('All');
 const [searchQuery, setSearchQuery] = useState('');
 
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const data = await waiterApi.getTables();
                setTables(data);
            } catch (error) {
                console.error("Error fetching tables:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTables();
        
        // Connect to WebSocket for real-time updates
        const token = localStorage.getItem('token');
        const wsUrl = `${getWsUrl()}/ws/waiter?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "CUSTOMER_REQUESTED_BILL" || data.event === "BILL_PAID" || data.event === "WAITER_REQUESTED_BILL") {
                    fetchTables();
                } else if (data.event === "CUSTOMER_NEEDS_ASSISTANCE") {
                    toast(`Table ${data.payload.table_id} needs: ${data.payload.request_type}`, { icon: '🔔' });
                }
            } catch (err) {
                console.error("WS parse error", err);
            }
        };

        const interval = setInterval(fetchTables, 30000);
        return () => {
            clearInterval(interval);
            if (ws.readyState === 1) {
                ws.close();
            }
        };
    }, []);
    
    // Stats calculation
    const totalOccupied = tables.filter(t => t.status === 'Occupied').length;
    const totalReady = tables.filter(t => t.status === 'Ready to Serve').length;
    const totalEmpty = tables.filter(t => t.status === 'Empty').length;

 const filteredTables = tables.filter(table => {
 const matchesTab = activeTab ==='All'? true : 
 activeTab ==='Occupied'? table.status ==='Occupied':
 activeTab ==='Ready'? table.status ==='Ready to Serve':
 activeTab ==='Empty'? table.status ==='Empty': true;
 const matchesSearch = table.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
 table.order.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesTab && matchesSearch;
});

 const getStatusStyle = (status) => {
 switch(status) {
 case'Occupied': return'bg-amber-500/10 text-amber-700 border-amber-200/50';
 case'Ready to Serve': return'bg-teal-500/10 text-teal-700 border-teal-200/50';
 case'Payment Pending': return'bg-sky-500/10 text-sky-700 border-sky-200/50';
 default: return'bg-gray-500/10 text-gray-600 border-gray-200/50';
}
};

 const getStatusDot = (status) => {
 switch(status) {
 case'Occupied': return'bg-amber-400';
 case'Ready to Serve': return'bg-teal-400';
 case'Payment Pending': return'bg-sky-400';
 default: return'bg-gray-400';
}
};

 return (
 <div className="flex flex-col h-full bg-slate-50 font-inter relative">


 <div className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto">
 {/* Fixed Search & Filters Area */}
 <div className="px-4 pt-4 pb-2 space-y-4 border-b border-white/20 bg-white/10 backdrop-blur-xl shadow-sm shrink-0">
 <div className="flex items-center space-x-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors"/>
                                <input 
                                    type="text"
                                    placeholder="Search by table or order..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-[15px] focus:outline-none focus:ring-4 focus:ring-rose-300/20 focus:border-rose-300 shadow-sm transition-all placeholder:text-gray-400 text-gray-800"
                                />
                            </div>
                            <button onClick={() => navigate('/waiter/notifications')} className="relative shrink-0 h-[52px] w-[52px] flex items-center justify-center bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm text-gray-700 hover:text-rose-500 hover:bg-white/40 transition-all active:scale-95">
                                <Bell className="h-6 w-6" />
                            </button>
                        </div>
 
                    <div className="flex flex-wrap justify-center sm:justify-start w-full gap-2 pb-2">
                        {['All', 'Occupied', 'Ready', 'Empty'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`flex-auto whitespace-nowrap px-3 py-2.5 rounded-xl text-[12px] sm:text-sm font-bold transition-all duration-300 border ${
 activeTab === tab 
 ?'bg-rose-400/90 backdrop-blur-md text-white border-rose-400 shadow-md'
 :'bg-white/20 backdrop-blur-md text-gray-600 border-white/40 shadow-sm'
}`}
 >
 {tab}
 </button>
 ))}
 </div>
 </div>
 
  {/* Tables Grid - Scrollable */}
  <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 content-start">
  {loading ? (
      <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
  ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredTables.map(table => (
 <div 
 key={table.id} 
 onClick={() => navigate(table.status ==='Empty'?`/waiter/tables/${table.id}/start`:`/waiter/tables/${table.id}`)} 
 className="bg-white/20 backdrop-blur-xl rounded-[20px] p-4 shadow-sm border border-white/40 cursor-pointer transition-all duration-300 flex flex-col relative overflow-hidden"
 >
 <div className="flex justify-between items-start mb-3 relative z-10">
 <div>
 <div className="flex items-center space-x-2">
 <div className={`h-2.5 w-2.5 rounded-full ${getStatusDot(table.status)} ${table.status !=='Empty'?'animate-pulse':''}`} />
 <span className="text-xl font-black text-gray-800 tracking-tight">{table.id}</span>
 </div>
 <div className={`text-[11px] font-bold px-3 py-1.5 rounded-xl inline-flex w-fit mt-2.5 border ${getStatusStyle(table.status)} backdrop-blur-md`}>
 {table.status}
 </div>
 </div>
 
 <TableGraphic status={table.status} capacity={table.capacity} guests={table.guests} />
 </div>
 
 <div className="mt-auto relative z-10">
 {table.status !=='Empty'? (
 <div className="space-y-3">
 <div className="flex justify-between items-center text-[13px] text-gray-700 font-bold bg-white/30 backdrop-blur-md p-2.5 rounded-xl border border-white/40">
 <div className="flex items-center">
 <Clock className="h-4 w-4 mr-1.5 text-gray-500"/> 
 <span>{table.time}</span>
 </div>
 {table.order ? (
 <span className="text-gray-400">
 <span>| </span>
 <span className="text-gray-700">{table.order}</span>
 </span>
 ) : null}
 </div>
 <div className="flex justify-between items-center pt-3 border-t border-white/30">
 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bill</span>
 <span className="text-[16px] font-black text-gray-800 transition-colors">₹{Number(table.currentBill || 0).toFixed(2)}</span>
 </div>
 </div>
 ) : (
 <div className="text-xs text-gray-500 font-bold h-[84px] flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-xl border border-dashed border-white/40 transition-colors">
 <div className="bg-white/30 p-2 rounded-xl shadow-sm mb-2 text-gray-400 transition-colors border border-white/40">
 <Utensils className="h-4 w-4"/>
 </div>
 <span>Tap to assign</span>
 </div>
 )}
 </div>
 </div>
 ))}
 
  {filteredTables.length === 0 ? (
  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
  <div className="bg-white/30 backdrop-blur-xl shadow-sm p-4 rounded-full mb-4 border border-white/40">
  <Search className="h-8 w-8 text-gray-400"/>
  </div>
  <h3 className="text-lg font-black text-gray-800 mb-1">No tables found</h3>
  <p className="text-gray-500 font-bold text-sm">Try adjusting your filters or search query.</p>
  </div>
  ) : null}
  </div>
  )}
  </div>
 </div>
 </div>
 );
}
