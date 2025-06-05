import { Outlet } from 'react-router-dom'
import { Box, Flex, Text, VStack, HStack, IconButton, useDisclosure, Button } from '@chakra-ui/react'
import { Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react'
import { List, ListItem, ListIcon } from '@chakra-ui/react'
import {
  Menu as MenuIcon,
  HamburgerIcon,
  SettingsIcon, // Example icon, replace with appropriate icons
  InfoOutlineIcon,
  StarIcon,
  AttachmentIcon,
  CalendarIcon, // Assuming a booking icon
  ChatIcon, // Assuming a feedback icon
  ViewIcon // Assuming a files icon
} from '@chakra-ui/icons'
import { useState } from 'react'
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

  // Define all possible menu items with required roles
  const allMenuItems = [
    { text: 'Dashboard', icon: <SettingsIcon />, path: '/', roles: ['ADMIN', 'STAFF', 'USER'] },
    { text: 'Products', icon: <InfoOutlineIcon />, path: '/products', roles: ['ADMIN', 'STAFF', 'USER'] },
    { text: 'Bookings', icon: <StarIcon />, path: '/bookings', roles: ['ADMIN', 'STAFF', 'USER'] },
    { text: 'Feedback', icon: <ChatIcon />, path: '/feedback', roles: ['ADMIN', 'USER'] },
    { text: 'Files', icon: <ViewIcon />, path: '/files', roles: ['ADMIN', 'USER'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = allMenuItems.filter(item =>
    item.roles.includes(user?.role as any) // Cast user?.role to any to match array type
  );

  // Dynamically generate paths based on user role for filtered items
  const roleBasedMenuItems = filteredMenuItems.map(item => ({
    ...item,
    path: item.text === 'Dashboard' ? '/' : `/${user?.role.toLowerCase()}${item.path}`
  }));

  const drawer = (
    <VStack spacing={0} align="stretch">
      <Box p="4">
        <Text fontSize="xl" fontWeight="bold">
          WorkCore
        </Text>
      </Box>
      <List spacing={0}>
        {roleBasedMenuItems.map((item) => (
          <ListItem
            key={item.text}
            p="4"
            cursor="pointer"
            _hover={{
              bg: 'gray.100'
            }}
            onClick={() => {
              navigate(item.path)
              onClose() // Close drawer on navigation
            }}
          >
            <HStack spacing={4}>
              <ListIcon as={() => item.icon} />
              <Text>{item.text}</Text>
            </HStack>
          </ListItem>
        ))}
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
        bg="blue.500" // Example background color
        color="white" // Example text color
        boxShadow="sm" // Example shadow
        zIndex={1} // Ensure it stays on top
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
        mt="64px" // Offset by header height
        flexGrow={1}
        width="100%" // Occupy full width below the header
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
            // Use Chakra UI's size prop or adjust in theme if needed
            // size='xs'
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
            {/* Permanent sidebar content */}
            <Box position="fixed" height="100vh" width={drawerWidth} bg="gray.50"> {/* Example background */}
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
