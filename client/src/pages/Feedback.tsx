import { useState } from 'react'
import { Box, VStack, Heading, Select, HStack, Spinner, Button } from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { useFetch } from '../hooks/useFetch'
import { FeedbackForm } from '../components/FeedbackForm'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Feedback as FeedbackType, Service } from '../types'

export default function FeedbackPage() {
  const [selectedService, setSelectedService] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const { data: feedback, loading } = useFetch<FeedbackType[]>({ url: '/api/feedback' })
  const { data: services } = useFetch<Service[]>({ url: '/api/services' })

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
