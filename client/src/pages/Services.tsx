import React from 'react'
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, useDisclosure } from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { ServiceForm } from '../components/ServiceForm'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Service } from '../types'

export default function Services() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: services, loading } = useFetch<Service[]>({ url: '/api/services' })

  if (loading) return <div>Loading...</div>

  return (
    <DashboardLayout>
      <Box p={4}>
        <Button onClick={onOpen} mb={4}>
          Add Service
        </Button>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Price</Th>
              <Th>Duration</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {services?.map((service) => (
              <Tr key={service.id}>
                <Td>{service.name}</Td>
                <Td>{service.description}</Td>
                <Td>${service.price}</Td>
                <Td>{service.duration} minutes</Td>
                <Td>
                  <Button size="sm" mr={2}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red">
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <ServiceForm isOpen={isOpen} onClose={onClose} />
      </Box>
    </DashboardLayout>
  )
} 