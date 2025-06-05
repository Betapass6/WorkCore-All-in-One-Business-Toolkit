import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Center } from '@chakra-ui/react'; // Assuming Chakra UI is used for loading indicator

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'STAFF' | 'USER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isAdmin, isStaff, loading } = useAuth();

  // Show a loading indicator while authentication status is being checked
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'ADMIN' && !isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
    if (requiredRole === 'STAFF' && !isStaff && !isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
    if (requiredRole === 'USER' && !user) { // Added check for USER role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 