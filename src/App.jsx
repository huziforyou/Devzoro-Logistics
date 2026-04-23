import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateDispatch from './pages/CreateDispatch';
import DispatchOrders from './pages/DispatchOrders';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DashboardLayout from './layouts/DashboardLayout';
import TrackingPage from './pages/TrackingPage';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin Override: Agar admin hai toh permission check skip karo
  if (user.role === 'admin' || user.role === 'super-admin') {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Permission check for other users
  if (requiredPermission && !user.permissions?.[requiredPermission]) {
    return <Navigate to="/" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Public Tracking Route */}
            <Route path="/track/:trackingId" element={<TrackingPage />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dispatch/create" 
              element={
                <ProtectedRoute>
                  <CreateDispatch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dispatch/edit/:id" 
              element={
                <ProtectedRoute>
                  <CreateDispatch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dispatch" 
              element={
                <ProtectedRoute>
                  <DispatchOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/drivers" 
              element={
                <ProtectedRoute>
                  <Drivers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute requiredPermission="viewReports">
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
