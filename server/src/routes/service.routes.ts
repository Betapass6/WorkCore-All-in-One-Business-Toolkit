import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

// Create a new service (Admin only)
router.post(
  '/',
  requireRole(Role.ADMIN),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('duration').isInt({ gt: 0 }).withMessage('Duration must be a positive integer in minutes'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, price, duration } = req.body;
      const service = await prisma.service.create({
        data: {
          name,
          description,
          price,
          duration,
        },
      });
      res.status(201).json(service);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating service' });
    }
  }
);

// Get all services (Public access)
router.get('/', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get a single service by ID (Public access)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching service' });
  }
});

// Update a service by ID (Admin only)
router.put(
  '/:id',
  requireRole(Role.ADMIN),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('duration').isInt({ gt: 0 }).withMessage('Duration must be a positive integer in minutes'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, description, price, duration } = req.body;
      const service = await prisma.service.update({
        where: { id },
        data: {
          name,
          description,
          price,
          duration,
        },
      });
      res.json(service);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating service' });
    }
  }
);

// Delete a service by ID (Admin only)
router.delete('/:id', requireRole(Role.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({
      where: { id },
    });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting service' });
  }
});


export const serviceRouter = router; 