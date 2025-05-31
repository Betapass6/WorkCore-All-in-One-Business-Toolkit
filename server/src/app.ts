import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import { bookingRouter } from './routes/booking.routes';
import { feedbackRouter } from './routes/feedback.routes';
import { fileRouter } from './routes/file.routes';
import { supplierRouter } from './routes/supplier.routes';
import { adminRouter } from './routes/admin.routes';
import { serviceRouter } from './routes/service.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { requireRole } from './middleware/role.middleware';
import { Role } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import { specs } from './utils/swagger';
import { requestLogger } from './middleware/logger.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(apiLimiter);

// Public Routes (no auth required)
app.use('/api/auth', authRouter);
app.use('/api/files', fileRouter); // Allow public access to file download by UUID
app.use('/api/services', serviceRouter); // Allow public access to view services

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

// Admin routes requiring ADMIN role
app.use('/api/admin', requireRole(Role.ADMIN), adminRouter); // Dashboard stats route
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

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 