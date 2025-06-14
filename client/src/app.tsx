import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Unauthorized404 from './pages/Unauthorized404';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import Feedback from './pages/Feedback';
import Files from './pages/Files';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/MainLayout';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes using MainLayout */}
            <Route element={<Layout />}>
              <Route
                path="/"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF', 'USER']}><Dashboard /></ProtectedRoute>}
              />

              <Route
                path="/dashboard"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF', 'USER']}><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/products"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}><Products /></ProtectedRoute>}
              />
              <Route
                path="/products/:id"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}><ProductDetails /></ProtectedRoute>}
              />
              <Route
                path="/services"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}><Services /></ProtectedRoute>}
              />
              <Route
                path="/bookings"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF', 'USER']}><Bookings /></ProtectedRoute>}
              />
              <Route
                path="/feedback"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF', 'USER']}><Feedback /></ProtectedRoute>}
              />
              <Route
                path="/files"
                element={<ProtectedRoute requiredRoles={['ADMIN', 'STAFF', 'USER']}><Files /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute requiredRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin/users"
                element={<ProtectedRoute requiredRoles={['ADMIN']}><UserManagement /></ProtectedRoute>}
              />
            </Route>

            {/* Default Route: Show 404 for unknown paths */}
            <Route path="*" element={<Unauthorized404 />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;