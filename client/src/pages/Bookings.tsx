import React from 'react'
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, useDisclosure } from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Booking } from '../types'

export default function Bookings() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: bookings, loading } = useFetch<Booking[]>({ url: '/api/bookings' })

  if (loading) return <div>Loading...</div>

  return (
    <DashboardLayout>
      <Box p={4}>
        <Button onClick={onOpen} mb={4}>
          New Booking
        </Button>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Service</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bookings?.map((booking) => (
              <Tr key={booking.id}>
                <Td>{new Date(booking.date).toLocaleDateString()}</Td>
                <Td>{booking.time}</Td>
                <Td>{booking.service.name}</Td>
                <Td>{booking.customer.name}</Td>
                <Td>{booking.status}</Td>
                <Td>
                  <Button size="sm" mr={2}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red">
                    Cancel
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </DashboardLayout>
  )
} 