import { Box, VStack, Heading } from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { FeedbackForm } from '../components/FeedbackForm'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Feedback as FeedbackType } from '../types'

export default function FeedbackPage() {
  const { data: feedback, loading } = useFetch<FeedbackType[]>({ url: '/api/feedback' })

  if (loading) return <div>Loading...</div>

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
            <Heading size="md" mb={4}>
              Recent Feedback
            </Heading>
            {feedback?.map((item) => (
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
