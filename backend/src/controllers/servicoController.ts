import { Request, Response, NextFunction } from 'express';
import { createServicoService } from '../services/servicoService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const servicoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createServicoService(tenantId);
      const servicos = await service.listar();
      res.json(servicos);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createServicoService(tenantId);
      const servicos = await service.listarAtivos();
      res.json(servicos);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createServicoService(tenantId);
      const { id } = req.params;
      const servico = await service.buscarPorId(id);
      res.json(servico);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createServicoService(tenantId);
      const { descricao, ativo } = req.body;
      const servico = await service.criar({ descricao, ativo });
      res.status(201).json(servico);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createServicoService(tenantId);
      const { id } = req.params;
      const { descricao, ativo, ordem } = req.body;
      const servico = await service.atualizar(id, { descricao, ativo, ordem });
      res.json(servico);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createServicoService(tenantId);
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
      const service = createServicoService(tenantId);
      const { id } = req.params;
      const servico = await service.toggleAtivo(id);
      res.json(servico);
    } catch (error) {
      next(error);
    }
  },
};
