import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const feedbackSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  rating: z.number().min(1).max(5),
  productId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional()
});

export const feedbackController = {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const data = feedbackSchema.parse(req.body);
      const feedback = await prisma.feedback.create({
        data: {
          ...data,
          userId: req.user.userId
        }
      });
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create feedback' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const feedbacks = await prisma.feedback.findMany({
        include: {
          user: true,
          product: true,
          service: true
        }
      });
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
  },

  async getByService(req: Request, res: Response) {
    try {
      const { serviceId } = req.params;

      const feedback = await prisma.feedback.findMany({
        where: {
          serviceId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(feedback);
    } catch (error) {
      console.error('Get feedback by service error:', error);
      res.status(500).json({ message: 'Error fetching feedback' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const feedback = await prisma.feedback.findUnique({
        where: { id }
      });

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Only allow users to delete their own feedback or admins to delete any feedback
      if (feedback.userId !== userId && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to delete this feedback' });
      }

      await prisma.feedback.delete({
        where: { id }
      });

      res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      console.error('Delete feedback error:', error);
      res.status(500).json({ message: 'Error deleting feedback' });
    }
  }
}; 