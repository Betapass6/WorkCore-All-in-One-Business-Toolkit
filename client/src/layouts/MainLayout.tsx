import { Outlet } from 'react-router-dom'
import { Box, Flex, Text, VStack, HStack, IconButton, useDisclosure, Button } from '@chakra-ui/react'
import { Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react'
import { List, ListItem, ListIcon } from '@chakra-ui/react'
import {
  Menu as MenuIcon,
  HamburgerIcon,
  SettingsIcon,
  InfoOutlineIcon,
  StarIcon,
  AttachmentIcon,
  CalendarIcon,
  ChatIcon,
  ViewIcon
} from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 240

export interface MainLayoutProps {
  children?: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleDrawerToggle = () => {
    isOpen ? onClose() : onOpen()
  }

  // Helper to construct paths with role
  const withRole = (basePath: string) => {
    const rolePath = user?.role?.toLowerCase() ?? ''
    return rolePath ? `${basePath}/${rolePath}` : basePath
  }

  const drawer = (
    <VStack spacing={0} align="stretch">
      <Box p="4">
        <Text fontSize="xl" fontWeight="bold">
          WorkCore
        </Text>
      </Box>
      <List spacing={0}>
        <ListItem
          p="4"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          onClick={() => {
            navigate(withRole('/dashboard'))
            onClose()
          }}
        >
          <HStack spacing={4}>
            <ListIcon as={SettingsIcon} />
            <Text>Dashboard</Text>
          </HStack>
        </ListItem>
        <ListItem
          p="4"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          onClick={() => {
            navigate(withRole('/products'))
            onClose()
          }}
        >
          <HStack spacing={4}>
            <ListIcon as={InfoOutlineIcon} />
            <Text>Products</Text>
          </HStack>
        </ListItem>
        <ListItem
          p="4"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          onClick={() => {
            navigate(withRole('/services'))
            onClose()
          }}
        >
          <HStack spacing={4}>
            <ListIcon as={StarIcon} />
            <Text>Services</Text>
          </HStack>
        </ListItem>
        <ListItem
          p="4"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          onClick={() => {
            navigate(withRole('/bookings'))
            onClose()
          }}
        >
          <HStack spacing={4}>
            <ListIcon as={CalendarIcon} />
            <Text>Bookings</Text>
          </HStack>
        </ListItem>
        <ListItem
          p="4"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          onClick={() => {
            navigate(withRole('/feedback'))
            onClose()
          }}
        >
          <HStack spacing={4}>
            <ListIcon as={ChatIcon} />
            <Text>Feedback</Text>
          </HStack>
        </ListItem>
        <ListItem
          p="4"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          onClick={() => {
            navigate(withRole('/files'))
            onClose()
          }}
        >
          <HStack spacing={4}>
            <ListIcon as={ViewIcon} />
            <Text>Files</Text>
          </HStack>
        </ListItem>
        {user?.role === 'ADMIN' && (
          <ListItem
            p="4"
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
            onClick={() => {
              navigate('/admin')
              onClose()
            }}
          >
            <HStack spacing={4}>
              <ListIcon as={SettingsIcon} />
              <Text>Admin Panel</Text>
            </HStack>
          </ListItem>
        )}
      </List>
    </VStack>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar equivalent */}
      <Box
        as="header"
        position="fixed"
        width="100%"
        bg="blue.500"
        color="white"
        boxShadow="sm"
        zIndex={1}
      >
        <Flex h="64px" px="4" align="center">
          <IconButton
            aria-label="open drawer"
            icon={<HamburgerIcon />}
            onClick={handleDrawerToggle}
            display={{ sm: 'none' }}
            mr="2"
            variant="unstyled"
            color="white"
          />
          <Text fontSize="lg" fontWeight="bold" flexGrow={1}>
            {user?.name}
          </Text>
          <Button onClick={logout} variant="ghost" colorScheme="whiteAlpha">
            Logout
          </Button>
        </Flex>
      </Box>

      {/* Container for Sidebar and Main Content */}
      <Flex
        as="section"
        mt="64px"
        flexGrow={1}
        width="100%"
      >
        {/* Drawer (Sidebar) for small screens */}
        <Box
          as="nav"
          width={{ base: 'full', sm: drawerWidth }}
          flexShrink={{ sm: 0 }}
        >
          <Drawer
            isOpen={isOpen}
            onClose={onClose}
            placement="left"
          >
            <DrawerOverlay />
            <DrawerContent>{drawer}</DrawerContent>
          </Drawer>

          {/* Permanent Drawer for larger screens */}
          <Box
            display={{ base: 'none', sm: 'block' }}
            width={drawerWidth}
            flexShrink={0}
          >
            <Box position="fixed" height="100vh" width={drawerWidth} bg="gray.50">
              {drawer}
            </Box>
          </Box>
        </Box>

        {/* Main content area */}
        <Box
          as="main"
          flexGrow={1}
          p="6"
        >
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

export default MainLayout
