import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import customerApi from '../../services/customerApi';
import { getWsUrl } from "../../services/api";
import { playNotificationSound } from "../../utils/audio";
import { ShoppingCart, Utensils, CheckCircle, Search } from 'lucide-react';
import { Button, Card, Modal } from '../../components/ui';
import { toast, Toaster } from 'react-hot-toast';

const CustomerMenu = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const tableId = location.state?.tableId || searchParams.get('table') || 1;
    
    const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
    const queryClient = useQueryClient();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const [ws, setWs] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Initialize Session
    const startSessionMutation = useMutation({
        mutationFn: () => customerApi.startSession({
            table_id: tableId.toString(),
            guests: 2
        }),
        onSuccess: (res) => {
            setSessionId(res.session_id);
            if (res.token) {
                localStorage.setItem('customer_token', res.token);
            }
        }
    });

    useEffect(() => {
        if (!sessionId) {
            startSessionMutation.mutate();
        }
    }, [tableId, sessionId]);

    // 2. Connect Customer WebSocket when session is ready
    useEffect(() => {
        if (sessionId) {
            const socket = new WebSocket(`${getWsUrl()}/ws/customer?session_id=${sessionId}`);
            socket.onopen = () => console.log("Customer WebSocket Connected");
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("Customer received event:", data);
                if (data.event === 'order.updated' || data.event === 'order.created') {
                    playNotificationSound();
                    setOrderStatus(data.payload.status);
                    toast(`Your order is now: ${data.payload.status}`, { icon: '🔔' });
                } else if (data.event === 'menu.updated') {
                    queryClient.invalidateQueries({ queryKey: ['customerMenu'] });
                }
            };
            setWs(socket);
            return () => socket.close();
        }
    }, [sessionId]);

    // 3. Fetch Menu
    const { data: menuData, isLoading } = useQuery({
        queryKey: ['public_menu'],
        queryFn: async () => {
            const res = await customerApi.getMenu();
            // Flatten categories to get items
            const items = [];
            res.forEach(cat => {
                if (cat.items) {
                    items.push(...cat.items);
                }
            });
            return items;
        }
    });

    const addToCart = (item) => {
        setCart([...cart, { ...item, cartId: Math.random() }]);
        toast.success(`Added ${item.name} to cart`);
    };

    const placeOrderMutation = useMutation({
        mutationFn: (orderItems) => api.post('/admin/ordering/orders', {
            session_id: sessionId,
            items: orderItems,
            special_instructions: "Please make it spicy."
        }),
        onSuccess: () => {
            toast.success("Order sent to kitchen!");
            setCart([]);
            setIsCartOpen(false);
        }
    });

    const handlePlaceOrder = () => {
        if (!cart.length) return;
        
        // Group by menu_item_id to calculate quantities
        const itemMap = {};
        cart.forEach(item => {
            if (itemMap[item.id]) itemMap[item.id].quantity += 1;
            else itemMap[item.id] = { menu_item_id: item.id, quantity: 1, notes: "" };
        });
        
        const items = Object.values(itemMap);
        placeOrderMutation.mutate(items);
    };

    if (isLoading || !sessionId) return <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center text-gray-900 dark:text-white">Loading Menu...</div>;

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white pb-24">
            <Toaster position="top-center" toastOptions={{ style: { background: '#171717', color: '#111827', border: '1px solid #333' }}}/>
            
            <header className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 p-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center">
                    <Utensils className="h-6 w-6 text-cyan-600 mr-2" />
                    <h1 className="text-xl font-bold">DineOps Menu</h1>
                </div>
                <div className="text-sm text-gray-500 dark:text-slate-400">Table {tableId}</div>
            </header>

            {orderStatus && (
                <div className="bg-cyan-600/20 border-b border-cyan-500/50 p-3 text-center text-indigo-300 text-sm font-medium flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Current Order Status: {orderStatus}
                </div>
            )}

            <div className="px-4 pt-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for food..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                    const filteredItems = (menuData || []).filter(item => 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredItems.length === 0 && !isLoading) {
                        return (
                            <div className="col-span-full flex flex-col items-center justify-center h-48 text-gray-400">
                                <Utensils size={40} className="mb-3 text-gray-300 dark:text-slate-600" />
                                <h2 className="text-lg font-bold text-gray-600 dark:text-slate-400">No items found</h2>
                                <p className="text-sm">Try searching for something else</p>
                            </div>
                        );
                    }

                    return filteredItems.map(item => (
                        <Card key={item.id} className="p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">{item.description}</p>
                                <p className="text-cyan-600 font-medium mt-1">₹{parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <Button onClick={() => addToCart(item)} size="sm">Add</Button>
                        </Card>
                    ));
                })()}
            </div>

            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center z-20">
                    <div>
                        <div className="text-gray-500 dark:text-slate-400 text-sm">{cart.length} items</div>
                        <div className="font-bold text-lg">₹{cartTotal.toFixed(2)}</div>
                    </div>
                    <Button onClick={() => setIsCartOpen(true)} className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
                    </Button>
                </div>
            )}

            <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Your Order">
                <div className="space-y-4">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
                            <span>{item.name}</span>
                            <span>₹{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <Button 
                        onClick={handlePlaceOrder} 
                        className="w-full mt-4"
                        disabled={placeOrderMutation.isPending}
                    >
                        {placeOrderMutation.isPending ? 'Sending...' : 'Send to Kitchen'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerMenu;
