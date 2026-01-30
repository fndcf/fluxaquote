import { createOrcamentoService } from '../../services/orcamentoService';
import { createOrcamentoRepository } from '../../repositories/orcamentoRepository';
import { createClienteRepository } from '../../repositories/clienteRepository';
import { createConfiguracoesGeraisRepository } from '../../repositories/configuracoesGeraisRepository';
import { ValidationError, NotFoundError } from '../../utils/errors';

// Mock do FieldValue do Firebase
jest.mock('../../config/firebase', () => ({
  FieldValue: {
    delete: jest.fn(() => ({ _methodName: 'FieldValue.delete' })),
    serverTimestamp: jest.fn(() => ({ _methodName: 'FieldValue.serverTimestamp' })),
  },
}));

// Mock dos repositories
jest.mock('../../repositories/orcamentoRepository');
jest.mock('../../repositories/clienteRepository');
jest.mock('../../repositories/configuracoesGeraisRepository');

const mockOrcamentoRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByClienteId: jest.fn(),
  findByStatus: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
  getNextNumero: jest.fn(),
  getEstatisticas: jest.fn(),
};

const mockClienteRepo = {
  findById: jest.fn(),
  findAll: jest.fn(),
};

const mockConfigRepo = {
  get: jest.fn(),
};

(createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcamentoRepo);
(createClienteRepository as jest.Mock).mockReturnValue(mockClienteRepo);
(createConfiguracoesGeraisRepository as jest.Mock).mockReturnValue(mockConfigRepo);

