import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Assume logged in if token exists for now.
            // Ideally verify token with a /me endpoint
            setUser({ role: localStorage.getItem('role') });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/admin/auth/login', { email, password });
        const { access_token, role } = response.data.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);
        setUser({ role });
        return role;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
