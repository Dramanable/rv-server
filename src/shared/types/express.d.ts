/**
 * 🔧 Express Type Extensions
 */

import { User } from '../../domain/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}
