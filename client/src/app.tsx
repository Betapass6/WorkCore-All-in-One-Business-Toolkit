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

              {/* Dynamic role-based routes for all main pages */}
              <Route
                path="/dashboard/:role"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/products/:role"
                element={<ProtectedRoute><Products /></ProtectedRoute>}
              />
              <Route
                path="/products/:id/:role"
                element={<ProtectedRoute><ProductDetails /></ProtectedRoute>}
              />
              <Route
                path="/services/:role"
                element={<ProtectedRoute><Services /></ProtectedRoute>}
              />
              <Route
                path="/bookings/:role"
                element={<ProtectedRoute><Bookings /></ProtectedRoute>}
              />
              <Route
                path="/feedback/:role"
                element={<ProtectedRoute><Feedback /></ProtectedRoute>}
              />
              <Route
                path="/files/:role"
                element={<ProtectedRoute><Files /></ProtectedRoute>}
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