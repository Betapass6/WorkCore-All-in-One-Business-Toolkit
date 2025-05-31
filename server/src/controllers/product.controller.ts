import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string(),
  supplierId: z.string().uuid()
});

export const productController = {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const data = productSchema.parse(req.body);
      const product = await prisma.product.create({
        data: {
          ...data,
          userId: req.user.id
        }
      });
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const { category, search } = req.query;
      
      const where: Prisma.ProductWhereInput = {};
      
      if (category) {
        where.category = category as string;
      }
      
      if (search) {
        where.OR = [
          {
            name: {
              contains: search as string,
              mode: Prisma.QueryMode.insensitive
            }
          },
          {
            description: {
              contains: search as string,
              mode: Prisma.QueryMode.insensitive
            }
          }
        ];
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          supplier: true
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          supplier: true
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = productSchema.partial().parse(req.body);
      
      const product = await prisma.product.update({
        where: { id },
        data
      });
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
}; 