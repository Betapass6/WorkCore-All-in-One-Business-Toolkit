import { Request, Response } from 'express';
import { PrismaClient, Prisma, Status } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const),
});

export const bookingController = {
  // Get all bookings (admin/staff) or user's bookings
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as Status;
      const date = req.query.date as string;

      const where: Prisma.BookingWhereInput = {
        AND: [
          // If not admin/staff, only show user's bookings
          !req.user?.role || req.user.role === 'USER' ? { userId: req.user?.userId } : {},
          status ? { status } : {},
          date ? { date: new Date(date) } : {},
        ].filter(Boolean)
      };

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { date: 'desc' },
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        bookings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  },

  // Get single booking
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user has permission to view this booking
      if (req.user?.role === 'USER' && booking.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
      }

      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ message: 'Error fetching booking' });
    }
  },

  // Create booking
  async create(req: Request, res: Response) {
    try {
      const data = createBookingSchema.parse(req.body);
      const { serviceId, date, time } = data;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Check if the time slot is available
      const bookingDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      bookingDate.setHours(hours, minutes);

      const endTime = new Date(bookingDate);
      endTime.setMinutes(endTime.getMinutes() + service.duration);

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          serviceId,
          date: bookingDate,
          status: {
            not: 'CANCELLED',
          },
          OR: [
            {
              AND: [
                { time: { lte: time } },
                {
                  time: {
                    gte: new Date(endTime).toTimeString().slice(0, 5),
                  },
                },
              ],
            },
            {
              AND: [
                { time: { gte: time } },
                {
                  time: {
                    lte: new Date(endTime).toTimeString().slice(0, 5),
                  },
                },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({ message: 'Time slot is not available' });
      }

      const booking = await prisma.booking.create({
        data: {
          serviceId,
          date: bookingDate,
          time,
          userId,
          status: 'PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
      });

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  },

  // Update booking status (admin/staff only)
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateBookingSchema.parse(req.body);

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: data.status as Status
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
      });

      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating booking:', error);
      res.status(500).json({ message: 'Error updating booking' });
    }
  },

  // Cancel booking
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user has permission to cancel this booking
      if (req.user?.role === 'USER' && booking.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
      });

      res.json(updatedBooking);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ message: 'Error cancelling booking' });
    }
  },
}; 