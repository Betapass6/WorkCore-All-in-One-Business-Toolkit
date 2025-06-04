import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  description: z.string().nullable().optional(),
  supplierId: z.string().uuid(),
});

const updateProductSchema = createProductSchema.partial();

export const productController = {
  // Get all products with pagination and search
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const category = req.query.category as string;

      const where: Prisma.ProductWhereInput = {
        AND: [
          search ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          } : {},
          category ? { category } : {}
        ].filter(Boolean)
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                contact: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products' });
    }
  },

  // Get single product
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contact: true,
            },
          },
          feedbacks: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Error fetching product' });
    }
  },

  // Create product
  async create(req: Request, res: Response) {
    try {
      const data = createProductSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const product = await prisma.product.create({
        data: {
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          description: data.description || null,
          supplier: {
            connect: { id: data.supplierId }
          }
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contact: true,
            },
          },
        },
      });

      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Error creating product' });
    }
  },

  // Update product
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);

      const updateData: Prisma.ProductUpdateInput = {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.price && { price: data.price }),
        ...(data.stock && { stock: data.stock }),
        ...(data.description !== undefined && {
          description: data.description === null ? null : data.description
        }),
        ...(data.supplierId && {
          supplier: {
            connect: { id: data.supplierId }
          }
        })
      };

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contact: true,
            },
          },
        },
      });

      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error updating product' });
    }
  },

  // Delete product
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product' });
    }
  },
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search as string } },
            { description: { contains: search as string } }
          ]
        } : {},
        category ? { category: category as string } : {}
      ].filter(Boolean)
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          supplier: true,
          feedbacks: true
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, category, supplierId, description } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        category,
        description: description || null,
        supplier: {
          connect: { id: supplierId }
        }
      },
      include: {
        supplier: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
}; 