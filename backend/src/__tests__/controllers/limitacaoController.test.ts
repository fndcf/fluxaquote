import { Request, Response, NextFunction } from 'express';
import { limitacaoController } from '../../controllers/limitacaoController';
import { createLimitacaoService } from '../../services/limitacaoService';

// Mock do limitacaoService
jest.mock('../../services/limitacaoService');
jest.mock('../../utils/requestContext', () => ({
  getTenantId: jest.fn().mockReturnValue('test-tenant-id'),
}));

const mockService = {
  listar: jest.fn(),
  listarAtivas: jest.fn(),
  buscarPorId: jest.fn(),
  criar: jest.fn(),
  atualizar: jest.fn(),
  excluir: jest.fn(),
  toggleAtivo: jest.fn(),
};
(createLimitacaoService as jest.Mock).mockReturnValue(mockService);

describe('limitacaoController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: sendMock });

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
      send: sendMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
    (createLimitacaoService as jest.Mock).mockReturnValue(mockService);
  });

  describe('listar', () => {
    it('deve retornar lista de limitações com sucesso', async () => {
      const limitacoes = [
        { id: '1', texto: 'Limitação 1 com texto suficiente', ativo: true, ordem: 1 },
        { id: '2', texto: 'Limitação 2 com texto suficiente', ativo: true, ordem: 2 },
      ];
      mockService.listar.mockResolvedValue(limitacoes);

      await limitacaoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.listar.mockRejectedValue(error);

      await limitacaoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar lista de limitações ativas com sucesso', async () => {
      const limitacoes = [{ id: '1', texto: 'Limitação 1 com texto suficiente', ativo: true, ordem: 1 }];
      mockService.listarAtivas.mockResolvedValue(limitacoes);

      await limitacaoController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.listarAtivas.mockRejectedValue(error);

      await limitacaoController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar limitação por ID com sucesso', async () => {
      const limitacao = { id: '1', texto: 'Limitação 1 com texto suficiente', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      mockService.buscarPorId.mockResolvedValue(limitacao);

      await limitacaoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacao);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Limitação não encontrada');
      mockService.buscarPorId.mockRejectedValue(error);

      await limitacaoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar limitação com sucesso', async () => {
      const novaLimitacao = { texto: 'Nova Limitação com pelo menos 20 caracteres para validação', ativo: true };
      const limitacaoCriada = { id: '1', ...novaLimitacao, ordem: 1 };
      mockReq.body = novaLimitacao;
      mockService.criar.mockResolvedValue(limitacaoCriada);

      await limitacaoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(limitacaoCriada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { texto: 'curto' };
      const error = new Error('Texto muito curto');
      mockService.criar.mockRejectedValue(error);

      await limitacaoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar limitação com sucesso', async () => {
      const dadosAtualizacao = { texto: 'Limitação Atualizada com texto suficiente para validação' };
      const limitacaoAtualizada = {
        id: '1',
        texto: 'Limitação Atualizada com texto suficiente para validação',
        ativo: true,
        ordem: 1,
      };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      mockService.atualizar.mockResolvedValue(limitacaoAtualizada);

      await limitacaoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacaoAtualizada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { texto: 'Limitação Atualizada' };
      const error = new Error('Limitação não encontrada');
      mockService.atualizar.mockRejectedValue(error);

      await limitacaoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir limitação com sucesso', async () => {
      mockReq.params = { id: '1' };
      mockService.excluir.mockResolvedValue(undefined);

      await limitacaoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Limitação não encontrada');
      mockService.excluir.mockRejectedValue(error);

      await limitacaoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status ativo com sucesso', async () => {
      const limitacaoAlternada = { id: '1', texto: 'Limitação 1 com texto suficiente', ativo: false, ordem: 1 };
      mockReq.params = { id: '1' };
      mockService.toggleAtivo.mockResolvedValue(limitacaoAlternada);

      await limitacaoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacaoAlternada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Limitação não encontrada');
      mockService.toggleAtivo.mockRejectedValue(error);

      await limitacaoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
