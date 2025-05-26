import React from 'react'
import { Box, Flex, Button, Link, useColorModeValue } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth() || { user: null, logout: () => {} }
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Link as={RouterLink} to="/" fontWeight="bold">
            WorkCore
          </Link>
        </Flex>

        <Flex alignItems="center" gap={4}>
          {user ? (
            <>
              <Link as={RouterLink} to="/dashboard">
                Dashboard
              </Link>
              <Button onClick={logout} variant="ghost">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link as={RouterLink} to="/login">
                Login
              </Link>
              <Link as={RouterLink} to="/register">
                Register
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}