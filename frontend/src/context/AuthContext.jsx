import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,     setUser]     = useState(null);
  const [hospital, setHospital] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bbt_token');
    const type  = localStorage.getItem('bbt_type');
    const data  = localStorage.getItem('bbt_user');
    if (token && type && data) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const parsed = JSON.parse(data);
      if (type === 'user')     setUser(parsed);
      if (type === 'hospital') setHospital(parsed);
      setUserType(type);
    }
    setLoading(false);
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('bbt_token', token);
    localStorage.setItem('bbt_type',  'user');
    localStorage.setItem('bbt_user',  JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData); setUserType('user'); setHospital(null);
  };

  const loginHospital = (token, hospitalData) => {
    localStorage.setItem('bbt_token', token);
    localStorage.setItem('bbt_type',  'hospital');
    localStorage.setItem('bbt_user',  JSON.stringify(hospitalData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setHospital(hospitalData); setUserType('hospital'); setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('bbt_token');
    localStorage.removeItem('bbt_type');
    localStorage.removeItem('bbt_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null); setHospital(null); setUserType(null);
  };

  return (
    <AuthContext.Provider value={{
      user, hospital, userType, loading,
      isLoggedIn: !!userType, loginUser, loginHospital, logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
