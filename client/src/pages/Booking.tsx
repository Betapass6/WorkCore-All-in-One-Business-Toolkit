import React from 'react'
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
} from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { Booking } from '../types'
import { bookingService } from '../services/bookingService'
import { useToast } from '@chakra-ui/react'

export function BookingPage() {
  const toast = useToast()
  const { data: bookings, loading } = useFetch<Booking[]>({ url: '/booking' })

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      await bookingService.updateStatus(id, status)
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
                    booking.status === 'confirmed'
                      ? 'green'
                      : booking.status === 'canceled'
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
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="canceled">Canceled</option>
                </Select>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
