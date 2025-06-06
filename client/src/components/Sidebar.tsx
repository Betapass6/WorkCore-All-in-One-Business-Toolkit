import { Box, VStack, Link, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const { user } = useAuth() || { user: null }

  return (
    <Box
      w="250px"
      h="100vh"
      bg="gray.800"
      color="white"
      p={4}
      position="fixed"
      left={0}
      top={0}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          WorkCore
        </Text>
        <Link as={RouterLink} to={user ? `/dashboard/${user.role.toLowerCase()}` : "/dashboard"}>
          Dashboard
        </Link>
        <Link as={RouterLink} to={user ? `/products/${user.role.toLowerCase()}` : "/products"}>
          Products
        </Link>
        <Link as={RouterLink} to={user ? `/services/${user.role.toLowerCase()}` : "/services"}>
          Services
        </Link>
        <Link as={RouterLink} to={user ? `/bookings/${user.role.toLowerCase()}` : "/bookings"}>
          Bookings
        </Link>
        <Link as={RouterLink} to={user ? `/feedback/${user.role.toLowerCase()}` : "/feedback"}>
          Feedback
        </Link>
        <Link as={RouterLink} to={user ? `/files/${user.role.toLowerCase()}` : "/files"}>
          Files
        </Link>
        {user?.role === 'ADMIN' && (
          <Link as={RouterLink} to="/admin">
            Admin Panel
          </Link>
        )}
      </VStack>
    </Box>
  )
}
