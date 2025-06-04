import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
  productId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
});

export const feedbackController = {
  // Get all feedback with pagination and filters
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const rating = parseInt(req.query.rating as string);
      const productId = req.query.productId as string;
      const serviceId = req.query.serviceId as string;

      const where: Prisma.FeedbackWhereInput = {
        AND: [
          rating ? { rating } : {},
          productId ? { productId } : {},
          serviceId ? { serviceId } : {},
        ].filter(Boolean)
      };

      const [feedbacks, total] = await Promise.all([
        prisma.feedback.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.feedback.count({ where }),
      ]);

      res.json({
        feedbacks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({ message: 'Error fetching feedbacks' });
    }
  },

  // Get single feedback
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const feedback = await prisma.feedback.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Error fetching feedback' });
    }
  },

  // Create feedback
  async create(req: Request, res: Response) {
    try {
      const data = createFeedbackSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check if user has already given feedback for this product/service
      if (data.productId) {
        const existingFeedback = await prisma.feedback.findFirst({
          where: {
            userId,
            productId: data.productId,
          },
        });

        if (existingFeedback) {
          return res.status(400).json({ message: 'You have already given feedback for this product' });
        }
      }

      if (data.serviceId) {
        const existingFeedback = await prisma.feedback.findFirst({
          where: {
            userId,
            serviceId: data.serviceId,
          },
        });

        if (existingFeedback) {
          return res.status(400).json({ message: 'You have already given feedback for this service' });
        }
      }

      const feedback = await prisma.feedback.create({
        data: {
          rating: data.rating,
          comment: data.comment || null,
          user: {
            connect: { id: userId }
          },
          ...(data.productId && {
            product: {
              connect: { id: data.productId }
            }
          }),
          ...(data.serviceId && {
            service: {
              connect: { id: data.serviceId }
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: 'Error creating feedback' });
    }
  },

  // Delete feedback
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const feedback = await prisma.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user has permission to delete this feedback
      if (req.user?.role === 'USER' && feedback.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this feedback' });
      }

      await prisma.feedback.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ message: 'Error deleting feedback' });
    }
  },
}; 