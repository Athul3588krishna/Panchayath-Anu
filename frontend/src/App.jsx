import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Schemes from './pages/Schemes';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageSchemes from './pages/admin/ManageSchemes';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';

// Protected Route for Citizens
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  return token && user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
            <Navbar />
            <main className="flex-grow flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/announcements" element={<Announcements />} />

                {/* Citizen Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Protected Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/schemes" element={
                  <AdminRoute>
                    <ManageSchemes />
                  </AdminRoute>
                } />
                <Route path="/admin/announcements" element={
                  <AdminRoute>
                    <ManageAnnouncements />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <ManageUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/reports" element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                } />

                {/* Catch-all Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
