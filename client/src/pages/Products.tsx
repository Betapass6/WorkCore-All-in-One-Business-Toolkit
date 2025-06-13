import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Tag,
  FormControl,
  FormLabel,
  IconButton,
  HStack,
  VStack,
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/product.service';
import { Product } from '../types/product';
import { useToast } from '../contexts/ToastContext';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    supplierId: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [page, search, category]);

  useEffect(() => {
    console.log('Products data in render:', products);
  }, [products]);

  useEffect(() => {
    console.log('Categories data in dialog:', categories);
  }, [categories]);

  useEffect(() => {
    console.log('Current products state before render:', products);
    console.log('Current categories state before render:', categories);
    console.log('Current isLoading state before render:', isLoading);
  }, [products, categories, isLoading]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({
        search,
        category,
        page,
        limit: 12,
      });
      setProducts(response.products || []);
      setTotalPages(Math.ceil((response.total || 0) / 12));
    } catch (error) {
      showToast('Failed to fetch products', 'error');
      setProducts([]);
      setTotalPages(1);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data || []);
    } catch (error) {
      showToast('Failed to fetch categories', 'error');
      setCategories([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = ( _event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minH='100vh'>
        <Spinner size='xl' />
      </Box>
    );
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        supplierId: product.supplierId || '',
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        category: '',
        price: 0,
        stock: 0,
        description: '',
        supplierId: '',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
      supplierId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        description: formData.description,
        supplierId: formData.supplierId,
      };

      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, data);
        showToast('Product updated successfully', 'success');
      } else {
        await productService.createProduct(data);
        showToast('Product created successfully', 'success');
      }

      handleCloseDialog();
      setIsLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setIsLoading(false);
    } catch (error) {
      showToast(selectedProduct ? 'Failed to update product' : 'Failed to create product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        showToast('Product deleted successfully', 'success');
        setIsLoading(true);
        await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setIsLoading(false);
      } catch (error) {
        showToast('Failed to delete product', 'error');
      }
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  return (
    <Box p={6}>
      <HStack justifyContent='space-between' mb={6}>
        <Heading as='h1' size='xl'>
          Products
        </Heading>
        {(isAdmin || isStaff) && (
          <Button
            variant='solid'
            colorScheme='blue'
            leftIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        )}
      </HStack>

      <VStack spacing={4} mb={6}>
        <HStack width='100%' spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder='Search'
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder='All Categories'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
            <option value=''>All Categories</option>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))
            ) : (
              <option value='' disabled>No categories available</option>
            )}
          </Select>
        </HStack>
      </VStack>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => {
            return (
              <Box key={product.id}>
                <Box
                  borderWidth='1px'
                  borderRadius='lg'
                  overflow='hidden'
                  p={4}
                  _hover={{ boxShadow: 'lg', cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product.id}`)}
            >
                  <Heading as='h2' size='md' mb={2}>
                  {product.name}
                  </Heading>
                  <Text color='gray.600' mb={2}>
                  {product.category}
                  </Text>
                  <Text fontSize='xl' fontWeight='bold' color='blue.500' mb={2}>
                  ${product.price.toFixed(2)}
                  </Text>
                  <Text fontSize='sm' color='gray.500' mb={2}>
                    Rating: {product.feedbacks?.[0]?.rating || 0} ({product.feedbacks?.length || 0} reviews)
                  </Text>
                  <Tag
                    size='md'
                    colorScheme={product.stock > 0 ? 'green' : 'red'}
                    variant='solid'
                  >
                    Stock: {product.stock}
                  </Tag>
                  {(isAdmin || isStaff) && (
                    <HStack mt={4} justifyContent='flex-end'>
                      <IconButton
                        aria-label='Edit product'
                        icon={<EditIcon />}
                        onClick={(e) => { e.stopPropagation(); handleOpenDialog(product); }}
                      />
                      <IconButton
                        aria-label='Delete product'
                        icon={<DeleteIcon />}
                        colorScheme='red'
                        onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                      />
                    </HStack>
                  )}
                </Box>
              </Box>
            );
          })
        ) : (
          <Box gridColumn='span / 3'>
            <Text p={2}>No products found.</Text>
                  </Box>
                )}
      </SimpleGrid>

      <Modal isOpen={open} onClose={handleCloseDialog}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedProduct ? 'Edit Product' : 'Add New Product'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  id='name'
                  placeholder='Product Name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  id='description'
                  placeholder='Description'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  id='price'
                  type='number'
                  placeholder='Price'
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Stock</FormLabel>
                <Input
                  id='stock'
                  type='number'
                  placeholder='Stock'
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  id='category'
                  placeholder='Select Category'
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value=''>Select Category</option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  ) : (
                    <option value='' disabled>No categories available</option>
                  )}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Supplier ID</FormLabel>
                <Input
                  id='supplierId'
                  placeholder='Supplier ID'
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseDialog} variant='ghost' mr={3}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} colorScheme='blue'>
              {selectedProduct ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Products; 