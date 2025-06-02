import { useState, useEffect, useRef } from 'react';
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
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  HStack,
  IconButton,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import productService, { Product, CreateProductData } from '../services/product.service';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    supplierId: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();
  const cancelRef = useRef(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({ search, page, limit: PAGE_SIZE });
      setProducts(data.items || data); // support both paginated and non-paginated
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await productService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load suppliers',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await productService.updateProduct(editId, formData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        await productService.createProduct(formData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      setEditMode(false);
      setEditId(null);
      loadProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      supplierId: product.supplierId,
    });
    setEditMode(true);
    setEditId(product.id);
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      toast({
        title: 'Deleted',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
      });
      setIsDeleteOpen(false);
      setDeleteId(null);
      loadProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  return (
    <Box p={5}>
      <HStack mb={4} spacing={4}>
        <Button colorScheme="blue" onClick={() => { setEditMode(false); setFormData({ name: '', description: '', price: 0, stock: 0, category: '', supplierId: '' }); onOpen(); }}>
          Add Product
        </Button>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mr={2}
          />
          <IconButton aria-label="Search" icon={<SearchIcon />} type="submit" />
        </form>
      </HStack>

      {loading ? <Spinner /> : (
        <>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Supplier</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <Tr key={product.id}>
                  <Td>{product.name}</Td>
                  <Td>{product.category}</Td>
                  <Td>${product.price}</Td>
                  <Td>{product.stock}</Td>
                  <Td>{suppliers.find(s => s.id === product.supplierId)?.name}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit product"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEdit(product)}
                      />
                      <IconButton
                        aria-label="Delete product"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(product.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justify="space-between" align="center" mt={4}>
            <Text>
              Page {page} of {totalPages}
            </Text>
            <HStack>
              <IconButton
                aria-label="Previous page"
                icon={<ChevronLeftIcon />}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                isDisabled={page === 1}
              />
              <IconButton
                aria-label="Next page"
                icon={<ChevronRightIcon />}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                isDisabled={page === totalPages}
              />
            </HStack>
          </Flex>
        </>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editMode ? 'Edit Product' : 'Add Product'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Stock</FormLabel>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Category</FormLabel>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Supplier</FormLabel>
                <Select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button type="submit" colorScheme="blue" mr={3}>
                {editMode ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Product
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete this product? This action cannot be undone.
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
  );
} 