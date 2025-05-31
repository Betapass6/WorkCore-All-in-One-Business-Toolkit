import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const fileController = {
  async upload(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUuid = uuidv4();
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + 3); // 3 days expiration

      const file = await prisma.file.create({
        data: {
          fileName: req.file.originalname,
          uuid: fileUuid,
          size: req.file.size,
          userId: req.user.id,
          expiredAt
        }
      });

      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },

  async download(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const file = await prisma.file.findUnique({
        where: { uuid }
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (new Date() > file.expiredAt) {
        return res.status(410).json({ error: 'File has expired' });
      }

      const filePath = path.join(__dirname, '../../uploads', file.uuid);
      res.download(filePath, file.fileName);
    } catch (error) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this file' });
      }

      await prisma.file.delete({
        where: { id }
      });

      const filePath = path.join(__dirname, '../../uploads', file.uuid);
      fs.unlinkSync(filePath);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
}; 