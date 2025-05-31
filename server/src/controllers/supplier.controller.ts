// server/src/controllers/supplier.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string(),
  address: z.string()
});

export const supplierController = {
  async create(req: Request, res: Response) {
    try {
      const data = supplierSchema.parse(req.body);
      const supplier = await prisma.supplier.create({ data });
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ error: 'Invalid supplier data' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const suppliers = await prisma.supplier.findMany({
        include: { products: true }
      });
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: { products: true }
      });
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch supplier' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = supplierSchema.parse(req.body);
      const supplier = await prisma.service.update({
        where: { id },
        data
      });
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update supplier' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.supplier.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete supplier' });
    }
  }
};