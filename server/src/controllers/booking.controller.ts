import { Request, Response } from 'express';
import { PrismaClient, Status } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().transform(str => new Date(str)),
  time: z.string()
});

export const bookingController = {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const data = bookingSchema.parse(req.body);
      const booking = await prisma.booking.create({
        data: {
          ...data,
          userId: req.user.id
        }
      });
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { userId, date, status } = req.query;
      
      const where: any = {};
      if (userId) where.userId = userId as string;
      if (date) where.date = new Date(date as string);
      if (status) where.status = status as Status;

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          service: true,
          user: true
        }
      });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          service: true,
          user: true
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const data = bookingSchema.partial().parse(req.body);
      
      const booking = await prisma.booking.update({
        where: { id },
        data
      });
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update booking' });
    }
  },

  async checkAvailability(req: Request, res: Response) {
    try {
      const { serviceId, date, time } = req.query;
      
      const existingBookings = await prisma.booking.count({
        where: {
          serviceId: serviceId as string,
          date: new Date(date as string),
          time: time as string,
          status: Status.CONFIRMED
        }
      });

      const service = await prisma.service.findUnique({
        where: { id: serviceId as string }
      });

      const isAvailable = existingBookings < 1; // Assuming 1 booking per time slot

      res.json({
        isAvailable,
        service,
        existingBookings
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check availability' });
    }
  }
}; 