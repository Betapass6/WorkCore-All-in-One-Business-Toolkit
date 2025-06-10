import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import { Role } from '@prisma/client'; // Import Role enum

const router = Router();
const prisma = new PrismaClient();

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string }; // Assuming user is attached by authMiddleware with id and role
    }
  }
}

// Client submits feedback
router.post(
  '/',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
    body('productId').optional().isUUID().withMessage('Invalid product ID'),
    body('serviceId').optional().isUUID().withMessage('Invalid service ID'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { rating, comment, productId, serviceId } = req.body;
      const userId = req.user!.userId; // Get user ID from auth middleware

      // Ensure either productId or serviceId is provided, but not both
      if ((!productId && !serviceId) || (productId && serviceId)) {
        return res.status(400).json({ message: 'Must provide either productId or serviceId' });
      }

      const feedback = await prisma.feedback.create({
        data: {
          rating,
          comment: comment || null,
          user: {
            connect: { id: userId }
          },
          ...(productId && {
            product: {
              connect: { id: productId }
            }
          }),
          ...(serviceId && {
            service: {
              connect: { id: serviceId }
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          product: {
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
        }
      });

      res.status(201).json(feedback);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error submitting feedback' });
    }
  }
);

// Get all feedbacks for authenticated user (Client, Staff, Admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let feedbacks;
    if (userRole === Role.ADMIN) {
      feedbacks = await prisma.feedback.findMany({
        include: { user: { select: { id: true, name: true, email: true } }, service: true, product: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      feedbacks = await prisma.feedback.findMany({
        where: { userId },
        include: { user: { select: { id: true, name: true, email: true } }, service: true, product: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user feedbacks' });
  }
});

// Admin: get all feedback
router.get('/admin', (req: Request, res: Response) => {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  // identical to router.get('/')
  // Admin can filter by productId or rating
  router.get('/', async (req: Request, res: Response) => {
    // Role check middleware should ideally handle this
    if (req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    try {
      const { productId, rating } = req.query;
      const feedbacks = await prisma.feedback.findMany({
        where: {
          productId: productId as string | undefined,
          rating: rating ? parseInt(rating as string) : undefined,
        },
        include: { user: { select: { id: true, name: true } }, product: { select: { id: true, name: true } }, service: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(feedbacks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching feedback' });
    }
  });
});

// Staff: get all feedback (staff only, see all or only their own as needed)
router.get('/staff', (req: Request, res: Response) => {
  if (req.user?.role !== Role.STAFF) {
    return res.status(403).json({ message: 'Access denied. Staff role required.' });
  }
  // fetch feedback logic for staff...
});

// User: get all feedback (user only, only their own)
router.get('/user', (req: Request, res: Response) => {
  if (req.user?.role !== Role.USER) {
    return res.status(403).json({ message: 'Access denied. User role required.' });
  }
  // fetch feedback logic for user...
});

// Get feedback for a specific product (Client/Staff can view)
router.get('/product/:productId',
  [
    param('productId').isUUID().withMessage('Invalid product ID'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { productId } = req.params;
      const feedbacks = await prisma.feedback.findMany({
        where: { productId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(feedbacks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching product feedback' });
    }
});

// Get feedback for a specific service (Client/Staff can view)
router.get('/service/:serviceId',
  [
    param('serviceId').isUUID().withMessage('Invalid service ID'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { serviceId } = req.params;
      const feedbacks = await prisma.feedback.findMany({
        where: { serviceId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(feedbacks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching service feedback' });
    }
});

export const feedbackRouter = router;