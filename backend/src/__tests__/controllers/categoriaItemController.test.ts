import { Request, Response, NextFunction } from 'express';
import { categoriaItemController } from '../../controllers/categoriaItemController';
import { createCategoriaItemService } from '../../services/categoriaItemService';

// Mock do categoriaItemService
jest.mock('../../services/categoriaItemService');
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
(createCategoriaItemService as jest.Mock).mockReturnValue(mockService);

describe('categoriaItemController', () => {
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
    (createCategoriaItemService as jest.Mock).mockReturnValue(mockService);
  });

  describe('listar', () => {
    it('deve retornar lista de categorias com sucesso', async () => {
      const categorias = [
        { id: '1', nome: 'Categoria 1', ativo: true, ordem: 1 },
        { id: '2', nome: 'Categoria 2', ativo: true, ordem: 2 },
      ];
      mockService.listar.mockResolvedValue(categorias);

      await categoriaItemController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(categorias);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.listar.mockRejectedValue(error);

      await categoriaItemController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar lista de categorias ativas com sucesso', async () => {
      const categorias = [{ id: '1', nome: 'Categoria 1', ativo: true, ordem: 1 }];
      mockService.listarAtivas.mockResolvedValue(categorias);

      await categoriaItemController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(categorias);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.listarAtivas.mockRejectedValue(error);

      await categoriaItemController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar categoria por ID com sucesso', async () => {
      const categoria = { id: '1', nome: 'Categoria 1', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      mockService.buscarPorId.mockResolvedValue(categoria);

      await categoriaItemController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(categoria);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Categoria não encontrada');
      mockService.buscarPorId.mockRejectedValue(error);

      await categoriaItemController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar categoria com sucesso', async () => {
      const novaCategoria = { nome: 'Nova Categoria', ativo: true };
      const categoriaCriada = { id: '1', ...novaCategoria, ordem: 1 };
      mockReq.body = novaCategoria;
      mockService.criar.mockResolvedValue(categoriaCriada);

      await categoriaItemController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(categoriaCriada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { nome: 'AB' };
      const error = new Error('Nome muito curto');
      mockService.criar.mockRejectedValue(error);

      await categoriaItemController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar categoria com sucesso', async () => {
      const dadosAtualizacao = { nome: 'Categoria Atualizada' };
      const categoriaAtualizada = { id: '1', nome: 'Categoria Atualizada', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      mockService.atualizar.mockResolvedValue(categoriaAtualizada);

      await categoriaItemController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(categoriaAtualizada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { nome: 'Categoria Atualizada' };
      const error = new Error('Categoria não encontrada');
      mockService.atualizar.mockRejectedValue(error);

      await categoriaItemController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir categoria com sucesso', async () => {
      mockReq.params = { id: '1' };
      mockService.excluir.mockResolvedValue(undefined);

      await categoriaItemController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Categoria não encontrada');
      mockService.excluir.mockRejectedValue(error);

      await categoriaItemController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status ativo com sucesso', async () => {
      const categoriaAlternada = { id: '1', nome: 'Categoria 1', ativo: false, ordem: 1 };
      mockReq.params = { id: '1' };
      mockService.toggleAtivo.mockResolvedValue(categoriaAlternada);

      await categoriaItemController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(categoriaAlternada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Categoria não encontrada');
      mockService.toggleAtivo.mockRejectedValue(error);

      await categoriaItemController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
