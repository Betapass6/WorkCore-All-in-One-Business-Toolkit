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

  const navItems = [
    {
      label: 'Dashboard',
      icon: SettingsIcon,
      path: '/',
      roles: ['ADMIN', 'STAFF', 'USER'],
    },
    {
      label: 'Products',
      icon: InfoOutlineIcon,
      path: '/products',
      roles: ['ADMIN', 'STAFF'],
    },
    {
      label: 'Services',
      icon: StarIcon,
      path: '/services',
      roles: ['ADMIN', 'STAFF'],
    },
    {
      label: 'Bookings',
      icon: CalendarIcon,
      path: '/bookings',
      roles: ['ADMIN', 'STAFF', 'USER'],
    },
    {
      label: 'Feedback',
      icon: ChatIcon,
      path: '/feedback',
      roles: ['ADMIN', 'STAFF', 'USER'],
    },
    {
      label: 'Files',
      icon: ViewIcon,
      path: '/files',
      roles: ['ADMIN', 'STAFF', 'USER'],
    },
    {
      label: 'Admin Panel',
      icon: SettingsIcon,
      path: '/admin',
      roles: ['ADMIN'],
    },
  ]

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role ?? 'USER')
  )

  const drawer = (
    <VStack spacing={0} align="stretch">
      <Box p="4">
        <Text fontSize="xl" fontWeight="bold">
          WorkCore
        </Text>
      </Box>
      <List spacing={0}>
        {filteredNavItems.map((item) => (
          <ListItem
            key={item.label}
            p="4"
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
            onClick={() => {
              navigate(item.path)
              onClose()
            }}
          >
            <HStack spacing={4}>
              <ListIcon as={item.icon} />
              <Text>{item.label}</Text>
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
