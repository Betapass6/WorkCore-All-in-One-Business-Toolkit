import React, { useState, useEffect } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Spinner,
  IconButton,
  SimpleGrid,
  Card,
  CardBody,
  Text,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useFetch } from '../hooks/useFetch';
import { Booking, Service } from '../types';
import bookingService from '../services/booking.service';
import dashboardService from '../services/dashboard.service';
import { DashboardStats } from '../types/dashboard';
import { useAuth } from '../hooks/useAuth';

type SortField = 'date' | 'time' | 'service' | 'customer' | 'status';
type SortOrder = 'asc' | 'desc';

type FetchBookingsResult = {
  data: Booking[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export default function Bookings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

  const { data: bookings, loading: bookingsLoading, refetch: refetchBookings } = useFetch<Booking[]>({ url: `/bookings/my-bookings` }) as FetchBookingsResult;
  const { data: services, loading: servicesLoading } = useFetch<Service[]>({ url: `/services` });

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setLoadingStats(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Failed to fetch stats',
        description: 'There was an error loading the dashboard statistics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedBookings = React.useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'time':
          comparison = a.time.localeCompare(b.time);
          break;
        case 'service':
          comparison = a.service.name.localeCompare(b.service.name);
          break;
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [bookings, sortField, sortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedBooking) {
        await bookingService.updateBookingStatus(selectedBooking.id, 'PENDING');
        toast({
          title: 'Success',
          description: 'Booking updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        await bookingService.createBooking(formData);
        toast({
          title: 'Success',
          description: 'Booking created successfully',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      setSelectedBooking(null);
      // Refresh the data
      refetchBookings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save booking',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      serviceId: booking.service.id,
      date: booking.date,
      time: booking.time,
    });
    onOpen();
  };

  const handleStatusChange = async (bookingId: string, status: Booking['status']) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
        status: 'success',
        duration: 3000,
      });
      // Refresh the data
      refetchBookings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (bookingsLoading || servicesLoading) return <Spinner />;

  return (
    <Box p={4}>
      {!loadingStats && stats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
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
                My Bookings
              </Text>
              <Text fontSize="2xl" fontWeight="bold">{stats.myBookings || 0}</Text>
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

      <Button onClick={() => { setSelectedBooking(null); setFormData({ serviceId: '', date: '', time: '' }); onOpen(); }} mb={4}>
        New Booking
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th cursor="pointer" onClick={() => handleSort('date')}>
              Date
              {sortField === 'date' && (
                <IconButton
                  aria-label={`Sort ${sortOrder}`}
                  icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="xs"
                  ml={2}
                  variant="ghost"
                />
              )}
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('time')}>
              Time
              {sortField === 'time' && (
                <IconButton
                  aria-label={`Sort ${sortOrder}`}
                  icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="xs"
                  ml={2}
                  variant="ghost"
                />
              )}
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('service')}>
              Service
              {sortField === 'service' && (
                <IconButton
                  aria-label={`Sort ${sortOrder}`}
                  icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="xs"
                  ml={2}
                  variant="ghost"
                />
              )}
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('customer')}>
              Customer
              {sortField === 'customer' && (
                <IconButton
                  aria-label={`Sort ${sortOrder}`}
                  icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="xs"
                  ml={2}
                  variant="ghost"
                />
              )}
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('status')}>
              Status
              {sortField === 'status' && (
                <IconButton
                  aria-label={`Sort ${sortOrder}`}
                  icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="xs"
                  ml={2}
                  variant="ghost"
                />
              )}
            </Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedBookings.map((booking) => (
            <Tr key={booking.id}>
              <Td>{new Date(booking.date).toLocaleDateString()}</Td>
              <Td>{booking.time}</Td>
              <Td>{booking.service.name}</Td>
              <Td>{booking.customer.name}</Td>
              <Td>
                <Select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </Td>
              <Td>
                <Button size="sm" onClick={() => handleEdit(booking)}>
                  Edit
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedBooking ? 'Edit Booking' : 'New Booking'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4}>
                <FormLabel>Service</FormLabel>
                <Select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">Select a service</option>
                  {services?.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" mr={3}>
                {selectedBooking ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 