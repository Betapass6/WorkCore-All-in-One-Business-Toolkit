import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import file system module
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload file
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = await prisma.file.create({
      data: {
        fileName: req.file.originalname,
        uuid: req.file.filename,
        size: req.file.size,
        userId: req.user!.userId,
        expiredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        uuid: file.uuid,
        fileName: file.fileName,
        downloadUrl: `/api/files/${file.uuid}`,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get file by UUID
router.get('/:uuid', async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { uuid: req.params.uuid },
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.expiredAt < new Date()) {
      return res.status(410).json({ message: 'File has expired' });
    }

    res.download(path.join('uploads', file.uuid), file.fileName);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// Get all files (admin only)
router.get('/', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error getting files' });
  }
});

// Delete file (admin only)
router.delete('/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    await prisma.file.delete({
      where: { id: file.id },
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

export default router; 