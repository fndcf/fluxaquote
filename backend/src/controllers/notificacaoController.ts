import { Request, Response, NextFunction } from 'express';
import { createNotificacaoService } from '../services/notificacaoService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const notificacaoController = {
  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const { id } = req.params;
      const notificacao = await service.buscarPorId(id);
      res.json(notificacao);
    } catch (error) {
      next(error);
    }
  },

  async marcarComoLida(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const { id } = req.params;
      const notificacao = await service.marcarComoLida(id);
      res.json(notificacao);
    } catch (error) {
      next(error);
    }
  },

  async marcarTodasComoLidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const quantidade = await service.marcarTodasComoLidas();
      res.json({ marcadas: quantidade });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const { id } = req.params;
      await service.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async gerarParaOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const { orcamentoId } = req.params;
      const notificacoes = await service.gerarNotificacoesParaOrcamento(orcamentoId);
      res.json(notificacoes);
    } catch (error) {
      next(error);
    }
  },

  async processarTodos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const resultado = await service.processarTodosOrcamentosAceitos();
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async obterResumo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const resumo = await service.obterResumo();
      res.json(resumo);
    } catch (error) {
      next(error);
    }
  },

  async contarNaoLidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const quantidade = await service.contarNaoLidas();
      res.json({ quantidade });
    } catch (error) {
      next(error);
    }
  },

  // ========== HANDLERS PAGINADOS ==========

  async listarPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await service.listarTodasPaginado(pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarNaoLidasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await service.listarNaoLidasPaginado(pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarVencidasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await service.listarVencidasPaginado(pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 60;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await service.listarAtivasPaginado(dias, pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarProximasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createNotificacaoService(tenantId);
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 30;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await service.listarProximasPaginado(dias, pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },
};
