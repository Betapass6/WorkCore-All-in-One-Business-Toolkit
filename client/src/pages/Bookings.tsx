import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useFetch } from '../hooks/useFetch';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Booking, Service } from '../types';
import bookingService, { Booking as BookingType } from '../services/booking.service';

type SortField = 'date' | 'time' | 'service' | 'customer' | 'status';
type SortOrder = 'asc' | 'desc';

export default function Bookings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: bookings, loading } = useFetch<Booking[]>({ url: '/api/bookings' });
  const { data: services } = useFetch<Service[]>({ url: '/api/services' });
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
  });
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const toast = useToast();

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
      if (editBooking) {
        await bookingService.updateBookingStatus(editBooking.id, 'PENDING');
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
      setEditBooking(null);
      // Refresh the data
      window.location.reload();
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
    setEditBooking(booking);
    setFormData({
      serviceId: booking.service.id,
      date: booking.date,
      time: booking.time,
    });
    onOpen();
  };

  const handleStatusChange = async (bookingId: string, status: BookingType['status']) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
        status: 'success',
        duration: 3000,
      });
      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) return <Spinner />;

  return (
    <DashboardLayout>
      <Box p={4}>
        <Button onClick={() => { setEditBooking(null); setFormData({ serviceId: '', date: '', time: '' }); onOpen(); }} mb={4}>
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
                    onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingType['status'])}
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
            <ModalHeader>{editBooking ? 'Edit Booking' : 'New Booking'}</ModalHeader>
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
                  {editBooking ? 'Update' : 'Create'}
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </DashboardLayout>
  );
} 