import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get user dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [
      myBookings,
      myFiles,
      myFeedback
    ] = await Promise.all([
      prisma.booking.count({
        where: { userId }
      }),
      prisma.file.count({
        where: { userId }
      }),
      prisma.feedback.count({
        where: { userId }
      })
    ]);

    res.json({
      stats: {
        myBookings,
        myFiles,
        myFeedback
      }
    });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching user dashboard stats' });
  }
});

export default router; 