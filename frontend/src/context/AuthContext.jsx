import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // Use `undefined` as initial state to handle loading
  const [user, setUser] = useState(undefined); 
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const decodedToken = jwtDecode(parsedUser.token);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(parsedUser);
        }
      } else {
        setUser(null); // Explicitly set to null if no user is found
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      setUser(null);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      // ✨ FIXED: More specific redirection logic
      if (data.role === 'superadmin') {
        navigate('/superadmin-dashboard');
      } else if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/citizen-dashboard');
      }

      
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/citizen-dashboard');
      
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success("Logged out successfully!");
  };

  const value = { user, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
