import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Flex>
        <Sidebar />
        <Box flex="1" p={8}>
          {children}
        </Box>
      </Flex>
    </Box>
  )
}
