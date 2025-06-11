import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Chip,
  Pagination,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Grid,
  SimpleGrid
} from '@chakra-ui/react';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/product.service';
import { Product } from '../types/product';
import { toast } from 'react-toastify';

const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      toast.error('Failed to fetch products');
      setProducts([]);
      setTotalPages(1);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(data);
        toast.success('Product created successfully');
      }

      handleCloseDialog();
      setIsLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setIsLoading(false);
    } catch (error) {
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Product deleted successfully');
        setIsLoading(true);
        await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        {(isAdmin || isStaff) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>
          <Box>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>No categories available</MenuItem>
              )}
            </TextField>
          </Box>
        </Grid>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => {
            // console.log('Rendering product:', product); // Debugging line
            return (
              <Box key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => navigate(`/products/${product.id}/${user?.role.toLowerCase()}`)}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {product.category}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={product.feedbacks?.[0]?.rating || 0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.feedbacks?.length || 0} reviews)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {product.stock}
                    </Typography>
                  </CardContent>
                  {(isAdmin || isStaff) && (
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(product); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Card>
              </Box>
            );
          })
        ) : (
          <Box gridColumn="span / 3">
            <Typography variant="body1" sx={{ p: 2 }}>No products found.</Typography>
          </Box>
        )}
      </SimpleGrid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Product Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              id="price"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
            <TextField
              margin="dense"
              id="stock"
              label="Stock"
              type="number"
              fullWidth
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              required
            />
            <TextField
              margin="dense"
              id="category"
              select
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <MenuItem value="">Select Category</MenuItem>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>No categories available</MenuItem>
              )}
            </TextField>
            <TextField
              margin="dense"
              id="supplierId"
              label="Supplier ID"
              type="text"
              fullWidth
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedProduct ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products; 