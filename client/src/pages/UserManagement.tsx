import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Select,
  IconButton,
  HStack
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/admin.service';
import { User } from '../types/user';

const UserManagement = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/unauthorized');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUser(userToDelete);
      toast({
        title: 'User Deleted',
        description: 'User has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast({
        title: 'Role Updated',
        description: 'User role updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update user role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4} color="red.500">
        <Text>Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>User Management</Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>
                <Select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  isDisabled={u.id === user?.id} // Prevent admin from changing their own role
                >
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Delete user"
                    icon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(u.id)}
                    colorScheme="red"
                    isDisabled={u.id === user?.id} // Prevent admin from deleting themselves
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UserManagement; 