import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
});

// Create service (admin only)
router.post('/', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: Number(price),
        duration: Number(duration)
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Error creating service' });
  }
});

// Update service (admin only)
router.put('/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        duration: Number(duration)
      }
    });

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Delete service (admin only)
router.delete('/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
});

export default router; 