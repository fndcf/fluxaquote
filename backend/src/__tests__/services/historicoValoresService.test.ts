import { createHistoricoValoresService } from '../../services/historicoValoresService';
import { createHistoricoValoresRepository } from '../../repositories/historicoValoresRepository';
import { ValidationError } from '../../utils/errors';

jest.mock('../../repositories/historicoValoresRepository');

const mockRepo = {
  buscarHistoricoItensPorPeriodo: jest.fn(),
  buscarHistoricoConfiguracoesPorPeriodo: jest.fn(),
};
(createHistoricoValoresRepository as jest.Mock).mockReturnValue(mockRepo);

describe('historicoValoresService', () => {
  let service: ReturnType<typeof createHistoricoValoresService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createHistoricoValoresRepository as jest.Mock).mockReturnValue(mockRepo);
    service = createHistoricoValoresService('test-tenant-id');
  });

  describe('buscarHistoricoItensPorPeriodo', () => {
    it('deve buscar histórico com datas válidas', async () => {
      const mockHistorico = [
        { id: '1', itemServicoId: 'item-1', valorAnterior: 100, valorNovo: 120 },
      ];
      mockRepo.buscarHistoricoItensPorPeriodo.mockResolvedValue(mockHistorico);

      const result = await service.buscarHistoricoItensPorPeriodo('2024-01-01', '2024-12-31');

      expect(result).toEqual(mockHistorico);
      expect(mockRepo.buscarHistoricoItensPorPeriodo).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
    });

    it('deve ajustar data fim para final do dia', async () => {
      mockRepo.buscarHistoricoItensPorPeriodo.mockResolvedValue([]);

      await service.buscarHistoricoItensPorPeriodo('2024-01-01', '2024-06-30');

      const [, dataFim] = mockRepo.buscarHistoricoItensPorPeriodo.mock.calls[0];
      expect(dataFim.getHours()).toBe(23);
      expect(dataFim.getMinutes()).toBe(59);
      expect(dataFim.getSeconds()).toBe(59);
      expect(dataFim.getMilliseconds()).toBe(999);
    });

    it('deve lançar ValidationError quando dataInicio é vazia', async () => {
      await expect(
        service.buscarHistoricoItensPorPeriodo('', '2024-12-31')
      ).rejects.toThrow(ValidationError);
      await expect(
        service.buscarHistoricoItensPorPeriodo('', '2024-12-31')
      ).rejects.toThrow('Data início e data fim são obrigatórias');
    });

    it('deve lançar ValidationError quando dataFim é vazia', async () => {
      await expect(
        service.buscarHistoricoItensPorPeriodo('2024-01-01', '')
      ).rejects.toThrow(ValidationError);
    });

    it('deve lançar ValidationError quando ambas datas são vazias', async () => {
      await expect(
        service.buscarHistoricoItensPorPeriodo('', '')
      ).rejects.toThrow('Data início e data fim são obrigatórias');
    });

    it('deve lançar ValidationError para datas inválidas', async () => {
      await expect(
        service.buscarHistoricoItensPorPeriodo('invalid', '2024-12-31')
      ).rejects.toThrow(ValidationError);
      await expect(
        service.buscarHistoricoItensPorPeriodo('invalid', '2024-12-31')
      ).rejects.toThrow('Datas inválidas');
    });

    it('deve lançar ValidationError para dataFim inválida', async () => {
      await expect(
        service.buscarHistoricoItensPorPeriodo('2024-01-01', 'invalid')
      ).rejects.toThrow('Datas inválidas');
    });
  });

  describe('buscarHistoricoConfiguracoesPorPeriodo', () => {
    it('deve buscar histórico de configurações com datas válidas', async () => {
      const mockHistorico = [
        { id: '1', campo: 'diasValidade', valorAnterior: '30', valorNovo: '45' },
      ];
      mockRepo.buscarHistoricoConfiguracoesPorPeriodo.mockResolvedValue(mockHistorico);

      const result = await service.buscarHistoricoConfiguracoesPorPeriodo('2024-01-01', '2024-12-31');

      expect(result).toEqual(mockHistorico);
      expect(mockRepo.buscarHistoricoConfiguracoesPorPeriodo).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
    });

    it('deve ajustar data fim para final do dia', async () => {
      mockRepo.buscarHistoricoConfiguracoesPorPeriodo.mockResolvedValue([]);

      await service.buscarHistoricoConfiguracoesPorPeriodo('2024-01-01', '2024-06-30');

      const [, dataFim] = mockRepo.buscarHistoricoConfiguracoesPorPeriodo.mock.calls[0];
      expect(dataFim.getHours()).toBe(23);
      expect(dataFim.getMinutes()).toBe(59);
      expect(dataFim.getSeconds()).toBe(59);
    });

    it('deve lançar ValidationError quando dataInicio é vazia', async () => {
      await expect(
        service.buscarHistoricoConfiguracoesPorPeriodo('', '2024-12-31')
      ).rejects.toThrow('Data início e data fim são obrigatórias');
    });

    it('deve lançar ValidationError quando dataFim é vazia', async () => {
      await expect(
        service.buscarHistoricoConfiguracoesPorPeriodo('2024-01-01', '')
      ).rejects.toThrow(ValidationError);
    });

    it('deve lançar ValidationError para datas inválidas', async () => {
      await expect(
        service.buscarHistoricoConfiguracoesPorPeriodo('abc', 'xyz')
      ).rejects.toThrow('Datas inválidas');
    });

    it('deve lançar ValidationError para dataInicio inválida', async () => {
      await expect(
        service.buscarHistoricoConfiguracoesPorPeriodo('not-a-date', '2024-12-31')
      ).rejects.toThrow('Datas inválidas');
    });
  });

  describe('criação do service', () => {
    it('deve criar repository com o tenantId correto', () => {
      createHistoricoValoresService('meu-tenant');

      expect(createHistoricoValoresRepository).toHaveBeenCalledWith('meu-tenant');
    });
  });
});
