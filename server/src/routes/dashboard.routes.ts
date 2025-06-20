import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import { authenticate } from '../middleware/auth.middleware'; // No longer needed here as authMiddleware is global

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard
router.get('/', async (req: Request, res: Response) => {
  const userRole = req.user?.role;
  const userId = req.user?.userId;

  if (!userRole) return res.status(401).json({ message: 'Unauthorized' });

  try {
    if (userRole === 'ADMIN') {
      // Admin: show global stats
      const [totalUsers, totalProducts, totalBookings, totalFiles, totalFeedback] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.booking.count(),
        prisma.file.count(),
        prisma.feedback.count()
      ]);
      return res.json({
        stats: {
          totalUsers,
          totalProducts,
          totalBookings,
          totalFiles,
          totalFeedback
        }
      });
    } else {
      // User/Staff: show personal stats
      const [myBookings, myFiles, myFeedback] = await Promise.all([
        prisma.booking.count({ where: { userId } }),
        prisma.file.count({ where: { userId } }),
        prisma.feedback.count({ where: { userId } })
      ]);
      return res.json({
        stats: {
          myBookings,
          myFiles,
          myFeedback
        }
      });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

export default router;
