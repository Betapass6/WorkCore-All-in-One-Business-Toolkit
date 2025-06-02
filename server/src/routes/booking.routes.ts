import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
const prisma = new PrismaClient();

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

// Client creates a booking (Client, Staff, Admin) - Requires authentication
router.post(
  '/',
  [
    body('serviceId').notEmpty().withMessage('Service ID is required').isUUID().withMessage('Invalid Service ID'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { serviceId, date, time } = req.body;
      const userId = req.user!.userId; // Get user ID from auth middleware

      // Basic availability check (needs refinement)
      const existingBooking = await prisma.booking.findFirst({
        where: {
          serviceId,
          date: new Date(date),
          time,
        },
      });

      if (existingBooking) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }

      const booking = await prisma.booking.create({
        data: {
          serviceId,
          date: new Date(date),
          time,
          userId,
          status: 'PENDING',
        },
        include: { service: true, user: { select: { id: true, name: true, email: true } } },
      });

      res.status(201).json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  }
);

// Get all bookings (Admin only)
router.get('/', requireRole(Role.ADMIN), async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { service: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Update booking status (Admin only)
router.put(
  '/:id',
  requireRole(Role.ADMIN),
  [
    param('id').isUUID().withMessage('Invalid Booking ID'),
    body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Invalid status'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { status } = req.body;

      // Optional: Check if booking exists
      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status },
        include: { service: true, user: { select: { id: true, name: true, email: true } } },
      });
      res.json(updatedBooking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating booking status' });
    }
  }
);

// Get bookings for the logged-in user (Client, Staff, Admin can view their own) - Requires authentication
router.get('/my-bookings', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching client bookings' });
  }
});

export const bookingRouter = router; 