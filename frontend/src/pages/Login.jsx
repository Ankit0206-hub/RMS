import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    UtensilsCrossed, Activity, Users, ConciergeBell, 
    ShieldCheck, User, Lock, Eye, EyeOff, Utensils
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = await login(email, password);
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'operator') {
                navigate('/operator/dashboard');
            } else if (role === 'waiter') {
                navigate('/waiter/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-inter bg-[#f4f7fb] p-4 sm:p-8 relative">
            <div className="w-full max-w-[950px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row border border-gray-100 relative z-10 min-h-[580px]">
                {/* Left Panel - Hidden on small screens */}
                <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-b from-[#131131] via-[#1a1753] to-[#361e70] relative flex-col justify-between p-10 text-white">
                    {/* Decorative background overlay (simulating the dark restaurant image fade) */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#131131]/80 via-[#1a1753]/90 to-[#361e70]/95"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center space-x-3 mb-16">
                        <div className="bg-transparent p-2 border-2 border-[#6366f1] rounded-xl flex items-center justify-center">
                            <UtensilsCrossed className="w-8 h-8 text-[#6366f1]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-wide">Dine<span className="text-[#6366f1]">Ops</span></h1>
                            <p className="text-xs text-gray-300 font-medium tracking-wider">Restaurant Management System</p>
                        </div>
                    </div>

                    {/* Hero Text */}
                    <div className="mb-12">
                        <h2 className="text-4xl font-extrabold leading-tight mb-4">
                            Smart. Simple.<br/>Seamless <span className="text-[#a855f7]">Operations.</span>
                        </h2>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                            DineOps helps you manage your restaurant operations, staff, orders, billing and more from one powerful dashboard.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-6 flex-1">
                        <div className="flex items-start space-x-4">
                            <div className="bg-[#6366f1] p-3 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Real-time Analytics</h3>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px]">Track sales, orders and performance in real-time.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-[#6366f1] p-3 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Staff Management</h3>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px]">Manage waiters, operators and roles efficiently.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-[#6366f1] p-3 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
                                <ConciergeBell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Order & Table Management</h3>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px]">Seamlessly manage orders, tables and customer sessions.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-[#6366f1] p-3 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Secure & Reliable</h3>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px]">Your data is safe with enterprise grade security.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

                {/* Right Panel - Login Form */}
                <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-10 relative bg-white">
                    <div className="w-full max-w-[400px]">
                        
                        {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6366f1] mb-6 shadow-lg shadow-indigo-200">
                            <div className="border-2 border-white p-1.5 rounded-lg">
                                <Utensils className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome <span className="text-[#6366f1]">Back!</span></h2>
                        <p className="text-sm text-gray-500 font-medium">Login to your DineOps account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm text-center font-medium">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Email or Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-[#6366f1]" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-gray-900 transition-all shadow-sm placeholder:text-gray-400 font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email or username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[#6366f1]" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-gray-900 transition-all shadow-sm placeholder:text-gray-400 font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 pb-3">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#6366f1] focus:ring-[#6366f1] border-gray-300 rounded cursor-pointer accent-[#6366f1]"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-700 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-xs font-bold">
                                <a href="#" className="text-[#6366f1] hover:text-[#4f46e5]">
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#6366f1] hover:bg-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366f1] transition-all"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login to DineOps
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white text-gray-500 font-medium">or continue with</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 shadow-sm rounded-xl bg-white hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Login with Google
                        </button>
                        <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 shadow-sm rounded-xl bg-white hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 21 21">
                                <path fill="#f25022" d="M1 1h9v9H1z" />
                                <path fill="#7fba00" d="M11 1h9v9h-9z" />
                                <path fill="#00a4ef" d="M1 11h9v9H1z" />
                                <path fill="#ffb900" d="M11 11h9v9h-9z" />
                            </svg>
                            Login with Microsoft
                        </button>
                    </div>

                    <p className="mt-8 text-center text-xs font-medium text-gray-600">
                        Don't have an account? <a href="#" className="font-bold text-[#6366f1] hover:text-[#4f46e5]">Contact your administrator</a>
                    </p>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Login;
