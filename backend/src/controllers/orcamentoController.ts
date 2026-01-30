import { Request, Response, NextFunction } from 'express';
import { createOrcamentoService } from '../services/orcamentoService';
import { OrcamentoStatus } from '../models';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const orcamentoController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const orcamentos = await service.listar();
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async listarPaginado(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as OrcamentoStatus | undefined;
      const clienteId = req.query.clienteId as string | undefined;
      const busca = req.query.busca as string | undefined;

      const result = await service.listarPaginado(page, limit, {
        status,
        clienteId,
        busca,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { id } = req.params;
      const orcamento = await service.buscarPorId(id);
      res.json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { clienteId } = req.params;
      const orcamentos = await service.buscarPorCliente(clienteId);
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async historicoCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { clienteId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      const historico = await service.getHistoricoCliente(clienteId, limit);
      res.json({ success: true, data: historico });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { status } = req.params;
      const orcamentos = await service.buscarPorStatus(status as OrcamentoStatus);
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorPeriodo(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { dataInicio, dataFim } = req.query;
      const orcamentos = await service.buscarPorPeriodo(
        dataInicio as string,
        dataFim as string
      );
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const orcamento = await service.criar(req.body);
      res.status(201).json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { id } = req.params;
      const orcamento = await service.atualizar(id, req.body);
      res.json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async atualizarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { id } = req.params;
      const { status } = req.body;
      const orcamento = await service.atualizarStatus(id, status);
      res.json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { id } = req.params;
      await service.excluir(id);
      res.json({ success: true, message: 'Orçamento excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  async duplicar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const { id } = req.params;
      const orcamento = await service.duplicar(id);
      res.status(201).json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async estatisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const stats = await service.getEstatisticas();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async verificarExpirados(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const expirados = await service.verificarExpirados();
      res.json({ success: true, data: { expirados } });
    } catch (error) {
      next(error);
    }
  },

  async dashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createOrcamentoService(tenantId);
      const stats = await service.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};
