import { Router } from 'express';
import { login, register, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

export const authRouter = Router();

// Public routes
authRouter.post('/login', login);
authRouter.post('/register', register);

// Protected routes
authRouter.get('/me', authenticate, getCurrentUser); 