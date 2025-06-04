import cron from 'node-cron';
import { fileController } from '../controllers/file.controller';

// Schedule tasks
export const initScheduler = () => {
  // Clean up expired files every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled task: Clean up expired files');
    await fileController.cleanupExpired();
  });

  console.log('Scheduler initialized');
}; 