import React from'react';
import {Outlet, NavLink, useNavigate, useLocation} from'react-router-dom';
import {useAuth} from'../contexts/AuthContext';
import {Utensils, Grid, ClipboardList, Bell, User} from'lucide-react';

const WaiterLayout = () => {
 const {logout} = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const navItems = [
 {path:'/waiter/tables', label:'Tables', icon: Grid},
 {path:'/waiter/take-order', label:'Menu', icon: Utensils},
 {path:'/waiter/orders', label:'Orders', icon: ClipboardList},
 {path:'/waiter/requests', label:'Requests', icon: Bell},
 {path:'/waiter/profile', label:'Profile', icon: User},
 ];

 // Check if a path is active (including sub-routes)
 const isActivePath = (path) => {
 if (path ==='/waiter/tables'&& (location.pathname ==='/waiter/tables'|| location.pathname.match(/^\/waiter\/tables\/\d+$/))) return true;
 if (path ==='/waiter/take-order'&& location.pathname.includes('/menu')) return true;
 if (path ==='/waiter/orders'&& location.pathname.includes('/orders')) return true;
 if (path ==='/waiter/requests'&& location.pathname.includes('/requests')) return true;
 if (path ==='/waiter/profile'&& location.pathname.includes('/profile')) return true;
 return location.pathname === path;
};

 return (
 <div className="flex h-screen w-full justify-center bg-slate-50 font-inter">
 <div className="relative h-full w-full max-w-7xl overflow-hidden bg-slate-50 shadow-sm sm:border-x border-white/20 flex flex-col">
 
 {/* Main Content Area */}
 <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-[72px]">
 <Outlet />
 </main>

 {/* Universal Bottom Navigation */}
 <nav className="absolute bottom-0 left-0 right-0 bg-white/20 backdrop-blur-2xl border-t border-white/40 flex justify-around items-center h-[72px] px-2 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
 {navItems.map((item) => {
 const active = isActivePath(item.path);
 return (
 <NavLink
 key={item.path}
 to={item.path}
 className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
 active ?'text-rose-500':'text-gray-500'
}`}
 >
 <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ?'bg-rose-500/10':'bg-transparent'}`}>
 <item.icon className={`h-6 w-6 ${active ?'fill-rose-100 stroke-rose-500':''}`} strokeWidth={active ? 2.5 : 2} />
 </div>
 <span className={`text-[11px] font-bold ${active ?'text-rose-500':'text-gray-500'}`}>
 {item.label}
 </span>
 </NavLink>
 );
})}
 </nav>
 </div>
 </div>
 );
};

export default WaiterLayout;
