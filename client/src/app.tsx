import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import Feedback from './pages/Feedback';
import Files from './pages/Files';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/MainLayout';
import RoleBasedRedirect from './components/RoleBasedRedirect';

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
              {/* Use RoleBasedRedirect for the root path */}
              <Route
                path="/"
                element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>}
              />

              {/* General protected routes within the layout */}
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <Files />
                  </ProtectedRoute>
                }
              />

              {/* Role-specific Routes (nested within the Layout route) */}
              {/* These routes will now be the actual destinations for role-based redirection */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/:id"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Services />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/feedback"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Feedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/files"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Files />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute requiredRole="STAFF">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/products"
                element={
                  <ProtectedRoute requiredRole="STAFF">
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/products/:id"
                element={
                  <ProtectedRoute requiredRole="STAFF">
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/services"
                element={
                  <ProtectedRoute requiredRole="STAFF">
                    <Services />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/bookings"
                element={
                  <ProtectedRoute requiredRole="STAFF">
                    <Bookings />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/products"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/products/:id"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/bookings"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/feedback"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Feedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/files"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Files />
                  </ProtectedRoute>
                }
              />

            </Route>

            {/* Default Routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;