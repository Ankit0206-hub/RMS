import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../../components/customer/navigation/BottomNav";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import customerApi from "../../services/customerApi";

export default function OrderHistory() {
  const navigate = useNavigate();
  const { customerSession } = useApp();

  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerSession) {
        setLoading(false);
        return;
      }
      try {
        const res = await customerApi.getGlobalOrderHistory(customerSession.sessionId);
        const mappedOrders = (res.orders || []).map(o => ({
          id: o.id,
          status: o.status === "Verification Pending" || o.status === "Pending" ? "Pending" : o.status === "Cancelled" ? "Cancelled" : "Delivered",
          rawStatus: o.status,
          date: new Date(o.time).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }),
          items: o.items.map(i => ({ ...i, price: parseFloat(i.price) })),
          total: o.items.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0)
        }));
        setOrders(mappedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customerSession]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All") return true;
    return order.status === activeTab;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "Delivered":
        return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 };
      case "Cancelled":
        return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle };
      default:
        return { color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", icon: Clock };
    }
  };

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900/80 backdrop-blur-md px-5 py-4 shadow-sm flex items-center">
        <button onClick={() => navigate('/customer/profile')} className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 transition active:scale-95">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white mr-8">
          Order History
        </h1>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md px-5 pt-4 pb-2 sticky top-[68px] z-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {["All", "Pending", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gray-900 text-white shadow-md shadow-gray-300"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <span className="text-sm font-semibold text-gray-500 dark:text-slate-400 animate-pulse">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">No Orders Found</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-2 text-center px-6">
              Looks like you haven't placed any orders yet, or they're filtered out.
            </p>
          </div>
        ) : (
          filteredOrders.map((order, index) => {
            const StatusIcon = getStatusConfig(order.status).icon;
            const statusStyle = getStatusConfig(order.status);
            
            return (
              <div
                key={order.id}
                onClick={() => navigate("/customer/order-details", { state: { order } })}
                className="bg-white dark:bg-slate-900 rounded-[24px] p-5 shadow-sm border border-gray-100 dark:border-slate-800 cursor-pointer transition-all duration-300 hover:shadow-md active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Order #{order.id}</h3>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-1">{order.date}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                    <StatusIcon size={14} className={statusStyle.color} strokeWidth={2.5} />
                    <span className={`text-[11px] font-bold tracking-wide uppercase ${statusStyle.color}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Preview Avatars */}
                <div className="flex items-center gap-4 py-4 border-y border-gray-100 dark:border-slate-800 border-dashed">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 dark:bg-slate-800 overflow-hidden shadow-sm relative z-[4] flex items-center justify-center" style={{ zIndex: 10 - i }}>
                        {item.image ? (
                          <img 
                            src={item.image.startsWith('/') ? `${item.image}` : item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xs">🍽️</span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center shadow-sm relative z-0">
                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400">+{order.items.length - 4}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 dark:text-slate-300 line-clamp-1">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-0.5">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">Total Amount</p>
                    <span className="font-black text-gray-900 dark:text-white text-lg">₹{order.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 dark:text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav active="orders" />
    </PageLayout>
  );
}