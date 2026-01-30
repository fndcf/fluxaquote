import { createNotificacaoService, inicializarEventHandlers } from '../../services/notificacaoService';
import { createNotificacaoRepository } from '../../repositories/notificacaoRepository';
import { createOrcamentoRepository } from '../../repositories/orcamentoRepository';
import { createPalavraChaveRepository } from '../../repositories/palavraChaveRepository';
import { eventBus, OrcamentoEvents } from '../../events';
import { NotFoundError } from '../../utils/errors';
import { Notificacao, Orcamento, PalavraChave } from '../../models';

// Mock dos repositories
jest.mock('../../repositories/notificacaoRepository');
jest.mock('../../repositories/orcamentoRepository');
jest.mock('../../repositories/palavraChaveRepository');

const mockNotificacaoRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findNaoLidas: jest.fn(),
  findVencidas: jest.fn(),
  findProximas: jest.fn(),
  findAtivas: jest.fn(),
  marcarComoLida: jest.fn(),
  marcarTodasComoLidas: jest.fn(),
  delete: jest.fn(),
  deleteByOrcamentoId: jest.fn(),
  exists: jest.fn(),
  createMany: jest.fn(),
  findAllPaginated: jest.fn(),
  findNaoLidasPaginated: jest.fn(),
  findVencidasPaginated: jest.fn(),
  findAtivasPaginated: jest.fn(),
  findProximasPaginated: jest.fn(),
};

const mockOrcamentoRepo = {
  findById: jest.fn(),
  findByStatus: jest.fn(),
};

const mockPalavraChaveRepo = {
  findAtivas: jest.fn(),
};

(createNotificacaoRepository as jest.Mock).mockReturnValue(mockNotificacaoRepo);
(createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcamentoRepo);
(createPalavraChaveRepository as jest.Mock).mockReturnValue(mockPalavraChaveRepo);

