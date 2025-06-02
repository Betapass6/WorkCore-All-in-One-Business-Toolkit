import { Box, Grid, Heading } from '@chakra-ui/react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Products from './Products'
import Bookings from './Bookings'
import Feedback from './Feedback'
import Files from './Files'

const AdminPanel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user || user.role !== 'ADMIN') {
    navigate('/login')
    return null
  }

  return (
    <Box p={4}>
      <Heading mb={6}>Admin Dashboard</Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <Box>
          <Heading size="md" mb={4}>Products</Heading>
          <Products />
        </Box>
        <Box>
          <Heading size="md" mb={4}>Bookings</Heading>
          <Bookings />
        </Box>
        <Box>
          <Heading size="md" mb={4}>Feedback</Heading>
          <Feedback />
        </Box>
        <Box>
          <Heading size="md" mb={4}>Files</Heading>
          <Files />
        </Box>
      </Grid>
    </Box>
  )
}

export default AdminPanel
