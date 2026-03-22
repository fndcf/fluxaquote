import rateLimit from 'express-rate-limit';

// Rate limit para rotas públicas (auth/register, check-slug)
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 1 minuto.',
  },
});

// Rate limit geral para rotas autenticadas
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Limite de requisições excedido. Tente novamente em 1 minuto.',
  },
});
