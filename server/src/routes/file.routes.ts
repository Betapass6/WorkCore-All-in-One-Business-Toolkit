import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import file system module
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client'; // Import Role enum

const router = Router();
const prisma = new PrismaClient();

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role }; // Assuming user is attached by authMiddleware with id and role
    }
  }
}

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = await prisma.file.create({
      data: {
        fileName: req.file.originalname,
        uuid: req.file.filename,
        size: req.file.size,
        userId: req.user!.id,
        expiredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days expiration
      }
    });

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get file by UUID (for download)
router.get('/:uuid', async (req: Request, res: Response) => {
    try {
        const { uuid } = req.params;

        const file = await prisma.file.findUnique({
            where: { uuid },
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if file is expired
        if (new Date() > file.expiredAt) {
            // Optional: delete the file if expired
            // fs.unlink(path.join(__dirname, '../../uploads', file.uuid), (err) => {
            //     if (err) console.error('Error deleting expired file:', err);
            // });
            // await prisma.file.delete({ where: { id: file.id } });
            return res.status(404).json({ message: 'File has expired' });
        }

        const filePath = path.join(__dirname, '../../uploads', file.uuid);

        // Check if file exists on disk
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File not found on disk:', filePath);
                return res.status(404).json({ message: 'File not found' });
            }

            // Send the file
            res.download(filePath, file.fileName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    // Handle error, but don't send another response if headers were already sent
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Error downloading file' });
                    }
                }
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving file' });
    }
});

// Get files for the logged-in user (Client/Staff can view their uploads)
router.get('/my-files', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const files = await prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching client files' });
  }
});

// Admin gets all files
router.get('/admin', async (req: Request, res: Response) => {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  try {
    const files = await prisma.file.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Admin deletes a file
router.delete('/:id', async (req: Request, res: Response) => {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  try {
    const { id } = req.params;
    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from disk
    fs.unlink(path.join(__dirname, '../../uploads', file.uuid), async (err) => {
      if (err) {
        console.error('Error deleting file from disk:', err);
        // Still proceed to delete from DB even if disk delete fails
      }

      // Delete file from database
      await prisma.file.delete({ where: { id } });
      res.json({ message: 'File deleted successfully' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

export const fileRouter = router; 