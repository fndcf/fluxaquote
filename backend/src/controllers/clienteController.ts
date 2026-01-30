import { Request, Response, NextFunction } from 'express';
import { createClienteService } from '../services/clienteService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const clienteController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const clientes = await service.listar();
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(error);
    }
  },

  async listarPaginado(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const busca = req.query.busca as string | undefined;

      const result = await service.listarPaginado(page, limit, { busca });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const { id } = req.params;
      const cliente = await service.buscarPorId(id);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorDocumento(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const { documento } = req.params;
      const cliente = await service.buscarPorDocumento(documento);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async pesquisar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const { termo } = req.query;
      const clientes = await service.pesquisar(termo as string);
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const cliente = await service.criar(req.body);
      res.status(201).json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const { id } = req.params;
      const cliente = await service.atualizar(id, req.body);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createClienteService(tenantId);
      const { id } = req.params;
      await service.excluir(id);
      res.json({ success: true, message: 'Cliente excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  },
};
