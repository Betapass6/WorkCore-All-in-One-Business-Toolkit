import { Router } from 'express';
import { fileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

// Get all files (admin) or user's files
router.get('/', authenticate, fileController.getAll);

// Get single file
router.get('/:id', authenticate, fileController.getOne);

// Upload file
router.post('/upload', authenticate, upload.single('file'), fileController.upload);

// Download file by UUID
router.get('/download/:uuid', fileController.download);

// Delete file
router.delete('/:id', authenticate, fileController.delete);

export default router; 