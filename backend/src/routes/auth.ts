import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas (sem autenticação)
router.post('/register', authController.register);
router.get('/check-slug/:slug', authController.checkSlug);

// Rotas autenticadas
router.get('/me', authMiddleware, authController.me);

export default router;
