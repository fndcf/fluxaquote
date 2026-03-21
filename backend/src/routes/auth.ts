import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { publicRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Rotas públicas (sem autenticação, com rate limiting)
router.post('/register', publicRateLimiter, authController.register);
router.get('/check-slug/:slug', publicRateLimiter, authController.checkSlug);

// Rotas autenticadas
router.get('/me', authMiddleware, authController.me);

export default router;
