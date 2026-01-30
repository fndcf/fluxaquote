import { Request, Response, NextFunction } from 'express';
import { createHistoricoValoresService } from '../services/historicoValoresService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const historicoValoresController = {
  async buscarHistoricoItens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createHistoricoValoresService(tenantId);
      const { dataInicio, dataFim } = req.query;
      const historico = await service.buscarHistoricoItensPorPeriodo(
        dataInicio as string,
        dataFim as string
      );
      res.json(historico);
    } catch (error) {
      next(error);
    }
  },

  async buscarHistoricoConfiguracoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createHistoricoValoresService(tenantId);
      const { dataInicio, dataFim } = req.query;
      const historico = await service.buscarHistoricoConfiguracoesPorPeriodo(
        dataInicio as string,
        dataFim as string
      );
      res.json(historico);
    } catch (error) {
      next(error);
    }
  },
};
