import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import PublicSearch   from './pages/PublicSearch';
import Hospitals      from './pages/Hospitals';
import Donors         from './pages/Donors';
import UserDashboard  from './pages/UserDashboard';
import HospDashboard  from './pages/HospDashboard';

const Protected = ({ children, role }) => {
  const { isLoggedIn, userType } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role && userType !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily:'Nunito,sans-serif', fontWeight:600, borderRadius:'50px', fontSize:'14px' },
          duration: 3500,
        }}
      />
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/search"    element={<PublicSearch />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/donors"    element={<Donors />} />
        <Route path="/dashboard" element={<Protected role="user"><UserDashboard /></Protected>} />
        <Route path="/hospital/dashboard" element={<Protected role="hospital"><HospDashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
