import { Request, Response, NextFunction } from 'express';
import { createLimitacaoService } from '../services/limitacaoService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const limitacaoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const limitacoes = await service.listar();
      res.json(limitacoes);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const limitacoes = await service.listarAtivas();
      res.json(limitacoes);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const { id } = req.params;
      const limitacao = await service.buscarPorId(id);
      res.json(limitacao);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const { texto, ativo } = req.body;
      const limitacao = await service.criar({ texto, ativo });
      res.status(201).json(limitacao);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const { id } = req.params;
      const { texto, ativo, ordem } = req.body;
      const limitacao = await service.atualizar(id, { texto, ativo, ordem });
      res.json(limitacao);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const { id } = req.params;
      await service.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createLimitacaoService(tenantId);
      const { id } = req.params;
      const limitacao = await service.toggleAtivo(id);
      res.json(limitacao);
    } catch (error) {
      next(error);
    }
  },
};
