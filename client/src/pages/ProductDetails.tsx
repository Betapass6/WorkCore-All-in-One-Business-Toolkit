import {
  Spinner,
  Box,
  Button,
  IconButton,
  Text,
  Heading,
  Tag,
  Divider,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  HStack,
  VStack,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
  StarIcon
} from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/product.service';
import feedbackService from '../services/feedback.service';
import { Product } from '../types/product';
import { useToast } from '../contexts/ToastContext';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
  });
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id!);
      setProduct(data);
    } catch (error) {
      showToast('Failed to fetch product details', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        description: product.description || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
      };

      await productService.updateProduct(id!, data);
      showToast('Product updated successfully', 'success');
      handleCloseDialog();
      fetchProduct();
    } catch (error) {
      showToast('Failed to update product', 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id!);
        showToast('Product deleted successfully', 'success');
        navigate('/products');
      } catch (error) {
        showToast('Failed to delete product', 'error');
      }
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbackService.createFeedback({
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
        productId: id,
      });
      showToast('Feedback submitted successfully', 'success');
      setFeedbackForm({ rating: 0, comment: '' });
      fetchProduct();
    } catch (error) {
      showToast('Failed to submit feedback', 'error');
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minH='100vh'>
        <Spinner size='xl' />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box p={6} textAlign='center'>
        <Text>Product not found</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Button
        leftIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        mb={6}
        variant='ghost'
      >
        Back to Products
      </Button>

      <HStack align='flex-start' spacing={8} flexDirection={{ base: 'column', md: 'row' }}>
        <Box flex={1}>
          <Card>
            <CardBody>
              <HStack justifyContent='space-between' alignItems='flex-start' mb={4}>
                <Heading as='h1' size='xl'>
                  {product.name}
                </Heading>
                {(isAdmin || isStaff) && (
                  <HStack>
                    <IconButton onClick={handleOpenDialog} icon={<EditIcon />} aria-label='Edit product' />
                    <IconButton onClick={handleDelete} colorScheme='red' icon={<DeleteIcon />} aria-label='Delete product' />
                  </HStack>
                )}
              </HStack>

              <Text color='gray.600' mb={4}>
                {product.category}
              </Text>

              <HStack alignItems='center' mb={4}>
                {Array.from({ length: product.feedbacks?.[0]?.rating || 0 }).map((_, i) => (
                  <StarIcon key={i} color='orange.400' />
                ))}
                <Text fontSize='sm' color='gray.500' ml={2}>
                  ({product.feedbacks?.length || 0} reviews)
                </Text>
              </HStack>

              <Text fontSize='2xl' fontWeight='bold' color='blue.500' mb={4}>
                ${product.price.toFixed(2)}
              </Text>

              <Tag
                size='lg'
                colorScheme={product.stock > 0 ? 'green' : 'red'}
                variant='solid'
                mb={4}
              >
                Stock: {product.stock}
              </Tag>

              <Text fontSize='md' mb={6}>
                {product.description}
              </Text>

              <Divider borderColor='gray.200' my={6} />

              <Heading as='h3' size='lg' mb={4}>
                Reviews
              </Heading>

              {product.feedbacks?.map((feedback) => (
                <Box key={feedback.id} p={4} borderWidth='1px' borderRadius='md' mb={4}>
                  <HStack alignItems='center' mb={2}>
                    {Array.from({ length: feedback.rating }).map((_, i) => (
                      <StarIcon key={i} color='orange.400' />
                    ))}
                    <Text fontSize='sm' color='gray.500' ml={2}>
                      by {feedback.user.name}
                    </Text>
                  </HStack>
                  <Text fontSize='md'>{feedback.comment}</Text>
                </Box>
              ))}

              {user && (
                <VStack as='form' onSubmit={handleFeedbackSubmit} mt={6} spacing={4}>
                  <Heading as='h4' size='md'>
                    Write a Review
                  </Heading>
                  <HStack spacing={1} mb={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        aria-label={`${star} stars`}
                        icon={<StarIcon color={feedbackForm.rating >= star ? 'orange.400' : 'gray.300'} />}
                        variant='ghost'
                        size='sm'
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      />
                    ))}
                  </HStack>
                  <FormControl>
                    <FormLabel htmlFor='review-comment'>Your Review</FormLabel>
                    <Textarea
                      id='review-comment'
                      placeholder='Enter your review here...'
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    />
                  </FormControl>
                  <Button type='submit' colorScheme='blue' alignSelf='flex-end'>
                    Submit Review
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>
      </HStack>

      <Modal isOpen={openDialog} onClose={handleCloseDialog}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{product ? 'Edit Product' : 'Add New Product'}</ModalHeader>
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
                <FormLabel>Category</FormLabel>
                <Input
                  id='category'
                  placeholder='Category'
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  id='price'
                  type='number'
                  placeholder='Price'
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Stock</FormLabel>
                <Input
                  id='stock'
                  type='number'
                  placeholder='Stock'
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  id='description'
                  placeholder='Description'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseDialog} variant='ghost' mr={3}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} colorScheme='blue'>
              {product ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductDetails; 