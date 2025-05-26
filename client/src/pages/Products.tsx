import React, { useState, useEffect } from 'react'
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
  Alert,
  AlertIcon,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MainLayout from '../layouts/MainLayout'
import { FormField } from '../components/ui/Form'
import { useProductStore } from '../store/product.store'
import { productService } from '../services/productService'
import { Product } from '../types'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  supplierId: z.string().min(1, 'Supplier is required'),
})

type ProductForm = z.infer<typeof productSchema>

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { loading, error, fetchProducts, addProduct, deleteProduct } = useProductStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await productService.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const onSubmit = async (data: ProductForm) => {
    await addProduct(data)
    onClose()
    reset()
  }

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" h="200px">
          <Spinner size="xl" />
        </Box>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Box>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          mb={6}
          onClick={onOpen}
        >
          Add Product
        </Button>

        <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
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
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                <FormField
                  label="Name"
                  name="name"
                  register={register}
                  errors={errors}
                />
                <FormField
                  label="Category"
                  name="category"
                  register={register}
                  errors={errors}
                />
                <FormField
                  label="Price"
                  name="price"
                  type="number"
                  register={register}
                  errors={errors}
                />
                <FormField
                  label="Stock"
                  name="stock"
                  type="number"
                  register={register}
                  errors={errors}
                />
                <FormField
                  label="Supplier"
                  name="supplierId"
                  type="select"
                  register={register}
                  errors={errors}
                  options={[
                    { value: '1', label: 'Supplier 1' },
                    { value: '2', label: 'Supplier 2' },
                  ]}
                />
                <Button colorScheme="brand" type="submit">
                  Save
                </Button>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </MainLayout>
  )
} 