import React, { useEffect } from 'react'
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  useToast,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  totalProducts: number
  totalServices: number
  totalBookings: number
  totalRevenue: number
  totalFeedback: number
  totalFiles: number
  recentActivity: {
    id: string
    type: 'booking' | 'feedback' | 'file' | 'product'
    action: string
    timestamp: string
    details: string
  }[]
}

export default function Dashboard() {
  const toast = useToast()
  const navigate = useNavigate()
  const { data: stats, loading, error } = useFetch<DashboardStats>({ url: '/api/dashboard' })

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [error, toast])

  if (loading) {
    return (
      <DashboardLayout>
        <Box p={4} display="flex" justifyContent="center" alignItems="center" minH="200px">
          <Spinner size="xl" />
        </Box>
      </DashboardLayout>
    )
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'blue'
      case 'feedback':
        return 'green'
      case 'file':
        return 'purple'
      case 'product':
        return 'orange'
      default:
        return 'gray'
    }
  }

  return (
    <DashboardLayout>
      <Box p={4}>
        <HStack justify="space-between" mb={6}>
          <Heading>Dashboard Overview</Heading>
          <HStack spacing={4}>
            <Button colorScheme="blue" onClick={() => navigate('/products/new')}>
              Add Product
            </Button>
            <Button colorScheme="green" onClick={() => navigate('/services/new')}>
              Add Service
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
          <Stat
            px={4}
            py={5}
            shadow="base"
            borderColor="gray.200"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Products</StatLabel>
            <StatNumber>{stats?.totalProducts || 0}</StatNumber>
            <StatHelpText>Active inventory items</StatHelpText>
          </Stat>
          <Stat
            px={4}
            py={5}
            shadow="base"
            borderColor="gray.200"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Services</StatLabel>
            <StatNumber>{stats?.totalServices || 0}</StatNumber>
            <StatHelpText>Available services</StatHelpText>
          </Stat>
          <Stat
            px={4}
            py={5}
            shadow="base"
            borderColor="gray.200"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Bookings</StatLabel>
            <StatNumber>{stats?.totalBookings || 0}</StatNumber>
            <StatHelpText>Current bookings</StatHelpText>
          </Stat>
          <Stat
            px={4}
            py={5}
            shadow="base"
            borderColor="gray.200"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Revenue</StatLabel>
            <StatNumber>${stats?.totalRevenue || 0}</StatNumber>
            <StatHelpText>This month</StatHelpText>
          </Stat>
          <Stat
            px={4}
            py={5}
            shadow="base"
            borderColor="gray.200"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Feedback</StatLabel>
            <StatNumber>{stats?.totalFeedback || 0}</StatNumber>
            <StatHelpText>Customer reviews</StatHelpText>
          </Stat>
          <Stat
            px={4}
            py={5}
            shadow="base"
            borderColor="gray.200"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Files</StatLabel>
            <StatNumber>{stats?.totalFiles || 0}</StatNumber>
            <StatHelpText>Shared documents</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Card shadow="base" borderColor="gray.200" rounded="lg" bg="white">
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack spacing={4} align="stretch">
              {stats?.recentActivity?.map((activity) => (
                <Box key={activity.id} p={4} borderWidth={1} borderRadius="md">
                  <HStack justify="space-between">
                    <HStack>
                      <Badge colorScheme={getActivityColor(activity.type)}>
                        {activity.type}
                      </Badge>
                      <Text>{activity.action}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </HStack>
                  <Text mt={2} fontSize="sm">
                    {activity.details}
                  </Text>
                </Box>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <Text color="gray.500" textAlign="center" py={4}>
                  No recent activity
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  )
}
