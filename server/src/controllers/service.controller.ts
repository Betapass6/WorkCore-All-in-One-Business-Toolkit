import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  duration: z.number().int().positive()
});

export const serviceController = {
  async create(req: Request, res: Response) {
    try {
      const data = serviceSchema.parse(req.body);
      const service = await prisma.service.create({ data });
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: 'Invalid service data' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const services = await prisma.service.findMany();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({
        where: { id },
        include: { bookings: true }
      });
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = serviceSchema.parse(req.body);
      const service = await prisma.service.update({
        where: { id },
        data
      });
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update service' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.service.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete service' });
    }
  }
};