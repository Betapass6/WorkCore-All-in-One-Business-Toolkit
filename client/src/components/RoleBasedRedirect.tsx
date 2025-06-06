import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case 'ADMIN':
            navigate('/dashboard/admin', { replace: true });
            break;
          case 'STAFF':
            navigate('/dashboard/staff', { replace: true });
            break;
          case 'USER':
            navigate('/dashboard/user', { replace: true });
            break;
          default:
            // Fallback for unknown roles or just redirect to a default user dashboard
            navigate('/dashboard/user', { replace: true });
        }
      } else {
        // If not authenticated, redirect to login (although ProtectedRoute should handle this)
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Optionally, show a loading spinner while checking auth status
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // This component doesn't render anything visually after redirect
  return null;
};

export default RoleBasedRedirect;