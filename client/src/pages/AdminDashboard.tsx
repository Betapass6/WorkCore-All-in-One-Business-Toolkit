import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  SimpleGrid,
  Heading,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { InfoOutlineIcon, StarIcon, ChatIcon, ViewIcon } from '@chakra-ui/icons'
import { FaUsers } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import adminDashboardService from '../services/adminDashboard.service'

interface AdminDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalBookings: number;
  totalFeedback: number;
  totalFiles: number;
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchStats()
    } else if (!user) {
      navigate('/login')
    } else {
      navigate('/unauthorized')
    }
  }, [user, navigate])

  const fetchStats = async () => {
    try {
      const data = await adminDashboardService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      showToast('Failed to fetch admin dashboard stats', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <VStack justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </VStack>
    )
  }

  return (
    <Box p={6}>
      <Heading as="h4" size="lg" mb={6}>
        Admin Dashboard Overview
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Users
            </Text>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="2xl" fontWeight="bold">{stats?.totalUsers || 0}</Text>
              <Button size="sm" onClick={() => navigate('/admin/users')} leftIcon={<FaUsers />}>
                Manage Users
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Products
            </Text>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="2xl" fontWeight="bold">{stats?.totalProducts || 0}</Text>
              <Button size="sm" onClick={() => navigate('/products')} leftIcon={<InfoOutlineIcon />}>
                View Products
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Bookings
            </Text>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="2xl" fontWeight="bold">{stats?.totalBookings || 0}</Text>
              <Button size="sm" onClick={() => navigate('/bookings')} leftIcon={<StarIcon />}>
                View Bookings
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Feedback
            </Text>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="2xl" fontWeight="bold">{stats?.totalFeedback || 0}</Text>
              <Button size="sm" onClick={() => navigate('/feedback')} leftIcon={<ChatIcon />}>
                View Feedback
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Files
            </Text>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="2xl" fontWeight="bold">{stats?.totalFiles || 0}</Text>
              <Button size="sm" onClick={() => navigate('/files')} leftIcon={<ViewIcon />}>
                View Files
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <VStack spacing={6} align="stretch">
        {/* You can add more admin-specific sections here */}
      </VStack>
    </Box>
  )
}

export default AdminDashboard
