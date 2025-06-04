import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createFileSchema = z.object({
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().positive(),
});

export const fileController = {
  // Get all files (admin) or user's files
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const where: Prisma.FileWhereInput = {
        // If not admin, only show user's files
        ...(req.user?.role !== 'ADMIN' ? { userId: req.user?.userId } : {}),
      };

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.file.count({ where }),
      ]);

      res.json({
        files,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  },

  // Get single file
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = await prisma.file.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Check if user has permission to view this file
      if (req.user?.role === 'USER' && file.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to view this file' });
      }

      res.json(file);
    } catch (error) {
      console.error('Error fetching file:', error);
      res.status(500).json({ message: 'Error fetching file' });
    }
  },

  // Upload file
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const fileData = createFileSchema.parse({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });

      const file = await prisma.file.create({
        data: {
          ...fileData,
          userId,
          uuid: uuidv4(),
          expiredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file' });
    }
  },

  // Download file by UUID
  async download(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const userId = req.user?.userId;

      const file = await prisma.file.findUnique({
        where: { uuid },
      });

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      if (file.expiredAt < new Date()) {
        return res.status(410).json({ message: 'File has expired' });
      }

      const filePath = path.join(__dirname, '../../uploads', file.fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }

      // Update download count
      await prisma.$executeRaw`
        UPDATE "File"
        SET "downloadCount" = "downloadCount" + 1
        WHERE id = ${file.id}
      `;

      res.download(filePath, file.fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ message: 'Error downloading file' });
    }
  },

  // Delete file
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Check if user has permission to delete this file
      if (req.user?.role === 'USER' && file.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this file' });
      }

      // Delete file from disk
      const filePath = path.join(process.cwd(), 'uploads', file.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete file record from database
      await prisma.file.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Error deleting file' });
    }
  },

  // Clean up expired files (to be called by a scheduled task)
  async cleanupExpired() {
    try {
      const expiredFiles = await prisma.file.findMany({
        where: {
          expiredAt: {
            lt: new Date(),
          },
        },
      });

      for (const file of expiredFiles) {
        const filePath = path.join(process.cwd(), 'uploads', file.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await prisma.file.delete({
          where: { id: file.id },
        });
      }

      console.log(`Cleaned up ${expiredFiles.length} expired files`);
    } catch (error) {
      console.error('Error cleaning up expired files:', error);
    }
  },
}; 