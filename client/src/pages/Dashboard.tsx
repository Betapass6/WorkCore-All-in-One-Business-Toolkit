import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  List,
  ListItem,
  ListIcon,
  Flex,
  SimpleGrid,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Badge
} from '@chakra-ui/react'
import {
  SettingsIcon,
  InfoOutlineIcon,
  StarIcon,
  AttachmentIcon,
  AddIcon,
} from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DashboardStats } from '../types/dashboard'
import dashboardService from '../services/dashboard.service'

const Dashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role) {
      fetchStats(user.role)
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchStats = async (role: string) => {
    try {
      const data = await dashboardService.getStats(role)
      setStats(data)
    } catch (error) {
      showToast('Failed to fetch dashboard stats', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  return (
    <Box p={6}>
      <Heading as="h4" size="lg" mb={6}>
        Welcome back, {user?.name}!
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Products
            </Text>
            <Text fontSize="2xl" fontWeight="bold">{stats?.totalProducts || 0}</Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Services
            </Text>
            <Text fontSize="2xl" fontWeight="bold">{stats?.totalServices || 0}</Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Bookings
            </Text>
            <Text fontSize="2xl" fontWeight="bold">{stats?.totalBookings || 0}</Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Revenue
            </Text>
            <Text fontSize="2xl" fontWeight="bold">${stats?.totalRevenue || 0}</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <List spacing={3}>
              {stats?.recentActivity?.map((activity, index) => (
                <ListItem key={index}>
                  <HStack spacing={3}>
                    <ListIcon as={activity.type === 'product' ? InfoOutlineIcon : activity.type === 'booking' ? StarIcon : activity.type === 'feedback' ? AttachmentIcon : AttachmentIcon} color="green.500" />
                    <Box flex="1">
                      <Text fontWeight="bold">{activity.description}</Text>
                      <Text fontSize="sm" color="gray.500">{new Date(activity.timestamp).toLocaleString()}</Text>
                    </Box>
                    <Badge colorScheme={activity.type === 'product' ? 'blue' : activity.type === 'booking' ? 'purple' : activity.type === 'feedback' ? 'green' : 'gray'}>
                      {activity.type}
                    </Badge>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={() => navigate('/products/new')}
              >
                Add Product
              </Button>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={() => navigate('/services/new')}
              >
                Add Service
              </Button>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={() => navigate('/bookings/new')}
              >
                New Booking
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default Dashboard
