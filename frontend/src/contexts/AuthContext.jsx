import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/admin/auth/me');
                    if (response.data?.data) {
                        setUser(response.data.data);
                    } else {
                        // Fallback
                        setUser({ role: localStorage.getItem('role') });
                    }
                } catch (error) {
                    console.error("Token verification failed", error);
                    // Depending on requirements, we might want to logout here
                    // logout();
                }
            }
            setLoading(false);
        };
        verifyToken();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/admin/auth/login', { email, password });
        const { access_token, role } = response.data.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);
        
        // Fetch full profile immediately after login
        const meResponse = await api.get('/admin/auth/me');
        setUser(meResponse.data?.data || { role });
        
        return role;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    const updateUser = (newUserData) => {
        setUser(prevUser => ({ ...prevUser, ...newUserData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
