import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import { Products } from '../pages/Products'
import Services from '../pages/Services'
import Bookings from '../pages/Bookings'
import Feedback from '../pages/Feedback'
import Files from '../pages/Files'
import AdminPanel from '../pages/AdminPanel'

export default function AppRoutes() {
  const { isAuthenticated } = useAuth() || { isAuthenticated: false }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/login" />} />
      <Route path="/services" element={isAuthenticated ? <Services /> : <Navigate to="/login" />} />
      <Route path="/bookings" element={isAuthenticated ? <Bookings /> : <Navigate to="/login" />} />
      <Route path="/feedback" element={isAuthenticated ? <Feedback /> : <Navigate to="/login" />} />
      <Route path="/files" element={isAuthenticated ? <Files /> : <Navigate to="/login" />} />
      <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
} 