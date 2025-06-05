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
  Grid as MuiGrid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/product.service';
import { Product, ProductFilters } from '../types/product';
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search, category]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({
        search,
        category,
        page,
        limit: 12,
      });
      setProducts(response.products);
      setTotalPages(Math.ceil(response.total / 12));
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

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
      fetchProducts();
    } catch (error) {
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
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
        <MuiGrid container spacing={2}>
          <MuiGrid item component="div" xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </MuiGrid>
          <MuiGrid item component="div" xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </MuiGrid>
        </MuiGrid>
      </Box>

      <MuiGrid container spacing={3}>
        {products.map((product) => (
          <MuiGrid item component="div" key={product.id} xs={12} sm={6} md={4}>
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
              onClick={() => navigate(`/products/${product.id}`)}
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
                <Chip
                  label={`Stock: ${product.stock}`}
                  color={product.stock > 0 ? 'success' : 'error'}
                  size="small"
                />
                {(isAdmin || isStaff) && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(product);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </MuiGrid>
        ))}
      </MuiGrid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <MuiGrid container spacing={2}>
                <MuiGrid item component="div" xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </MuiGrid>
                <MuiGrid item component="div" xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                    inputProps={{ min: 0 }}
                  />
                </MuiGrid>
              </MuiGrid>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                fullWidth
                label="Supplier ID"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Products; 