import { Request, Response, NextFunction } from 'express';
import { createCategoriaItemService } from '../services/categoriaItemService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const categoriaItemController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createCategoriaItemService(tenantId);
      const categorias = await service.listar();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createCategoriaItemService(tenantId);
      const categorias = await service.listarAtivas();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createCategoriaItemService(tenantId);
      const { id } = req.params;
      const categoria = await service.buscarPorId(id);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createCategoriaItemService(tenantId);
      const { nome, ativo } = req.body;
      const categoria = await service.criar({ nome, ativo });
      res.status(201).json(categoria);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createCategoriaItemService(tenantId);
      const { id } = req.params;
      const { nome, ativo, ordem } = req.body;
      const categoria = await service.atualizar(id, { nome, ativo, ordem });
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createCategoriaItemService(tenantId);
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
      const service = createCategoriaItemService(tenantId);
      const { id } = req.params;
      const categoria = await service.toggleAtivo(id);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },
};
