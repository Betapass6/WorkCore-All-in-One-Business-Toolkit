import React from 'react'
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
        <Link as={RouterLink} to="/dashboard">
          Dashboard
        </Link>
        <Link as={RouterLink} to="/products">
          Products
        </Link>
        <Link as={RouterLink} to="/services">
          Services
        </Link>
        <Link as={RouterLink} to="/bookings">
          Bookings
        </Link>
        <Link as={RouterLink} to="/feedback">
          Feedback
        </Link>
        <Link as={RouterLink} to="/files">
          Files
        </Link>
        {user?.role === 'admin' && (
          <Link as={RouterLink} to="/admin">
            Admin Panel
          </Link>
        )}
      </VStack>
    </Box>
  )
}
