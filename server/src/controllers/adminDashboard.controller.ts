import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalBookings = await prisma.booking.count();
    const totalFeedback = await prisma.feedback.count();
    const totalFiles = await prisma.file.count();

    res.json({
      totalUsers,
      totalProducts,
      totalBookings,
      totalFeedback,
      totalFiles,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 