import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { registerSchema } from '../validations/authValidation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middlewares/authMiddleware';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const messages = parsed.error.errors.map((e) => e.message).join(', ');
        throw new ValidationError(messages);
      }

      const result = await authService.register(parsed.data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async checkSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const exists = await authService.checkSlug(slug);

      res.json({
        success: true,
        data: { exists },
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        throw new NotFoundError('Usuário não encontrado');
      }

      const tenantInfo = await authService.getMe(uid);
      if (!tenantInfo) {
        throw new NotFoundError('Tenant não encontrado para este usuário');
      }

      res.json({
        success: true,
        data: tenantInfo,
      });
    } catch (error) {
      next(error);
    }
  },
};
