import { Request, Response, NextFunction } from 'express';
import { createPalavraChaveService } from '../services/palavraChaveService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const palavraChaveController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createPalavraChaveService(tenantId);
      const palavrasChave = await service.listar();
      res.json(palavrasChave);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createPalavraChaveService(tenantId);
      const palavrasChave = await service.listarAtivas();
      res.json(palavrasChave);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createPalavraChaveService(tenantId);
      const { id } = req.params;
      const palavraChave = await service.buscarPorId(id);
      res.json(palavraChave);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createPalavraChaveService(tenantId);
      const { palavra, prazoDias, ativo } = req.body;
      const palavraChave = await service.criar({ palavra, prazoDias, ativo });
      res.status(201).json(palavraChave);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createPalavraChaveService(tenantId);
      const { id } = req.params;
      const { palavra, prazoDias, ativo } = req.body;
      const palavraChave = await service.atualizar(id, { palavra, prazoDias, ativo });
      res.json(palavraChave);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createPalavraChaveService(tenantId);
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
      const service = createPalavraChaveService(tenantId);
      const { id } = req.params;
      const palavraChave = await service.toggleAtivo(id);
      res.json(palavraChave);
    } catch (error) {
      next(error);
    }
  },
};
