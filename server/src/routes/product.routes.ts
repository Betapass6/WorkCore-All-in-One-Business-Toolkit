import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a new product (Admin or Staff only)
router.post(
  '/',
  requireRole(Role.ADMIN), // Or requireRole(Role.STAFF) based on detailed requirement
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ gt: -1 }).withMessage('Stock must be a non-negative integer'),
    body('category').notEmpty().withMessage('Category is required'),
    body('supplierId').notEmpty().withMessage('Supplier ID is required').isUUID().withMessage('Invalid Supplier ID'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, price, stock, category, supplierId } = req.body;
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          stock,
          category,
          supplierId,
          userId: req.user!.id, // Associate product with the logged-in user (Admin/Staff)
        },
      });
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating product' });
    }
  }
);

// Get all products (Client, Staff, Admin) - Requires authentication, but no specific role
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, skip, take } = req.query;
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { category: { contains: search as string, mode: 'insensitive' } },
        ],
      },
      include: { supplier: true },
      skip: skip ? parseInt(skip as string) : undefined,
      take: take ? parseInt(take as string) : undefined,
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get a single product by ID (Client, Staff, Admin) - Requires authentication
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { supplier: true, feedbacks: true },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Update a product by ID (Admin or Staff only)
router.put(
  '/:id',
  requireRole(Role.ADMIN), // Or requireRole(Role.STAFF)
  [
    param('id').isUUID().withMessage('Invalid Product ID'),
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ gt: -1 }).withMessage('Stock must be a non-negative integer'),
    body('category').notEmpty().withMessage('Category is required'),
    body('supplierId').notEmpty().withMessage('Supplier ID is required').isUUID().withMessage('Invalid Supplier ID'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, description, price, stock, category, supplierId } = req.body;
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price,
          stock,
          category,
          supplierId,
        },
        include: { supplier: true },
      });
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating product' });
    }
  }
);

// Delete a product by ID (Admin only)
router.delete('/:id', requireRole(Role.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     // Optional: Check if product exists before attempting delete
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await prisma.product.delete({
      where: { id },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export const productRouter = router; 