import { Request, Response, NextFunction } from 'express';
import { createItemServicoService } from '../services/itemServicoService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const itemServicoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const itens = await service.listar();
      res.json(itens);
    } catch (error) {
      next(error);
    }
  },

  async listarPorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { categoriaId } = req.params;
      const itens = await service.listarPorCategoria(categoriaId);
      res.json(itens);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivosPorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { categoriaId } = req.params;
      const itens = await service.listarAtivosPorCategoria(categoriaId);
      res.json(itens);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivosPorCategoriaPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { categoriaId } = req.params;
      const { limit = '10', cursor, search } = req.query;
      const result = await service.listarAtivosPorCategoriaPaginado(
        categoriaId,
        parseInt(limit as string, 10),
        cursor as string | undefined,
        search as string | undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listarPorCategoriaPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { categoriaId } = req.params;
      const { limit = '10', cursor, search } = req.query;
      const result = await service.listarPorCategoriaPaginado(
        categoriaId,
        parseInt(limit as string, 10),
        cursor as string | undefined,
        search as string | undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { id } = req.params;
      const item = await service.buscarPorId(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { categoriaId, descricao, unidade, ativo, valorUnitario, valorMaoDeObraUnitario, valorCusto, valorMaoDeObraCusto } = req.body;
      const item = await service.criar({
        categoriaId,
        descricao,
        unidade,
        ativo,
        valorUnitario,
        valorMaoDeObraUnitario,
        valorCusto,
        valorMaoDeObraCusto,
      });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
      const { id } = req.params;
      const { descricao, unidade, ativo, ordem, valorUnitario, valorMaoDeObraUnitario, valorCusto, valorMaoDeObraCusto } = req.body;
      const item = await service.atualizar(id, {
        descricao,
        unidade,
        ativo,
        ordem,
        valorUnitario,
        valorMaoDeObraUnitario,
        valorCusto,
        valorMaoDeObraCusto,
      });
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createItemServicoService(tenantId);
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
      const service = createItemServicoService(tenantId);
      const { id } = req.params;
      const item = await service.toggleAtivo(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  },
};
