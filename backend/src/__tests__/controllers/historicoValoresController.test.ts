import { Request, Response, NextFunction } from 'express';
import { historicoValoresController } from '../../controllers/historicoValoresController';
import { createHistoricoValoresService } from '../../services/historicoValoresService';

jest.mock('../../services/historicoValoresService');
jest.mock('../../utils/requestContext', () => ({
  getTenantId: jest.fn().mockReturnValue('test-tenant-id'),
}));

const mockService = {
  buscarHistoricoItensPorPeriodo: jest.fn(),
  buscarHistoricoConfiguracoesPorPeriodo: jest.fn(),
};
(createHistoricoValoresService as jest.Mock).mockReturnValue(mockService);

describe('historicoValoresController', () => {
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
    (createHistoricoValoresService as jest.Mock).mockReturnValue(mockService);
  });

  describe('buscarHistoricoItens', () => {
    it('deve retornar histórico de itens com sucesso', async () => {
      const mockHistorico = [
        { id: '1', itemServicoId: 'item-1', valorAnterior: 100, valorNovo: 120 },
        { id: '2', itemServicoId: 'item-2', valorAnterior: 200, valorNovo: 250 },
      ];
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      mockService.buscarHistoricoItensPorPeriodo.mockResolvedValue(mockHistorico);

      await historicoValoresController.buscarHistoricoItens(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(mockHistorico);
    });

    it('deve passar query params para o service', async () => {
      mockReq.query = { dataInicio: '2024-06-01', dataFim: '2024-06-30' };
      mockService.buscarHistoricoItensPorPeriodo.mockResolvedValue([]);

      await historicoValoresController.buscarHistoricoItens(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockService.buscarHistoricoItensPorPeriodo).toHaveBeenCalledWith(
        '2024-06-01',
        '2024-06-30'
      );
    });

    it('deve chamar next com erro quando service falha', async () => {
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      const error = new Error('Erro no service');
      mockService.buscarHistoricoItensPorPeriodo.mockRejectedValue(error);

      await historicoValoresController.buscarHistoricoItens(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve criar service com tenantId do request', async () => {
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      mockService.buscarHistoricoItensPorPeriodo.mockResolvedValue([]);

      await historicoValoresController.buscarHistoricoItens(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(createHistoricoValoresService).toHaveBeenCalledWith('test-tenant-id');
    });
  });

  describe('buscarHistoricoConfiguracoes', () => {
    it('deve retornar histórico de configurações com sucesso', async () => {
      const mockHistorico = [
        { id: '1', campo: 'diasValidade', valorAnterior: '30', valorNovo: '45' },
      ];
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      mockService.buscarHistoricoConfiguracoesPorPeriodo.mockResolvedValue(mockHistorico);

      await historicoValoresController.buscarHistoricoConfiguracoes(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(mockHistorico);
    });

    it('deve passar query params para o service', async () => {
      mockReq.query = { dataInicio: '2024-03-01', dataFim: '2024-09-30' };
      mockService.buscarHistoricoConfiguracoesPorPeriodo.mockResolvedValue([]);

      await historicoValoresController.buscarHistoricoConfiguracoes(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockService.buscarHistoricoConfiguracoesPorPeriodo).toHaveBeenCalledWith(
        '2024-03-01',
        '2024-09-30'
      );
    });

    it('deve chamar next com erro quando service falha', async () => {
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      const error = new Error('Erro nas configurações');
      mockService.buscarHistoricoConfiguracoesPorPeriodo.mockRejectedValue(error);

      await historicoValoresController.buscarHistoricoConfiguracoes(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve criar service com tenantId do request', async () => {
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      mockService.buscarHistoricoConfiguracoesPorPeriodo.mockResolvedValue([]);

      await historicoValoresController.buscarHistoricoConfiguracoes(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(createHistoricoValoresService).toHaveBeenCalledWith('test-tenant-id');
    });
  });
});
