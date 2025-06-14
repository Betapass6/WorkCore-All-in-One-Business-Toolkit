import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import { bookingRouter } from './routes/booking.routes';
import { feedbackRouter } from './routes/feedback.routes';
import fileRouter from './routes/file.routes';
import { supplierRouter } from './routes/supplier.routes';
import adminRouter from './routes/admin.routes';
import userRouter from './routes/user.routes';
import serviceRouter from './routes/service.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { requireRole } from './middleware/role.middleware';
import { Role } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import { specs } from './utils/swagger';
import { requestLogger } from './middleware/logger.middleware';
import { apiLimiter, authApiLimiter, sensitiveApiLimiter } from './middleware/rate-limit.middleware';
import { authenticate } from './middleware/auth.middleware';
import morgan from 'morgan';
import { initScheduler } from './utils/scheduler';
import dashboardRouter from './routes/dashboard.routes';
import { adminDashboardRouter } from './routes/adminDashboard.routes';

dotenv.config();

const app = express();

// Initialize scheduler
initScheduler();

// Apply rate limiters
app.use('/api/auth', sensitiveApiLimiter); // Stricter limits for auth routes
app.use('/api/feedback', authApiLimiter); // More lenient for authenticated users
app.use('/api/bookings', authApiLimiter);
app.use('/api/services', authApiLimiter);
app.use('/api', apiLimiter); // Default limiter for all other routes

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

// Custom logging middleware before public routes
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Request received at middleware before public routes:', req.method, req.path);
  next();
});

// Temporary test route
app.get('/test', (req: Request, res: Response) => {
  res.send('Test route works!');
});

// Public Routes (no auth required)
app.use('/api/auth', authRouter);
app.use('/files', fileRouter);
app.use('/services', serviceRouter);

// Apply authMiddleware to all routes below this line that require authentication
app.use(authMiddleware);

// Routes requiring authentication (Client/Staff access)
app.use('/api/products', productRouter); // Client/Staff can view products
// Client can POST bookings, view their bookings
app.use('/api/bookings', bookingRouter);
// Client/Staff can POST feedback, GET feedback by product/service
app.use('/api/feedback', feedbackRouter);
// Client/Staff can upload files, view their uploaded files
// File download is public via /api/files/:uuid handled above
app.use('/api/files', fileRouter);
app.use('/api/suppliers', supplierRouter); // Client/Staff can view suppliers (needed for product relation)

// User routes (requires authentication)
app.use('/api/users', userRouter);

// Admin routes requiring ADMIN role
app.use('/api/admin', requireRole(Role.ADMIN), adminRouter); // Dashboard stats route
app.use('/api/admin-dashboard', adminDashboardRouter);
// Apply requireRole(Role.ADMIN) to specific routes within other routers if they should be admin-only
// For example, in product.routes.ts: router.post('/', requireRole(Role.ADMIN), ...);
// Or, mount admin-specific routes under the /api/admin group
// Example: adminRouter.use('/products', adminProductRouter); (where adminProductRouter is a new router with admin product routes)

// For now, manually apply requireRole where needed in the route files
// (I've added them to service.routes.ts and the admin-only GET/DELETE in file.routes.ts and GET/PUT in booking.routes.ts assuming they are moved or middleware applied before them)

// Example of applying middleware in individual route files (remove inline checks)
// In booking.routes.ts, for admin routes: router.get('/', requireRole(Role.ADMIN), async (...));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/services', serviceRouter);
app.use('/api/dashboard', dashboardRouter);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;