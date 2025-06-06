import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Spinner,
  HStack,
  Input,
  IconButton,
  SimpleGrid,
  Card,
  CardBody,
  Text,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useFetch } from '../hooks/useFetch'
import { ServiceForm } from '../components/ServiceForm'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Service } from '../types'
import serviceService from '../services/service.service'
import dashboardService from '../services/dashboard.service'
import { DashboardStats } from '../types/dashboard'
import { useAuth } from '../hooks/useAuth'

export default function Services() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [search, setSearch] = useState('')
  const { data: services, loading } = useFetch<Service[]>({ url: import.meta.env.VITE_API_URL + '/api/services' })
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const toast = useToast()
  const cancelRef = useRef(null)
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

  const handleEdit = (service: Service) => {
    setEditService(service)
    onOpen()
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await serviceService.deleteService(deleteId)
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
        status: 'success',
        duration: 3000,
      })
      setIsDeleteOpen(false)
      setDeleteId(null)
      // Refresh the data
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Refresh the data
    window.location.reload()
  }

  if (loading) return <Spinner />

  return (
    <DashboardLayout>
      <Box p={4}>
        {!loadingStats && stats && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Services
                </Text>
                <Text fontSize="2xl" fontWeight="bold">{stats.totalServices}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Bookings
                </Text>
                <Text fontSize="2xl" fontWeight="bold">{stats.totalBookings}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Revenue
                </Text>
                <Text fontSize="2xl" fontWeight="bold">${stats.totalRevenue}</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        <HStack mb={4} spacing={4}>
          <Button onClick={() => { setEditService(null); onOpen() }}>
            Add Service
          </Button>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              mr={2}
            />
            <IconButton
              aria-label="Search services"
              icon={<SearchIcon />}
              type="submit"
            />
          </form>
        </HStack>

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
                  <Button size="sm" mr={2} onClick={() => handleEdit(service)}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(service.id)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <ServiceForm
          isOpen={isOpen} 
          onClose={onClose} 
          initialData={editService ? {
            id: editService.id,
            name: editService.name,
            description: editService.description,
            price: editService.price,
            duration: editService.duration,
          } : undefined}
        />

        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteOpen(false)}
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Service
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Box>
    </DashboardLayout>
  )
} 