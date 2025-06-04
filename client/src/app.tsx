import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { theme } from './theme';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route element={<Layout />}>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
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
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="products/:id" element={<ProductDetails />} />
                        <Route path="services" element={<Services />} />
                        <Route path="bookings" element={<Bookings />} />
                        <Route path="feedback" element={<Feedback />} />
                        <Route path="files" element={<Files />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route
                path="/staff/*"
                element={
                  <ProtectedRoute requiredRole="STAFF">
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="products/:id" element={<ProductDetails />} />
                        <Route path="services" element={<Services />} />
                        <Route path="bookings" element={<Bookings />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="/user/*"
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="products/:id" element={<ProductDetails />} />
                        <Route path="bookings" element={<Bookings />} />
                        <Route path="feedback" element={<Feedback />} />
                        <Route path="files" element={<Files />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Default Routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;