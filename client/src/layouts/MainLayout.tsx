import { Box, Flex } from '@chakra-ui/react'
import { ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Navbar />
        <Box p="6">{children}</Box>
      </Box>
    </Flex>
  )
}
