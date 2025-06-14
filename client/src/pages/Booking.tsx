import React, { useState } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { Booking } from '../types'
import bookingService from '../services/booking.service'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'

export function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { data: bookings, loading } = useFetch<Booking[]>({ url: `/bookings/${id}` })
  const [loadingForm, setLoadingForm] = useState(false)
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
  })

  if (!user) {
    navigate('/login')
    return null
  }

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      await bookingService.updateBookingStatus(id, status.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'CANCELLED')
      toast({
        title: 'Booking status updated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error updating booking status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingForm(true)
    try {
      await bookingService.createBooking(formData)
      toast({
        title: 'Booking created',
        status: 'success',
        duration: 3000,
      })
      navigate('/bookings')
    } catch (error) {
      toast({
        title: 'Error creating booking',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoadingForm(false)
    }
  }

  if (loading) {
    return <Box>Loading...</Box>
  }

  return (
    <Box>
      <Heading mb={8}>Bookings</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Service</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {bookings?.map((booking) => (
            <Tr key={booking.id}>
              <Td>{booking.service?.name}</Td>
              <Td>{new Date(booking.date).toLocaleDateString()}</Td>
              <Td>{booking.time}</Td>
              <Td>
                <Badge
                  colorScheme={
                    booking.status === 'CONFIRMED'
                      ? 'green'
                      : booking.status === 'CANCELLED'
                      ? 'red'
                      : 'yellow'
                  }
                >
                  {booking.status}
                </Badge>
              </Td>
              <Td>
                <Select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                  size="sm"
                  width="150px"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box p={4}>
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Service</FormLabel>
            <Select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            >
              <option value="">Select a service</option>
              {/* Add service options here */}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Time</FormLabel>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={loadingForm}>
            Book Now
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
