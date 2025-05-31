// Add to utils/file-cleanup.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function cleanupExpiredFiles() {
  const expiredFiles = await prisma.file.findMany({
    where: {
      expiredAt: {
        lt: new Date()
      }
    }
  });

  for (const file of expiredFiles) {
    const filePath = path.join(__dirname, '../../uploads', file.uuid);
    try {
      fs.unlinkSync(filePath);
      await prisma.file.delete({
        where: { id: file.id }
      });
    } catch (error) {
      console.error(`Failed to delete expired file ${file.id}:`, error);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredFiles, 60 * 60 * 1000);