describe('notificacaoService', () => {
  let service: ReturnType<typeof createNotificacaoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createNotificacaoRepository as jest.Mock).mockReturnValue(mockNotificacaoRepo);
    (createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcamentoRepo);
    (createPalavraChaveRepository as jest.Mock).mockReturnValue(mockPalavraChaveRepo);
    service = createNotificacaoService('test-tenant-id');
  });

  const mockNotificacao: Notificacao = {
    id: '1',
    orcamentoId: 'orc1',
    orcamentoNumero: 1,
    clienteId: 'cli1',
    clienteNome: 'Cliente Teste',
    itemDescricao: 'Extintor ABC 6kg',
    palavraChave: 'extintor',
    dataVencimento: new Date('2025-12-31'),
    lida: false,
    createdAt: new Date(),
  };

  const mockOrcamento: Orcamento = {
    id: 'orc1',
    numero: 1,
    versao: 0,
    tipo: 'completo',
    clienteId: 'cli1',
    clienteNome: 'Cliente Teste',
    clienteCnpj: '12345678901234',
    status: 'aceito',
    dataEmissao: new Date('2025-01-01'),
    dataValidade: new Date('2025-02-01'),
    dataAceite: new Date('2025-01-15'),
    itensCompleto: [
      {
        etapa: 'comercial',
        categoriaId: 'cat1',
        categoriaNome: 'Extintores',
        descricao: 'Extintor ABC 6kg',
        quantidade: 10,
        unidade: 'UN',
        valorUnitarioMaoDeObra: 50,
        valorUnitarioMaterial: 50,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
      {
        etapa: 'comercial',
        categoriaId: 'cat2',
        categoriaNome: 'Mangueiras',
        descricao: 'Mangueira de incêndio',
        quantidade: 5,
        unidade: 'M',
        valorUnitarioMaoDeObra: 100,
        valorUnitarioMaterial: 100,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
    ],
    valorTotal: 2000,
    createdAt: new Date(),
  };

  const mockPalavraChave: PalavraChave = {
    id: 'pc1',
    palavra: 'extintor',
    prazoDias: 365,
    ativo: true,
    createdAt: new Date(),
  };

  describe('buscarPorId', () => {
    it('deve retornar notificação por ID', async () => {
      mockNotificacaoRepo.findById.mockResolvedValue(mockNotificacao);

      const resultado = await service.buscarPorId('1');

      expect(mockNotificacaoRepo.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockNotificacao);
    });

    it('deve lançar NotFoundError quando notificação não existir', async () => {
      mockNotificacaoRepo.findById.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.buscarPorId('inexistente')).rejects.toThrow('Notificação não encontrada');
    });
  });

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      const notificacaoLida = { ...mockNotificacao, lida: true };
      mockNotificacaoRepo.marcarComoLida.mockResolvedValue(notificacaoLida);

      const resultado = await service.marcarComoLida('1');

      expect(mockNotificacaoRepo.marcarComoLida).toHaveBeenCalledWith('1');
      expect(resultado.lida).toBe(true);
    });

    it('deve lançar NotFoundError quando notificação não existir', async () => {
      mockNotificacaoRepo.marcarComoLida.mockResolvedValue(null);

      await expect(service.marcarComoLida('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.marcarComoLida('inexistente')).rejects.toThrow('Notificação não encontrada');
    });
  });

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas notificações como lidas', async () => {
      mockNotificacaoRepo.marcarTodasComoLidas.mockResolvedValue(5);

      const resultado = await service.marcarTodasComoLidas();

      expect(mockNotificacaoRepo.marcarTodasComoLidas).toHaveBeenCalled();
      expect(resultado).toBe(5);
    });
  });

  describe('excluir', () => {
    it('deve excluir notificação com sucesso', async () => {
      mockNotificacaoRepo.delete.mockResolvedValue(true);

      await expect(service.excluir('1')).resolves.not.toThrow();

      expect(mockNotificacaoRepo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundError quando notificação não existir', async () => {
      mockNotificacaoRepo.delete.mockResolvedValue(false);

      await expect(service.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.excluir('inexistente')).rejects.toThrow('Notificação não encontrada');
    });
  });

  describe('gerarNotificacoesParaOrcamento', () => {
    it('deve gerar notificações para orçamento aceito', async () => {
      mockOrcamentoRepo.findById.mockResolvedValue(mockOrcamento);
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao]);

      const resultado = await service.gerarNotificacoesParaOrcamento('orc1');

      expect(mockOrcamentoRepo.findById).toHaveBeenCalledWith('orc1');
      expect(resultado).toHaveLength(1);
    });

    it('deve retornar array vazio para orçamento não aceito', async () => {
      const orcamentoPendente = { ...mockOrcamento, status: 'pendente' };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoPendente);

      const resultado = await service.gerarNotificacoesParaOrcamento('orc1');

      expect(resultado).toEqual([]);
    });

    it('deve retornar array vazio para orçamento rejeitado', async () => {
      const orcamentoRejeitado = { ...mockOrcamento, status: 'rejeitado' };
      mockOrcamentoRepo.findById.mockResolvedValue(orcamentoRejeitado);

      const resultado = await service.gerarNotificacoesParaOrcamento('orc1');

      expect(resultado).toEqual([]);
    });
  });

  describe('processarOrcamento', () => {
    it('deve retornar array vazio quando não há palavras-chave ativas', async () => {
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([]);

      const resultado = await service.processarOrcamento(mockOrcamento);

      expect(resultado).toEqual([]);
    });

    it('deve criar notificações para itens que contêm palavras-chave', async () => {
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao]);

      const resultado = await service.processarOrcamento(mockOrcamento);

      expect(mockNotificacaoRepo.createMany).toHaveBeenCalled();
      expect(resultado).toHaveLength(1);
    });

    it('deve não criar notificação duplicada', async () => {
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(true);

      const resultado = await service.processarOrcamento(mockOrcamento);

      expect(mockNotificacaoRepo.createMany).not.toHaveBeenCalled();
      expect(resultado).toEqual([]);
    });

    it('deve processar itens do orçamento completo', async () => {
      const orcamentoCompleto: Orcamento = {
        ...mockOrcamento,
        itensCompleto: [
          {
            etapa: 'comercial',
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: 'Extintor CO2 4kg',
            unidade: 'UN',
            quantidade: 5,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 250,
            valorTotalMaterial: 500,
            valorTotal: 750,
          },
        ],
      };
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao]);

      const resultado = await service.processarOrcamento(orcamentoCompleto);

      expect(mockNotificacaoRepo.createMany).toHaveBeenCalled();
      expect(resultado).toHaveLength(1);
    });

    it('deve usar dataEmissao quando dataAceite não existir', async () => {
      const orcamentoSemAceite = { ...mockOrcamento, dataAceite: undefined };
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao]);

      await service.processarOrcamento(orcamentoSemAceite);

      expect(mockNotificacaoRepo.createMany).toHaveBeenCalled();
    });

    it('deve ignorar itens sem descrição', async () => {
      const orcamentoSemDescricao: Orcamento = {
        ...mockOrcamento,
        itensCompleto: [
          {
            etapa: 'comercial',
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: '',
            quantidade: 10,
            unidade: 'UN',
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 50,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 500,
            valorTotal: 1000,
          },
        ],
      };
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);

      const resultado = await service.processarOrcamento(orcamentoSemDescricao);

      expect(resultado).toEqual([]);
    });

    it('deve fazer match case-insensitive de palavras-chave', async () => {
      const orcamentoMaiusculo: Orcamento = {
        ...mockOrcamento,
        itensCompleto: [
          {
            etapa: 'comercial',
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: 'EXTINTOR ABC 6KG',
            quantidade: 10,
            unidade: 'UN',
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 50,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 500,
            valorTotal: 1000,
          },
        ],
      };
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao]);

      const resultado = await service.processarOrcamento(orcamentoMaiusculo);

      expect(mockNotificacaoRepo.createMany).toHaveBeenCalled();
      expect(resultado).toHaveLength(1);
    });

    it('deve processar múltiplas palavras-chave', async () => {
      const palavraChave2: PalavraChave = {
        id: 'pc2',
        palavra: 'mangueira',
        prazoDias: 180,
        ativo: true,
        createdAt: new Date(),
      };
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave, palavraChave2]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);

      const resultado = await service.processarOrcamento(mockOrcamento);

      expect(resultado).toHaveLength(2);
    });
  });

  describe('processarTodosOrcamentosAceitos', () => {
    it('deve processar todos orçamentos aceitos', async () => {
      const orcamentos = [mockOrcamento, { ...mockOrcamento, id: 'orc2', numero: 'ORC-002' }];
      mockOrcamentoRepo.findByStatus.mockResolvedValue(orcamentos);
      mockPalavraChaveRepo.findAtivas.mockResolvedValue([mockPalavraChave]);
      mockNotificacaoRepo.exists.mockResolvedValue(false);
      mockNotificacaoRepo.createMany.mockResolvedValue([mockNotificacao]);

      const resultado = await service.processarTodosOrcamentosAceitos();

      expect(mockOrcamentoRepo.findByStatus).toHaveBeenCalledWith('aceito');
      expect(resultado.processados).toBe(2);
      expect(resultado.notificacoesCriadas).toBe(2);
    });

    it('deve retornar zero quando não há orçamentos aceitos', async () => {
      mockOrcamentoRepo.findByStatus.mockResolvedValue([]);

      const resultado = await service.processarTodosOrcamentosAceitos();

      expect(resultado.processados).toBe(0);
      expect(resultado.notificacoesCriadas).toBe(0);
    });
  });

  describe('removerNotificacoesDoOrcamento', () => {
    it('deve remover notificações do orçamento', async () => {
      mockNotificacaoRepo.deleteByOrcamentoId.mockResolvedValue(3);

      const resultado = await service.removerNotificacoesDoOrcamento('orc1');

      expect(mockNotificacaoRepo.deleteByOrcamentoId).toHaveBeenCalledWith('orc1');
      expect(resultado).toBe(3);
    });
  });

  describe('contarNaoLidas', () => {
    it('deve contar notificações não lidas', async () => {
      mockNotificacaoRepo.findNaoLidas.mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);

      const resultado = await service.contarNaoLidas();

      expect(resultado).toBe(2);
    });

    it('deve retornar zero quando não há notificações não lidas', async () => {
      mockNotificacaoRepo.findNaoLidas.mockResolvedValue([]);

      const resultado = await service.contarNaoLidas();

      expect(resultado).toBe(0);
    });
  });

  describe('obterResumo', () => {
    it('deve retornar resumo das notificações', async () => {
      mockNotificacaoRepo.findAll.mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);
      mockNotificacaoRepo.findNaoLidas.mockResolvedValue([mockNotificacao]);
      mockNotificacaoRepo.findVencidas.mockResolvedValue([]);
      mockNotificacaoRepo.findProximas.mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);
      mockNotificacaoRepo.findAtivas.mockResolvedValue([mockNotificacao]);

      const resultado = await service.obterResumo();

      expect(resultado).toEqual({
        total: 2,
        naoLidas: 1,
        vencidas: 0,
        proximasVencer: 2,
        ativas: 1,
      });
    });
  });

  // ========== TESTES DOS MÉTODOS PAGINADOS ==========

  describe('listarTodasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao, { ...mockNotificacao, id: '2' }],
      total: 25,
      hasMore: true,
      cursor: 'bmV4dEN1cnNvcg==',
    };

    it('deve retornar notificações paginadas com valores padrão', async () => {
      mockNotificacaoRepo.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarTodasPaginado();

      expect(mockNotificacaoRepo.findAllPaginated).toHaveBeenCalledWith(10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações paginadas com pageSize específico', async () => {
      mockNotificacaoRepo.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarTodasPaginado(20);

      expect(mockNotificacaoRepo.findAllPaginated).toHaveBeenCalledWith(20, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações paginadas com cursor', async () => {
      const responseComCursor = { ...mockPaginatedResponse, hasMore: false, cursor: undefined };
      mockNotificacaoRepo.findAllPaginated.mockResolvedValue(responseComCursor);

      const resultado = await service.listarTodasPaginado(10, 'abc123');

      expect(mockNotificacaoRepo.findAllPaginated).toHaveBeenCalledWith(10, 'abc123');
      expect(resultado.hasMore).toBe(false);
    });
  });

  describe('listarNaoLidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 10,
      hasMore: true,
      cursor: 'bmV4dEN1cnNvcg==',
    };

    it('deve retornar notificações não lidas paginadas', async () => {
      mockNotificacaoRepo.findNaoLidasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarNaoLidasPaginado();

      expect(mockNotificacaoRepo.findNaoLidasPaginated).toHaveBeenCalledWith(10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações não lidas paginadas com parâmetros', async () => {
      mockNotificacaoRepo.findNaoLidasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarNaoLidasPaginado(5, 'cursor123');

      expect(mockNotificacaoRepo.findNaoLidasPaginated).toHaveBeenCalledWith(5, 'cursor123');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarVencidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 5,
      hasMore: false,
      cursor: undefined,
    };

    it('deve retornar notificações vencidas paginadas', async () => {
      mockNotificacaoRepo.findVencidasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarVencidasPaginado();

      expect(mockNotificacaoRepo.findVencidasPaginated).toHaveBeenCalledWith(10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações vencidas paginadas com parâmetros', async () => {
      mockNotificacaoRepo.findVencidasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarVencidasPaginado(15, 'cursorXYZ');

      expect(mockNotificacaoRepo.findVencidasPaginated).toHaveBeenCalledWith(15, 'cursorXYZ');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarAtivasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao, { ...mockNotificacao, id: '2' }],
      total: 15,
      hasMore: true,
      cursor: 'YXRpdmFzQ3Vyc29y',
    };

    it('deve retornar notificações ativas paginadas com valores padrão', async () => {
      mockNotificacaoRepo.findAtivasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarAtivasPaginado();

      expect(mockNotificacaoRepo.findAtivasPaginated).toHaveBeenCalledWith(60, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações ativas paginadas com dias específico', async () => {
      mockNotificacaoRepo.findAtivasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarAtivasPaginado(30);

      expect(mockNotificacaoRepo.findAtivasPaginated).toHaveBeenCalledWith(30, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações ativas paginadas com todos os parâmetros', async () => {
      mockNotificacaoRepo.findAtivasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarAtivasPaginado(45, 20, 'myCursor');

      expect(mockNotificacaoRepo.findAtivasPaginated).toHaveBeenCalledWith(45, 20, 'myCursor');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarProximasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao, { ...mockNotificacao, id: '2' }],
      total: 22,
      hasMore: true,
      cursor: 'cHJveGltYXNDdXJzb3I=',
    };

    it('deve retornar notificações próximas paginadas com valores padrão', async () => {
      mockNotificacaoRepo.findProximasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarProximasPaginado();

      expect(mockNotificacaoRepo.findProximasPaginated).toHaveBeenCalledWith(30, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações próximas paginadas com dias específico', async () => {
      mockNotificacaoRepo.findProximasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarProximasPaginado(15);

      expect(mockNotificacaoRepo.findProximasPaginated).toHaveBeenCalledWith(15, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações próximas paginadas com todos os parâmetros', async () => {
      mockNotificacaoRepo.findProximasPaginated.mockResolvedValue(mockPaginatedResponse);

      const resultado = await service.listarProximasPaginado(30, 20, 'myCursor');

      expect(mockNotificacaoRepo.findProximasPaginated).toHaveBeenCalledWith(30, 20, 'myCursor');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });
});

describe('inicializarEventHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clear();
    (createNotificacaoRepository as jest.Mock).mockReturnValue({
      findById: jest.fn(),
      deleteByOrcamentoId: jest.fn().mockResolvedValue(2),
      exists: jest.fn(),
      createMany: jest.fn(),
    });
    (createOrcamentoRepository as jest.Mock).mockReturnValue({
      findById: jest.fn(),
    });
    (createPalavraChaveRepository as jest.Mock).mockReturnValue({
      findAtivas: jest.fn().mockResolvedValue([]),
    });
  });

  const mockOrcamento: Orcamento = {
    id: 'orc1',
    numero: 1,
    versao: 0,
    tipo: 'completo',
    clienteId: 'cli1',
    clienteNome: 'Cliente Teste',
    clienteCnpj: '12345678901234',
    status: 'aceito',
    dataEmissao: new Date('2025-01-01'),
    dataValidade: new Date('2025-02-01'),
    dataAceite: new Date('2025-01-15'),
    itensCompleto: [
      {
        etapa: 'comercial',
        categoriaId: 'cat1',
        categoriaNome: 'Extintores',
        descricao: 'Extintor ABC 6kg',
        quantidade: 10,
        unidade: 'UN',
        valorUnitarioMaoDeObra: 50,
        valorUnitarioMaterial: 50,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
    ],
    valorTotal: 1000,
    createdAt: new Date(),
  };

  it('deve registrar handler para STATUS_CHANGED', () => {
    inicializarEventHandlers();

    // Verificar que o handler foi registrado (o evento existe)
    expect(() => eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      tenantId: 'test-tenant-id',
      orcamentoId: 'test',
      statusAnterior: 'pendente',
      statusNovo: 'aceito',
    })).not.toThrow();
  });

  it('deve gerar notificações quando status muda para aceito', async () => {
    const mockOrcRepo = {
      findById: jest.fn().mockResolvedValue(mockOrcamento),
    };
    const mockPcRepo = {
      findAtivas: jest.fn().mockResolvedValue([]),
    };
    (createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcRepo);
    (createPalavraChaveRepository as jest.Mock).mockReturnValue(mockPcRepo);

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      tenantId: 'test-tenant-id',
      orcamentoId: 'orc1',
      statusAnterior: 'pendente',
      statusNovo: 'aceito',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockOrcRepo.findById).toHaveBeenCalledWith('orc1');
  });

  it('deve remover notificações quando status muda de aceito para outro', async () => {
    const mockNotifRepo = {
      findById: jest.fn(),
      deleteByOrcamentoId: jest.fn().mockResolvedValue(2),
      exists: jest.fn(),
      createMany: jest.fn(),
    };
    (createNotificacaoRepository as jest.Mock).mockReturnValue(mockNotifRepo);

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      tenantId: 'test-tenant-id',
      orcamentoId: 'orc1',
      statusAnterior: 'aceito',
      statusNovo: 'rejeitado',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockNotifRepo.deleteByOrcamentoId).toHaveBeenCalledWith('orc1');
  });

  it('deve não fazer nada quando status não envolve aceito', async () => {
    const mockOrcRepo = {
      findById: jest.fn(),
    };
    const mockNotifRepo = {
      findById: jest.fn(),
      deleteByOrcamentoId: jest.fn(),
      exists: jest.fn(),
      createMany: jest.fn(),
    };
    (createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcRepo);
    (createNotificacaoRepository as jest.Mock).mockReturnValue(mockNotifRepo);

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      tenantId: 'test-tenant-id',
      orcamentoId: 'orc1',
      statusAnterior: 'pendente',
      statusNovo: 'rejeitado',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockOrcRepo.findById).not.toHaveBeenCalled();
    expect(mockNotifRepo.deleteByOrcamentoId).not.toHaveBeenCalled();
  });

  it('deve capturar erro sem propagar quando handler falha', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockOrcRepo = {
      findById: jest.fn().mockRejectedValue(new Error('DB Error')),
    };
    (createOrcamentoRepository as jest.Mock).mockReturnValue(mockOrcRepo);

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      tenantId: 'test-tenant-id',
      orcamentoId: 'orc1',
      statusAnterior: 'pendente',
      statusNovo: 'aceito',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    // O logger formata a mensagem com timestamp e nível
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[NotificacaoService] Erro ao processar evento de mudança de status:')
    );

    consoleErrorSpy.mockRestore();
  });
});
