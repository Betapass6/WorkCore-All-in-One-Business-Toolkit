import { Router } from 'express';
import { getAdminDashboardStats } from '../controllers/adminDashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

export const adminDashboardRouter = Router();

adminDashboardRouter.get('/', authenticate, requireRole(Role.ADMIN), getAdminDashboardStats); 