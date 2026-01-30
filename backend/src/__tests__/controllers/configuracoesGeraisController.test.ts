import { Request, Response, NextFunction } from 'express';
import { configuracoesGeraisController } from '../../controllers/configuracoesGeraisController';
import { createConfiguracoesGeraisService } from '../../services/configuracoesGeraisService';

// Mock do configuracoesGeraisService
jest.mock('../../services/configuracoesGeraisService');
jest.mock('../../utils/requestContext', () => ({
  getTenantId: jest.fn().mockReturnValue('test-tenant-id'),
}));

const mockService = {
  buscar: jest.fn(),
  atualizar: jest.fn(),
};
(createConfiguracoesGeraisService as jest.Mock).mockReturnValue(mockService);

describe('configuracoesGeraisController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
    (createConfiguracoesGeraisService as jest.Mock).mockReturnValue(mockService);
  });

  describe('buscar', () => {
    it('deve retornar configurações com sucesso', async () => {
      const configuracoes = {
        diasValidadeOrcamento: 30,
        nomeEmpresa: 'Empresa Teste',
        cnpjEmpresa: '12345678901234',
        enderecoEmpresa: 'Rua Teste, 123',
        telefoneEmpresa: '11999999999',
        emailEmpresa: 'teste@empresa.com',
      };
      mockService.buscar.mockResolvedValue(configuracoes);

      await configuracoesGeraisController.buscar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(configuracoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      mockService.buscar.mockRejectedValue(error);

      await configuracoesGeraisController.buscar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar configurações com sucesso', async () => {
      const dadosAtualizacao = { diasValidadeOrcamento: 60 };
      const configuracoes = {
        diasValidadeOrcamento: 60,
        nomeEmpresa: 'Empresa Teste',
        cnpjEmpresa: '12345678901234',
        enderecoEmpresa: 'Rua Teste, 123',
        telefoneEmpresa: '11999999999',
        emailEmpresa: 'teste@empresa.com',
      };
      mockReq.body = dadosAtualizacao;
      mockService.atualizar.mockResolvedValue(configuracoes);

      await configuracoesGeraisController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.atualizar).toHaveBeenCalledWith(dadosAtualizacao);
      expect(jsonMock).toHaveBeenCalledWith(configuracoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { diasValidadeOrcamento: 0 };
      const error = new Error('Dias de validade inválido');
      mockService.atualizar.mockRejectedValue(error);

      await configuracoesGeraisController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve atualizar impostos com sucesso', async () => {
      const dadosAtualizacao = { impostoMaterial: 10, impostoServico: 15 };
      const configuracoes = {
        diasValidadeOrcamento: 30,
        nomeEmpresa: 'Empresa Teste',
        cnpjEmpresa: '12345678901234',
        enderecoEmpresa: 'Rua Teste, 123',
        telefoneEmpresa: '11999999999',
        emailEmpresa: 'teste@empresa.com',
        impostoMaterial: 10,
        impostoServico: 15,
      };
      mockReq.body = dadosAtualizacao;
      mockService.atualizar.mockResolvedValue(configuracoes);

      await configuracoesGeraisController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockService.atualizar).toHaveBeenCalledWith(dadosAtualizacao);
      expect(jsonMock).toHaveBeenCalledWith(configuracoes);
    });
  });
});
