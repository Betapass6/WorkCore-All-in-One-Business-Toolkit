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
          userId: req.user.id
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
  }
}; 