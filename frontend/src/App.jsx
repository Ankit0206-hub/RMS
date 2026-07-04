import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Employees from './pages/admin/Employees';
import AddEmployee from './pages/admin/AddEmployee';
import EditEmployee from './pages/admin/EditEmployee';
import Settings from './pages/admin/Settings';
import Tables from './pages/admin/Tables';
import FoodItems from './pages/admin/FoodItems';
import CategoryMenu from './pages/admin/CategoryMenu';
import AddItem from './pages/admin/AddItem';
import Orders from './pages/admin/Orders';
import Bills from './pages/admin/Bills';
import Dashboard from './pages/admin/Dashboard';
import Logs from './pages/admin/Logs';
import OperatorLayout from './layouts/OperatorLayout';
import WaiterLayout from './layouts/WaiterLayout';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import CustomerMenu from './pages/customer/Menu';
import MenuItems from './pages/admin/MenuItems';
import AddCategoryWithItems from './pages/admin/AddCategoryWithItems';
import MenuModifiers from './pages/admin/MenuModifiers';
import MenuVariants from './pages/admin/MenuVariants';
import AddTable from './pages/admin/AddTable';
import TableReservations from './pages/admin/TableReservations';
import OrderDetails from './pages/admin/OrderDetails';
import OrderReturns from './pages/admin/OrderReturns';
import Invoices from './pages/admin/Invoices';
import Payments from './pages/admin/Payments';
import Refunds from './pages/admin/Refunds';
import PaymentMethods from './pages/admin/PaymentMethods';
import Customers from './pages/admin/Customers';
import AnalyticsOverview from './pages/admin/AnalyticsOverview';
import AnalyticsPerformance from './pages/admin/AnalyticsPerformance';
import AnalyticsFood from './pages/admin/AnalyticsFood';
import AnalyticsSales from './pages/admin/AnalyticsSales';
import AnalyticsCustomer from './pages/admin/AnalyticsCustomer';
import Notifications from './pages/admin/Notifications';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />; // Or a generic unauthorized page
    }
    
    return children;
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <WebSocketProvider>
                    <BrowserRouter>
                        <Toaster position="top-right" toastOptions={{
                            style: { background: '#171717', color: '#fff', border: '1px solid #333' }
                        }}/>
                        <Routes>
                            <Route path="/" element={<Navigate to="/login" />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/customer/menu" element={<CustomerMenu />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="/admin/dashboard" />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="employees" element={<Employees />} />
                            <Route path="employees/add" element={<AddEmployee />} />
                            <Route path="employees/edit/:id" element={<EditEmployee />} />
                            <Route path="food-items" element={<FoodItems />} />
                            <Route path="food-items/:categoryId/menu" element={<CategoryMenu />} />
                            <Route path="food-items/:categoryId/menu/add" element={<AddItem />} />
                            <Route path="menu" element={<MenuItems />} />
                            <Route path="menu/add" element={<AddCategoryWithItems />} />
                            <Route path="menu/modifiers" element={<MenuModifiers />} />
                            <Route path="menu/variants" element={<MenuVariants />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="orders/:id" element={<OrderDetails />} />
                            <Route path="orders/returns" element={<OrderReturns />} />
                            <Route path="billing" element={<Bills />} />
                            <Route path="billing/invoices" element={<Invoices />} />
                            <Route path="billing/payments" element={<Payments />} />
                            <Route path="billing/refunds" element={<Refunds />} />
                            <Route path="billing/methods" element={<PaymentMethods />} />
                            <Route path="customers" element={<Customers />} />
                            <Route path="analytics" element={<AnalyticsOverview />} />
                            <Route path="analytics/performance" element={<AnalyticsPerformance />} />
                            <Route path="analytics/menu" element={<AnalyticsFood />} />
                            <Route path="analytics/sales" element={<AnalyticsSales />} />
                            <Route path="analytics/customer" element={<AnalyticsCustomer />} />
                            <Route path="notifications" element={<Notifications />} />
                            <Route path="logs" element={<Logs />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="tables" element={<Tables />} />
                            <Route path="tables/add" element={<AddTable />} />
                            <Route path="tables/reservations" element={<TableReservations />} />
                        </Route>

                        {/* Operator Routes */}
                        <Route path="/operator" element={<ProtectedRoute allowedRoles={['operator', 'admin']}><OperatorLayout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="/operator/dashboard" />} />
                            <Route path="dashboard" element={<OperatorDashboard />} />
                            <Route path="tables" element={<Tables />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="billing" element={<Bills />} />
                            <Route path="food-items" element={<FoodItems />} />
                            <Route path="food-items/:categoryId/menu" element={<CategoryMenu />} />
                            <Route path="food-items/:categoryId/menu/add" element={<AddItem />} />
                        </Route>

                        {/* Waiter Routes */}
                        <Route path="/waiter" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><WaiterLayout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="/waiter/dashboard" />} />
                            <Route path="dashboard" element={<WaiterDashboard />} />
                            <Route path="orders" element={<div className="text-white p-6">Serving Queue (Waiter)</div>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
                </WebSocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;
