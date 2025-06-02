import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/dashboard', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalBookings,
      totalFiles,
      totalFeedback
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.booking.count(),
      prisma.file.count(),
      prisma.feedback.count()
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalBookings,
        totalFiles,
        totalFeedback
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get all users
router.get('/users', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user role
router.put('/users/:id/role', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'STAFF', 'USER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router; 