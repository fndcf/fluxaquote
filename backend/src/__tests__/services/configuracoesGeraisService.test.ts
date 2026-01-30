import { createConfiguracoesGeraisService } from '../../services/configuracoesGeraisService';
import { createConfiguracoesGeraisRepository } from '../../repositories/configuracoesGeraisRepository';
import { createHistoricoValoresRepository } from '../../repositories/historicoValoresRepository';
import { ValidationError } from '../../utils/errors';
import { ConfiguracoesGerais } from '../../models';

// Mock dos repositories
jest.mock('../../repositories/configuracoesGeraisRepository');
jest.mock('../../repositories/historicoValoresRepository');

const mockConfigRepo = {
  get: jest.fn(),
  update: jest.fn(),
};

const mockHistoricoRepo = {
  salvarHistoricoConfiguracao: jest.fn(),
};

(createConfiguracoesGeraisRepository as jest.Mock).mockReturnValue(mockConfigRepo);
(createHistoricoValoresRepository as jest.Mock).mockReturnValue(mockHistoricoRepo);

describe('configuracoesGeraisService', () => {
  let service: ReturnType<typeof createConfiguracoesGeraisService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createConfiguracoesGeraisRepository as jest.Mock).mockReturnValue(mockConfigRepo);
    (createHistoricoValoresRepository as jest.Mock).mockReturnValue(mockHistoricoRepo);
    service = createConfiguracoesGeraisService('test-tenant-id');
    // Mock do historicoValoresRepository
    mockHistoricoRepo.salvarHistoricoConfiguracao.mockResolvedValue({
      id: 'historico-1',
      dataVigencia: new Date(),
      custoFixoMensal: 0,
      impostoMaterial: 0,
      impostoServico: 0,
      createdAt: new Date(),
    });
  });

  const mockConfiguracoes: ConfiguracoesGerais = {
    diasValidadeOrcamento: 30,
    nomeEmpresa: 'Empresa Teste',
    cnpjEmpresa: '12345678901234',
    enderecoEmpresa: 'Rua Teste, 123',
    telefoneEmpresa: '11999999999',
    emailEmpresa: 'teste@empresa.com',
    custoFixoMensal: 0,
    impostoMaterial: 0,
    impostoServico: 0,
  };

  describe('buscar', () => {
    it('deve retornar configurações', async () => {
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);

      const resultado = await service.buscar();

      expect(mockConfigRepo.get).toHaveBeenCalled();
      expect(resultado).toEqual(mockConfiguracoes);
    });
  });

  describe('atualizar', () => {
    beforeEach(() => {
      // Configurar mock do get para todos os testes de atualização
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
    });

    it('deve atualizar configurações com sucesso', async () => {
      const dados = { diasValidadeOrcamento: 60 };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
      expect(resultado.diasValidadeOrcamento).toBe(60);
    });

    it('deve atualizar nome da empresa', async () => {
      const dados = { nomeEmpresa: 'Nova Empresa' };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(resultado.nomeEmpresa).toBe('Nova Empresa');
    });

    it('deve lançar ValidationError quando dias de validade for menor que 1', async () => {
      await expect(service.atualizar({ diasValidadeOrcamento: 0 })).rejects.toThrow(ValidationError);
      await expect(service.atualizar({ diasValidadeOrcamento: 0 })).rejects.toThrow(
        'Dias de validade deve ser entre 1 e 365'
      );
    });

    it('deve lançar ValidationError quando dias de validade for maior que 365', async () => {
      await expect(service.atualizar({ diasValidadeOrcamento: 400 })).rejects.toThrow(ValidationError);
      await expect(service.atualizar({ diasValidadeOrcamento: 400 })).rejects.toThrow(
        'Dias de validade deve ser entre 1 e 365'
      );
    });

    it('deve lançar ValidationError quando CNPJ for inválido', async () => {
      await expect(service.atualizar({ cnpjEmpresa: '123' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar({ cnpjEmpresa: '123' })).rejects.toThrow('CNPJ inválido');
    });

    it('deve aceitar CNPJ formatado válido', async () => {
      const dados = { cnpjEmpresa: '12.345.678/9012-34' };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
    });

    it('deve aceitar CNPJ vazio', async () => {
      const dados = { cnpjEmpresa: '' };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
    });

    it('deve lançar ValidationError quando email for inválido', async () => {
      await expect(service.atualizar({ emailEmpresa: 'emailinvalido' })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar({ emailEmpresa: 'emailinvalido' })).rejects.toThrow(
        'Email inválido'
      );
    });

    it('deve aceitar email válido', async () => {
      const dados = { emailEmpresa: 'novo@email.com' };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
    });

    it('deve aceitar email vazio', async () => {
      const dados = { emailEmpresa: '' };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
    });

    it('deve aceitar dias de validade no limite mínimo', async () => {
      const dados = { diasValidadeOrcamento: 1 };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
    });

    it('deve aceitar dias de validade no limite máximo', async () => {
      const dados = { diasValidadeOrcamento: 365 };
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
    });
  });

  describe('impostos', () => {
    it('deve atualizar imposto sobre material', async () => {
      const dados = { impostoMaterial: 10 };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
      expect(resultado.impostoMaterial).toBe(10);
    });

    it('deve atualizar imposto sobre serviço', async () => {
      const dados = { impostoServico: 15 };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
      expect(resultado.impostoServico).toBe(15);
    });

    it('deve atualizar ambos os impostos simultaneamente', async () => {
      const dados = { impostoMaterial: 8.5, impostoServico: 12.5 };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
      expect(resultado.impostoMaterial).toBe(8.5);
      expect(resultado.impostoServico).toBe(12.5);
    });

    it('deve aceitar imposto zero', async () => {
      const dados = { impostoMaterial: 0, impostoServico: 0 };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(mockConfigRepo.update).toHaveBeenCalledWith(dados);
      expect(resultado.impostoMaterial).toBe(0);
      expect(resultado.impostoServico).toBe(0);
    });

    it('deve aceitar valores decimais para impostos', async () => {
      const dados = { impostoMaterial: 5.75, impostoServico: 9.25 };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      const resultado = await service.atualizar(dados);

      expect(resultado.impostoMaterial).toBe(5.75);
      expect(resultado.impostoServico).toBe(9.25);
    });

    it('deve salvar histórico quando imposto mudar', async () => {
      const dados = { impostoMaterial: 15 };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockHistoricoRepo.salvarHistoricoConfiguracao).toHaveBeenCalled();
    });

    it('não deve salvar histórico quando outros campos mudarem', async () => {
      const dados = { nomeEmpresa: 'Nova Empresa' };
      mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
      mockConfigRepo.update.mockResolvedValue({ ...mockConfiguracoes, ...dados });

      await service.atualizar(dados);

      expect(mockHistoricoRepo.salvarHistoricoConfiguracao).not.toHaveBeenCalled();
    });
  });
});
