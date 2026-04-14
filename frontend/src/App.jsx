import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPosts from './pages/AdminPosts';
import NotFound from './pages/NotFound';

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131f',
            color: '#f0f0ff',
            border: '1px solid #2a2a45',
            fontFamily: 'Syne, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#00d4aa', secondary: '#0a0a0f' } },
          error: { iconTheme: { primary: '#ff4757', secondary: '#0a0a0f' } },
        }}
      />
      <Navbar />
      <main style={{ paddingTop: '4rem', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/feed') : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/feed'} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/feed" replace /> : <Register />} />

          {/* Student routes */}
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/posts" element={<ProtectedRoute role="admin"><AdminPosts /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
