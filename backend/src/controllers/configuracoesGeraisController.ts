import { Request, Response, NextFunction } from 'express';
import { createConfiguracoesGeraisService } from '../services/configuracoesGeraisService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const configuracoesGeraisController = {
  async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createConfiguracoesGeraisService(tenantId);
      const configuracoes = await service.buscar();
      res.json(configuracoes);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createConfiguracoesGeraisService(tenantId);
      const configuracoes = await service.atualizar(req.body);
      res.json(configuracoes);
    } catch (error) {
      next(error);
    }
  },
};
