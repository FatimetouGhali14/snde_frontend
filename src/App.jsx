import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Signaler from './pages/Signaler';
import Forages from './pages/Forages';
import Utilisateurs from './pages/Utilisateurs';
import './index.css';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/incidents" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'directeur' || user.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/incidents" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/dashboard" element={
        <PrivateRoute roles={['directeur', 'admin', 'chef_brigade']}>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/incidents" element={
        <PrivateRoute>
          <Incidents />
        </PrivateRoute>
      } />
      <Route path="/signaler" element={
        <PrivateRoute>
          <Signaler />
        </PrivateRoute>
      } />
      <Route path="/forages" element={
        <PrivateRoute>
          <Forages />
        </PrivateRoute>
      } />
      <Route path="/utilisateurs" element={
        <PrivateRoute roles={['admin', 'directeur']}>
          <Utilisateurs />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}