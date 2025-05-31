import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role }; // Assuming user is attached by authMiddleware with id and role
    }
  }
}

// Get dashboard statistics (Admin only)
router.get('/stats', async (req: Request, res: Response) => {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }

  try {
    const totalProducts = await prisma.product.count();
    const totalBookings = await prisma.booking.count();
    const totalFeedback = await prisma.feedback.count();
    const totalUsers = await prisma.user.count();
    const totalFiles = await prisma.file.count();

    res.json({
      totalProducts,
      totalBookings,
      totalFeedback,
      totalUsers,
      totalFiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

export const adminRouter = router; 