import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Create a new supplier
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, contact, address } = req.body;
      const supplier = await prisma.supplier.create({
        data: {
          name,
          contact,
          address,
        },
      });
      res.status(201).json(supplier);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating supplier' });
    }
  }
);

// Get all suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching suppliers' });
  }
});

// Get a single supplier by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching supplier' });
  }
});

// Update a supplier by ID
router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, contact, address } = req.body;
      const supplier = await prisma.supplier.update({
        where: { id },
        data: {
          name,
          contact,
          address,
        },
      });
      res.json(supplier);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating supplier' });
    }
  }
);

// Delete a supplier by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({
      where: { id },
    });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting supplier' });
  }
});

export const supplierRouter = router; 