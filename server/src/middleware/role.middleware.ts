import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

// Extend Request type to include user property (if not already done elsewhere)
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { id: string; role: Role };
//     }
//   }
// }

export const requireRole = (requiredRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Access denied. ${requiredRole} role required.` });
    }

    next();
  };
};

// Example usage: router.get('/admin-only', requireRole(Role.ADMIN), (req, res) => { ... }); 