describe('orcamentoService', () => {
  let service: ReturnType<typeof createOrcamentoService>;

  const mockCliente = {
    id: 'c1',
    razaoSocial: 'Empresa Teste',
    cnpj: '12345678901234',
    endereco: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234567',
    telefone: '11999999999',
    email: 'teste@email.com',
  };

  const mockOrcamentoCompleto = {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'completo' as const,
    clienteId: 'c1',
    clienteNome: 'Empresa Teste',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    dataEmissao: new Date(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    servicoId: 's1',
    servicoDescricao: 'Serviço de Manutenção',
    itensCompleto: [
      {
        etapa: 'comercial' as const,
        categoriaId: 'cat1',
        categoriaNome: 'Extintor',
        descricao: 'Extintor ABC 6kg',
        unidade: 'UN',
        quantidade: 10,
        valorUnitarioMaoDeObra: 50,
        valorUnitarioMaterial: 100,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 1000,
        valorTotal: 1500,
      },
    ],
    valorTotalMaoDeObra: 500,
    valorTotalMaterial: 1000,
    valorTotal: 1500,
  };

  const mockConfiguracoes = {
    diasValidadeOrcamento: 30,
    nomeEmpresa: 'Empresa Teste',
    cnpjEmpresa: '12345678901234',
    enderecoEmpresa: 'Rua Teste, 123',
    telefoneEmpresa: '11999999999',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcamentoRepo);
    (createClienteRepository as jest.Mock).mockReturnValue(mockClienteRepo);
    (createConfiguracoesGeraisRepository as jest.Mock).mockReturnValue(mockConfigRepo);
    service = createOrcamentoService('test-tenant-id');
    // Configura o mock das configurações gerais por padrão
    mockConfigRepo.get.mockResolvedValue(mockConfiguracoes);
  });

  describe('listar', () => {
    it('deve listar todos os orçamentos', async () => {
      mockOrcamentoRepo.findAll.mockResolvedValue([mockOrcamentoCompleto]);

      const result = await service.listar();

      expect(mockOrcamentoRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockOrcamentoCompleto]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar orçamento por ID', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);

      const result = await service.buscarPorId('o1');

      expect(mockOrcamentoRepo.findById).toHaveBeenCalledWith('o1');
      expect(result).toEqual(mockOrcamentoCompleto);
    });
  });

  describe('buscarPorCliente', () => {
    it('deve buscar orçamentos por cliente', async () => {
      mockOrcamentoRepo.findByClienteId.mockResolvedValue([mockOrcamentoCompleto]);

      const result = await service.buscarPorCliente('c1');

      expect(mockOrcamentoRepo.findByClienteId).toHaveBeenCalledWith('c1');
      expect(result).toEqual([mockOrcamentoCompleto]);
    });
  });

  describe('buscarPorStatus', () => {
    it('deve buscar orçamentos por status', async () => {
      mockOrcamentoRepo.findByStatus.mockResolvedValue([mockOrcamentoCompleto]);

      const result = await service.buscarPorStatus('aberto');

      expect(mockOrcamentoRepo.findByStatus).toHaveBeenCalledWith('aberto');
      expect(result).toEqual([mockOrcamentoCompleto]);
    });
  });

  describe('criar', () => {
    it('deve criar um novo orçamento completo', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(1);
      mockOrcamentoRepo.create.mockResolvedValue(mockOrcamentoCompleto);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        servicoDescricao: 'Serviço de Manutenção',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      const result = await service.criar(data);

      expect(mockClienteRepo.findById).toHaveBeenCalledWith('c1');
      expect(mockOrcamentoRepo.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrcamentoCompleto);
    });

    it('deve lançar erro se cliente não existir', async () => {
      mockClienteRepo.findById.mockResolvedValue(null);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'inexistente',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(service.criar(data)).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se não houver itens', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [],
      };

      await expect(service.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se descrição do item for curta', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'AB',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(service.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se quantidade for zero ou negativa', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 0,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 0,
            valorTotalMaterial: 0,
            valorTotal: 0,
          },
        ],
      };

      await expect(service.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve criar orçamento com observações, consultor e contato', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(1);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
        observacoes: 'Observação teste',
        consultor: 'João',
        contato: 'Maria',
      };

      await service.criar(data);

      expect(mockOrcamentoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          observacoes: 'Observação teste',
          consultor: 'João',
          contato: 'Maria',
        })
      );
    });

    it('deve usar dias de validade customizados', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(1);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
        diasValidade: 60,
      };

      await service.criar(data);

      expect(mockOrcamentoRepo.create).toHaveBeenCalled();
    });

    it('deve lançar erro se orçamento não tiver serviço', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(service.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se item não tiver categoria', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: '',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(service.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve criar orçamento com limitações e prazos', async () => {
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(2);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o2' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        servicoDescricao: 'Serviço de Manutenção',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
        limitacoesSelecionadas: ['lim1', 'lim2'],
        prazoExecucaoServicos: 30,
        prazoVistoriaBombeiros: 15,
        condicaoPagamento: 'parcelado' as const,
        parcelamentoTexto: '3x sem juros',
      };

      await service.criar(data);

      expect(mockOrcamentoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          limitacoesSelecionadas: ['lim1', 'lim2'],
          prazoExecucaoServicos: 30,
          prazoVistoriaBombeiros: 15,
          condicaoPagamento: 'parcelado',
          parcelamentoTexto: '3x sem juros',
        })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um orçamento aberto', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockResolvedValue({ ...mockOrcamentoCompleto, versao: 1 });

      const result = await service.atualizar('o1', {
        observacoes: 'Nova observação',
      });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        versao: 1,
        observacoes: 'Nova observação',
      }));
    });

    it('deve lançar erro ao tentar atualizar orçamento não aberto', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      await expect(service.atualizar('o1', { observacoes: 'teste' }))
        .rejects.toThrow(ValidationError);
    });

    it('deve atualizar itens e recalcular total', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockOrcamentoCompleto, ...data }));

      const novosItens = [
        {
          etapa: 'comercial' as const,
          categoriaId: 'cat2',
          categoriaNome: 'Mangueiras',
          descricao: 'Mangueira de Incêndio',
          unidade: 'M',
          quantidade: 20,
          valorUnitarioMaoDeObra: 10,
          valorUnitarioMaterial: 25,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 500,
          valorTotal: 700,
        },
      ];

      await service.atualizar('o1', { itensCompleto: novosItens });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        itensCompleto: expect.arrayContaining([
          expect.objectContaining({
            descricao: 'Mangueira de Incêndio',
            valorTotalMaoDeObra: 200,
            valorTotalMaterial: 500,
            valorTotal: 700,
          }),
        ]),
        valorTotalMaoDeObra: 200,
        valorTotalMaterial: 500,
        valorTotal: 700,
      }));
    });

    it('deve lançar erro se novos itens forem vazios', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);

      await expect(service.atualizar('o1', { itensCompleto: [] }))
        .rejects.toThrow(ValidationError);
    });

    it('deve validar cada item ao atualizar', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);

      const itensInvalidos = [
        {
          etapa: 'comercial' as const,
          categoriaId: 'cat1',
          categoriaNome: 'Extintor',
          descricao: 'AB',
          unidade: 'UN',
          quantidade: 1,
          valorUnitarioMaoDeObra: 50,
          valorUnitarioMaterial: 100,
          valorTotalMaoDeObra: 50,
          valorTotalMaterial: 100,
          valorTotal: 150,
        },
      ];

      await expect(service.atualizar('o1', { itensCompleto: itensInvalidos }))
        .rejects.toThrow(ValidationError);
    });

    it('deve atualizar data de validade', async () => {
      // Criar mock com data específica diferente da que vamos atualizar
      const dataOriginal = new Date('2024-06-01T00:00:00.000Z');
      const mockComDataEspecifica = {
        id: 'o1',
        numero: 1,
        versao: 0,
        tipo: 'completo' as const,
        clienteId: 'c1',
        clienteNome: 'Empresa Teste',
        clienteCnpj: '12345678901234',
        status: 'aberto' as const,
        dataEmissao: new Date(),
        dataValidade: dataOriginal,
        servicoId: 's1',
        servicoDescricao: 'Serviço de Manutenção',
        itensCompleto: mockOrcamentoCompleto.itensCompleto,
        valorTotal: 1500,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 1000,
        createdAt: new Date(),
      };
      mockOrcamentoRepo.findById.mockResolvedValue(mockComDataEspecifica);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockComDataEspecifica, ...data }));

      // Data nova diferente da original
      const novaData = new Date('2025-01-01T00:00:00.000Z');

      await service.atualizar('o1', { dataValidade: novaData });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        dataValidade: novaData,
      }));
    });

    it('deve lançar erro se item não tiver categoria na atualização', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);

      await expect(service.atualizar('o1', {
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: '',
            categoriaNome: 'Teste',
            descricao: 'Teste Item',
            unidade: 'UN',
            quantidade: 1,
            valorUnitarioMaoDeObra: 10,
            valorUnitarioMaterial: 20,
            valorTotalMaoDeObra: 10,
            valorTotalMaterial: 20,
            valorTotal: 30,
          },
        ],
      })).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se item tiver quantidade zero na atualização', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);

      await expect(service.atualizar('o1', {
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Teste',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 0,
            valorUnitarioMaoDeObra: 10,
            valorUnitarioMaterial: 20,
            valorTotalMaoDeObra: 0,
            valorTotalMaterial: 0,
            valorTotal: 0,
          },
        ],
      })).rejects.toThrow(ValidationError);
    });

    it('deve atualizar campos opcionais do orçamento', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockOrcamentoCompleto, ...data }));

      await service.atualizar('o1', {
        servicoId: 's2',
        servicoDescricao: 'Novo Serviço',
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 45,
        prazoVistoriaBombeiros: 20,
        condicaoPagamento: 'a_combinar',
        parcelamentoTexto: '  texto com espaços  ',
      });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        servicoId: 's2',
        servicoDescricao: 'Novo Serviço',
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 45,
        prazoVistoriaBombeiros: 20,
        condicaoPagamento: 'a_combinar',
        parcelamentoTexto: 'texto com espaços',
      }));
    });

    it('deve atualizar campos de contato (consultor, contato, email, telefone, enderecoServico)', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockOrcamentoCompleto, ...data }));

      await service.atualizar('o1', {
        consultor: 'João Silva',
        contato: 'Maria Santos',
        email: 'teste@email.com',
        telefone: '11999999999',
        enderecoServico: 'Rua Nova, 456',
      });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        consultor: 'João Silva',
        contato: 'Maria Santos',
        email: 'teste@email.com',
        telefone: '11999999999',
        enderecoServico: 'Rua Nova, 456',
      }));
    });

    it('deve remover campos de contato quando enviados vazios', async () => {
      const orcamentoComCampos = {
        ...mockOrcamentoCompleto,
        consultor: 'Antigo Consultor',
        contato: 'Antigo Contato',
        email: 'antigo@email.com',
        telefone: '11888888888',
        enderecoServico: 'Endereço Antigo',
      };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoComCampos);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...orcamentoComCampos, ...data }));

      await service.atualizar('o1', {
        consultor: '',
        contato: '',
        email: '',
        telefone: '',
        enderecoServico: '',
      });

      expect(mockOrcamentoRepo.update).toHaveBeenCalled();
    });

    it('deve atualizar parcelamentoDados', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockOrcamentoCompleto, ...data }));

      const parcelamentoDados = {
        entradaPercent: 30,
        valorEntrada: 450,
        valorRestante: 1050,
        opcoes: [
          { numeroParcelas: 3, valorParcela: 350, valorTotal: 1050, temJuros: false, taxaJuros: 0 },
        ],
      };

      await service.atualizar('o1', { parcelamentoDados });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        parcelamentoDados,
      }));
    });

    it('deve atualizar descontoAVista com percentual válido', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockOrcamentoCompleto, ...data }));

      const descontoAVista = { percentual: 10, valorDesconto: 150, valorFinal: 1350 };

      await service.atualizar('o1', { descontoAVista });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        descontoAVista,
      }));
    });

    it('deve remover descontoAVista quando percentual for zero', async () => {
      const orcamentoComDesconto = {
        ...mockOrcamentoCompleto,
        descontoAVista: { percentual: 10, valorDesconto: 150, valorFinal: 1350 },
      };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoComDesconto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...orcamentoComDesconto, ...data }));

      await service.atualizar('o1', { descontoAVista: { percentual: 0, valorDesconto: 0, valorFinal: 1500 } });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        descontoAVista: null,
      }));
    });

    it('deve atualizar mostrarValoresDetalhados', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.update.mockImplementation((id: string, data: any) => ({ ...mockOrcamentoCompleto, ...data }));

      await service.atualizar('o1', { mostrarValoresDetalhados: true });

      expect(mockOrcamentoRepo.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        mostrarValoresDetalhados: true,
      }));
    });

    it('não deve atualizar se nenhum campo mudou', async () => {
      const orcamentoExistente = {
        ...mockOrcamentoCompleto,
        observacoes: 'Obs existente',
      };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoExistente);

      // Enviar os mesmos dados
      const result = await service.atualizar('o1', { observacoes: 'Obs existente' });

      // Não deve chamar update se não houve mudanças
      expect(result).toBeDefined();
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar status de aberto para aceito', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.updateStatus.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      const result = await service.atualizarStatus('o1', 'aceito');

      expect(mockOrcamentoRepo.updateStatus).toHaveBeenCalledWith('o1', 'aceito', expect.any(Date));
    });

    it('deve atualizar status de aberto para recusado', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.updateStatus.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'recusado' });

      await service.atualizarStatus('o1', 'recusado');

      expect(mockOrcamentoRepo.updateStatus).toHaveBeenCalledWith('o1', 'recusado', undefined);
    });

    it('deve lançar erro para transição inválida', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      await expect(service.atualizarStatus('o1', 'recusado'))
        .rejects.toThrow(ValidationError);
    });

    it('deve permitir voltar de aceito para aberto', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });
      mockOrcamentoRepo.updateStatus.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aberto' });

      await service.atualizarStatus('o1', 'aberto');

      expect(mockOrcamentoRepo.updateStatus).toHaveBeenCalled();
    });

    it('deve permitir voltar de expirado para aberto', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'expirado' });
      mockOrcamentoRepo.updateStatus.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aberto' });

      await service.atualizarStatus('o1', 'aberto');

      expect(mockOrcamentoRepo.updateStatus).toHaveBeenCalled();
    });
  });

  describe('excluir', () => {
    it('deve excluir um orçamento aberto', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockOrcamentoRepo.delete.mockResolvedValue(undefined);

      await service.excluir('o1');

      expect(mockOrcamentoRepo.delete).toHaveBeenCalledWith('o1');
    });

    it('deve lançar erro ao tentar excluir orçamento aceito', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      await expect(service.excluir('o1')).rejects.toThrow(ValidationError);
    });

    it('deve permitir excluir orçamento recusado', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue({ ...mockOrcamentoCompleto, status: 'recusado' });
      mockOrcamentoRepo.delete.mockResolvedValue(undefined);

      await service.excluir('o1');

      expect(mockOrcamentoRepo.delete).toHaveBeenCalledWith('o1');
    });
  });

  describe('duplicar', () => {
    it('deve duplicar um orçamento', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(2);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o2' }));

      const result = await service.duplicar('o1');

      expect(result).toHaveProperty('numero', 2);
      expect(result).toHaveProperty('status', 'aberto');
      expect(result).toHaveProperty('versao', 0);
    });

    it('deve lançar erro se cliente não existir mais', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamentoCompleto);
      mockClienteRepo.findById.mockRejectedValue(new Error('Cliente não encontrado'));

      await expect(service.duplicar('o1')).rejects.toThrow(ValidationError);
    });

    it('deve manter consultor, contato e observações ao duplicar', async () => {
      const orcamentoComDados = {
        ...mockOrcamentoCompleto,
        consultor: 'João',
        contato: 'Maria',
        observacoes: 'Observação original',
      };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoComDados);
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(2);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o2' }));

      const result = await service.duplicar('o1');

      expect(mockOrcamentoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          consultor: 'João',
          contato: 'Maria',
          observacoes: 'Observação original',
        })
      );
    });

    it('deve duplicar orçamento mantendo todos os campos', async () => {
      const orcamentoCompleto = {
        ...mockOrcamentoCompleto,
        status: 'aceito' as const,
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 30,
        prazoVistoriaBombeiros: 15,
        condicaoPagamento: 'parcelado' as const,
        parcelamentoTexto: '3x',
      };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoCompleto);
      mockClienteRepo.findById.mockResolvedValue(mockCliente);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(3);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o3' }));

      await service.duplicar('o1');

      expect(mockOrcamentoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'completo',
          status: 'aberto',
          versao: 0,
          numero: 3,
          servicoId: 's1',
          servicoDescricao: 'Serviço de Manutenção',
          itensCompleto: mockOrcamentoCompleto.itensCompleto,
          limitacoesSelecionadas: ['lim1'],
          prazoExecucaoServicos: 30,
          prazoVistoriaBombeiros: 15,
          condicaoPagamento: 'parcelado',
          parcelamentoTexto: '3x',
          valorTotalMaoDeObra: 500,
          valorTotalMaterial: 1000,
        })
      );
    });
  });

  describe('cliente com CPF', () => {
    it('deve detectar pessoa física por CPF', async () => {
      const clientePF = { ...mockCliente, cnpj: '12345678901' };
      mockClienteRepo.findById.mockResolvedValue(clientePF);
      mockOrcamentoRepo.getNextNumero.mockResolvedValue(1);
      mockOrcamentoRepo.create.mockImplementation((orc: any) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await service.criar(data);

      expect(mockOrcamentoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clienteTipoPessoa: 'fisica',
        })
      );
    });
  });

  describe('getEstatisticas', () => {
    it('deve retornar estatísticas', async () => {
      const stats = { total: 10, aceitos: 5 };
      mockOrcamentoRepo.getEstatisticas.mockResolvedValue(stats);

      const result = await service.getEstatisticas();

      expect(mockOrcamentoRepo.getEstatisticas).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('verificarExpirados', () => {
    it('deve marcar orçamentos expirados', async () => {
      const orcamentoExpirado = {
        ...mockOrcamentoCompleto,
        dataValidade: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
      };
      mockOrcamentoRepo.findByStatus.mockResolvedValue([orcamentoExpirado]);
      mockOrcamentoRepo.updateStatus.mockResolvedValue({ ...orcamentoExpirado, status: 'expirado' });

      const result = await service.verificarExpirados();

      expect(result).toBe(1);
      expect(mockOrcamentoRepo.updateStatus).toHaveBeenCalledWith('o1', 'expirado');
    });

    it('não deve marcar orçamentos válidos como expirados', async () => {
      const orcamentoValido = {
        ...mockOrcamentoCompleto,
        dataValidade: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
      };
      mockOrcamentoRepo.findByStatus.mockResolvedValue([orcamentoValido]);

      const result = await service.verificarExpirados();

      expect(result).toBe(0);
      expect(mockOrcamentoRepo.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('getDashboardStats', () => {
    const mockClientes = [
      { id: 'c1', razaoSocial: 'Cliente 1' },
      { id: 'c2', razaoSocial: 'Cliente 2' },
    ];

    beforeEach(() => {
      mockClienteRepo.findAll.mockResolvedValue(mockClientes);
    });

    it('deve retornar estatísticas corretas do dashboard', async () => {
      const now = new Date();
      const mockOrcamentos = [
        {
          id: 'o1',
          status: 'aberto',
          valorTotal: 1000,
          dataEmissao: now
        },
        {
          id: 'o2',
          status: 'aceito',
          valorTotal: 2000,
          dataEmissao: now
        },
        {
          id: 'o3',
          status: 'recusado',
          valorTotal: 500,
          dataEmissao: now
        },
        {
          id: 'o4',
          status: 'expirado',
          valorTotal: 750,
          dataEmissao: now
        },
      ];

      mockOrcamentoRepo.findAll.mockResolvedValue(mockOrcamentos);

      const result = await service.getDashboardStats();

      expect(result.total).toBe(4);
      expect(result.abertos).toBe(1);
      expect(result.aceitos).toBe(1);
      expect(result.recusados).toBe(1);
      expect(result.expirados).toBe(1);
      expect(result.valorTotal).toBe(4250);
      expect(result.valorAceitos).toBe(2000);
      expect(result.totalClientes).toBe(2);
      expect(result.porMes).toHaveLength(6);
    });

    it('deve lidar com orçamentos sem valorTotal', async () => {
      const now = new Date();
      const mockOrcamentos = [
        { id: 'o1', status: 'aberto', valorTotal: null, dataEmissao: now },
        { id: 'o2', status: 'aceito', valorTotal: undefined, dataEmissao: now },
      ];

      mockOrcamentoRepo.findAll.mockResolvedValue(mockOrcamentos);

      const result = await service.getDashboardStats();

      expect(result.valorTotal).toBe(0);
      expect(result.valorAceitos).toBe(0);
    });

    it('deve retornar estatísticas vazias quando não há orçamentos', async () => {
      mockOrcamentoRepo.findAll.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.total).toBe(0);
      expect(result.abertos).toBe(0);
      expect(result.aceitos).toBe(0);
      expect(result.recusados).toBe(0);
      expect(result.expirados).toBe(0);
      expect(result.valorTotal).toBe(0);
      expect(result.valorAceitos).toBe(0);
      expect(result.porMes).toHaveLength(6);
    });

    it('deve calcular porMes corretamente para diferentes meses', async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      const mockOrcamentos = [
        { id: 'o1', status: 'aceito', valorTotal: 1000, dataEmissao: now },
        { id: 'o2', status: 'aberto', valorTotal: 500, dataEmissao: lastMonth },
        { id: 'o3', status: 'aceito', valorTotal: 2000, dataEmissao: lastMonth },
      ];

      mockOrcamentoRepo.findAll.mockResolvedValue(mockOrcamentos);

      const result = await service.getDashboardStats();

      // Verificar que há 6 meses de dados
      expect(result.porMes).toHaveLength(6);

      // O mês atual deve ter 1 orçamento
      const currentMonthStats = result.porMes[result.porMes.length - 1];
      expect(currentMonthStats.total).toBe(1);
      expect(currentMonthStats.aceitos).toBe(1);
      expect(currentMonthStats.valor).toBe(1000);

      // O mês anterior deve ter 2 orçamentos
      const lastMonthStats = result.porMes[result.porMes.length - 2];
      expect(lastMonthStats.total).toBe(2);
      expect(lastMonthStats.aceitos).toBe(1);
      expect(lastMonthStats.valor).toBe(2500);
    });

    it('deve lidar com dataEmissao como string ISO', async () => {
      const now = new Date();
      const mockOrcamentos = [
        { id: 'o1', status: 'aceito', valorTotal: 1000, dataEmissao: now.toISOString() },
      ];

      mockOrcamentoRepo.findAll.mockResolvedValue(mockOrcamentos);

      const result = await service.getDashboardStats();

      expect(result.total).toBe(1);
      // Verificar que o mês atual tem o orçamento
      const currentMonthStats = result.porMes[result.porMes.length - 1];
      expect(currentMonthStats.total).toBe(1);
    });
  });
});
