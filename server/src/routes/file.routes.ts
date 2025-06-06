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

// Admin: get all files
router.get('/admin', authenticate, (req, res) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  // ...fetch all files logic...
});

// Staff: get all files (staff only, see all or only their own as needed)
router.get('/staff', authenticate, (req, res) => {
  if (req.user?.role !== 'STAFF') return res.status(403).json({ message: 'Forbidden' });
  // ...fetch files logic for staff...
});

// User: get all files (user only, only their own)
router.get('/user', authenticate, (req, res) => {
  if (req.user?.role !== 'USER') return res.status(403).json({ message: 'Forbidden' });
  // ...fetch files logic for user...
});

export default router;