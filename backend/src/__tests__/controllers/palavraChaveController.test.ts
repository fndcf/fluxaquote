import { Request, Response, NextFunction } from 'express';
import { palavraChaveController } from '../../controllers/palavraChaveController';
import { createPalavraChaveService } from '../../services/palavraChaveService';

// Mock do palavraChaveService
jest.mock('../../services/palavraChaveService');
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
(createPalavraChaveService as jest.Mock).mockReturnValue(mockService);

describe('palavraChaveController', () => {
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
    (createPalavraChaveService as jest.Mock).mockReturnValue(mockService);
  });

  const mockPalavraChave = {
    id: '1',
    palavra: 'extintor',
    prazoDias: 345,
    ativo: true,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de palavras-chave com sucesso', async () => {
      const palavras = [mockPalavraChave, { ...mockPalavraChave, id: '2', palavra: 'mangueira' }];
      mockService.listar.mockResolvedValue(palavras);

      await palavraChaveController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(palavras);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.listar.mockRejectedValue(error);

      await palavraChaveController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar lista de palavras-chave ativas com sucesso', async () => {
      const palavrasAtivas = [mockPalavraChave];
      mockService.listarAtivas.mockResolvedValue(palavrasAtivas);

      await palavraChaveController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(palavrasAtivas);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.listarAtivas.mockRejectedValue(error);

      await palavraChaveController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar palavra-chave por ID com sucesso', async () => {
      mockReq.params = { id: '1' };
      mockService.buscarPorId.mockResolvedValue(mockPalavraChave);

      await palavraChaveController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.buscarPorId).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith(mockPalavraChave);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Palavra-chave não encontrada');
      mockService.buscarPorId.mockRejectedValue(error);

      await palavraChaveController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar palavra-chave com sucesso', async () => {
      const novaPalavra = { palavra: 'extintor', prazoDias: 345 };
      mockReq.body = novaPalavra;
      mockService.criar.mockResolvedValue(mockPalavraChave);

      await palavraChaveController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.criar).toHaveBeenCalledWith(novaPalavra);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockPalavraChave);
    });

    it('deve criar palavra-chave com ativo=false', async () => {
      const novaPalavra = { palavra: 'extintor', prazoDias: 345, ativo: false };
      mockReq.body = novaPalavra;
      mockService.criar.mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.criar).toHaveBeenCalledWith(novaPalavra);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { palavra: 'a', prazoDias: 345 };
      const error = new Error('Dados inválidos');
      mockService.criar.mockRejectedValue(error);

      await palavraChaveController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar palavra-chave com sucesso', async () => {
      const dadosAtualizacao = { palavra: 'extintor atualizado', prazoDias: 400 };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      mockService.atualizar.mockResolvedValue({
        ...mockPalavraChave,
        ...dadosAtualizacao,
      });

      await palavraChaveController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.atualizar).toHaveBeenCalledWith('1', dadosAtualizacao);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining(dadosAtualizacao));
    });

    it('deve atualizar apenas ativo', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { ativo: false };
      mockService.atualizar.mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.atualizar).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { palavra: 'teste' };
      const error = new Error('Palavra-chave não encontrada');
      mockService.atualizar.mockRejectedValue(error);

      await palavraChaveController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir palavra-chave com sucesso', async () => {
      mockReq.params = { id: '1' };
      mockService.excluir.mockResolvedValue(undefined);

      await palavraChaveController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.excluir).toHaveBeenCalledWith('1');
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Palavra-chave não encontrada');
      mockService.excluir.mockRejectedValue(error);

      await palavraChaveController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status de ativo para inativo', async () => {
      mockReq.params = { id: '1' };
      mockService.toggleAtivo.mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.toggleAtivo).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ativo: false }));
    });

    it('deve alternar status de inativo para ativo', async () => {
      mockReq.params = { id: '1' };
      mockService.toggleAtivo.mockResolvedValue({
        ...mockPalavraChave,
        ativo: true,
      });

      await palavraChaveController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ativo: true }));
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Palavra-chave não encontrada');
      mockService.toggleAtivo.mockRejectedValue(error);

      await palavraChaveController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
