import { useState, useEffect } from 'react'
import { Box, VStack, Heading, Select, HStack, Spinner, Button, SimpleGrid, Card, CardBody, Text, useToast } from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { useFetch } from '../hooks/useFetch'
import { FeedbackForm } from '../components/FeedbackForm'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Feedback as FeedbackType, Service } from '../types'
import dashboardService from '../services/dashboard.service'
import { DashboardStats } from '../types/dashboard'
import { useAuth } from '../hooks/useAuth'

export default function FeedbackPage() {
  const [selectedService, setSelectedService] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const { data: feedback, loading } = useFetch<FeedbackType[]>({ url: import.meta.env.VITE_API_URL + '/api/feedback' })
  const { data: services } = useFetch<Service[]>({ url: import.meta.env.VITE_API_URL + '/api/services' })
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const toast = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role) {
      fetchStats(user.role)
    } else {
      setLoadingStats(false)
    }
  }, [user])

  const fetchStats = async (role: string) => {
    try {
      const data = await dashboardService.getStats(role)
      setStats(data)
    } catch (error) {
      toast({
        title: 'Failed to fetch stats',
        description: 'There was an error loading the dashboard statistics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const filteredFeedback = feedback?.filter(item => {
    if (selectedService && item.serviceId !== selectedService) return false
    if (selectedRating && item.rating !== parseInt(selectedRating)) return false
    return true
  })

  const handleExport = () => {
    if (!filteredFeedback) return

    const csvContent = [
      // CSV Header
      ['Service', 'Rating', 'Title', 'Content', 'Date'].join(','),
      // CSV Rows
      ...filteredFeedback.map(item => {
        return [
          `"${item.service.name || 'N/A'}"`,
          item.rating,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.content.replace(/"/g, '""')}"`,
          new Date(item.createdAt).toLocaleDateString()
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `feedback-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <Spinner />

  return (
    <DashboardLayout>
      <Box p={4}>
        <VStack spacing={8} align="stretch">
          {!loadingStats && stats && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Total Feedback
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">{stats.totalFeedback}</Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    My Feedback
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">{stats.myFeedback || 0}</Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Average Rating
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {feedback && feedback.length > 0
                      ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
                      : '0.0'}
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          <Box>
            <Heading size="md" mb={4}>
              Submit Feedback
            </Heading>
            <FeedbackForm />
          </Box>

          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Recent Feedback</Heading>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="blue"
                onClick={handleExport}
                isDisabled={!filteredFeedback?.length}
              >
                Export CSV
              </Button>
            </HStack>
            <HStack mb={4} spacing={4}>
              <Select
                placeholder="Filter by Service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">All Services</option>
                {services?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
              <Select
                placeholder="Filter by Rating"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </Select>
            </HStack>
            
            {filteredFeedback?.map((item) => (
              <Box key={item.id} p={4} borderWidth={1} borderRadius="md" mb={4}>
                <Heading size="sm">{item.title}</Heading>
                <Box mt={2}>{item.content}</Box>
                <Box mt={2} fontSize="sm" color="gray.500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Box>
              </Box>
            ))}
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  )
}
