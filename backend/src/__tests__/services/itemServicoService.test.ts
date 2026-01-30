import { createItemServicoService } from '../../services/itemServicoService';
import { createItemServicoRepository } from '../../repositories/itemServicoRepository';
import { createCategoriaItemRepository } from '../../repositories/categoriaItemRepository';
import { createHistoricoValoresRepository } from '../../repositories/historicoValoresRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { ItemServico, CategoriaItem } from '../../models';

// Mock dos repositories
jest.mock('../../repositories/itemServicoRepository');
jest.mock('../../repositories/categoriaItemRepository');
jest.mock('../../repositories/historicoValoresRepository');

const mockItemServicoRepo = {
  findAll: jest.fn(),
  findByCategoria: jest.fn(),
  findAtivosByCategoria: jest.fn(),
  findById: jest.fn(),
  findByDescricaoInCategoria: jest.fn(),
  getNextOrdem: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAtivosByCategoriaPaginado: jest.fn(),
  findByCategoriaPaginado: jest.fn(),
};

const mockCategoriaItemRepo = {
  findById: jest.fn(),
};

const mockHistoricoValoresRepo = {
  salvarHistoricoItem: jest.fn().mockResolvedValue(undefined),
};

(createItemServicoRepository as jest.Mock).mockReturnValue(mockItemServicoRepo);
(createCategoriaItemRepository as jest.Mock).mockReturnValue(mockCategoriaItemRepo);
(createHistoricoValoresRepository as jest.Mock).mockReturnValue(mockHistoricoValoresRepo);

describe('itemServicoService', () => {
  let service: ReturnType<typeof createItemServicoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createItemServicoRepository as jest.Mock).mockReturnValue(mockItemServicoRepo);
    (createCategoriaItemRepository as jest.Mock).mockReturnValue(mockCategoriaItemRepo);
    (createHistoricoValoresRepository as jest.Mock).mockReturnValue(mockHistoricoValoresRepo);
    mockHistoricoValoresRepo.salvarHistoricoItem.mockResolvedValue(undefined);
    service = createItemServicoService('test-tenant-id');
  });

  const mockCategoria: CategoriaItem = {
    id: 'cat1',
    nome: 'Bomba de Incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  const mockItemServico: ItemServico = {
    id: '1',
    categoriaId: 'cat1',
    descricao: 'Fornecimento e instalação de bomba centrífuga',
    unidade: 'UN',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de itens de serviço', async () => {
      const itens = [mockItemServico, { ...mockItemServico, id: '2', descricao: 'Outro item de serviço' }];
      mockItemServicoRepo.findAll.mockResolvedValue(itens);

      const resultado = await service.listar();

      expect(mockItemServicoRepo.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(itens);
    });
  });

  describe('listarPorCategoria', () => {
    it('deve retornar itens de uma categoria específica', async () => {
      const itens = [mockItemServico];
      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByCategoria.mockResolvedValue(itens);

      const resultado = await service.listarPorCategoria('cat1');

      expect(mockCategoriaItemRepo.findById).toHaveBeenCalledWith('cat1');
      expect(mockItemServicoRepo.findByCategoria).toHaveBeenCalledWith('cat1');
      expect(resultado).toEqual(itens);
    });

    it('deve lançar ValidationError quando categoriaId não for fornecido', async () => {
      await expect(service.listarPorCategoria('')).rejects.toThrow(ValidationError);
      await expect(service.listarPorCategoria('')).rejects.toThrow('ID da categoria é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      mockCategoriaItemRepo.findById.mockResolvedValue(null);

      await expect(service.listarPorCategoria('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.listarPorCategoria('inexistente')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('listarAtivosPorCategoria', () => {
    it('deve retornar apenas itens ativos de uma categoria', async () => {
      const itensAtivos = [mockItemServico];
      mockItemServicoRepo.findAtivosByCategoria.mockResolvedValue(itensAtivos);

      const resultado = await service.listarAtivosPorCategoria('cat1');

      expect(mockItemServicoRepo.findAtivosByCategoria).toHaveBeenCalledWith('cat1');
      expect(resultado).toEqual(itensAtivos);
    });

    it('deve lançar ValidationError quando categoriaId não for fornecido', async () => {
      await expect(service.listarAtivosPorCategoria('')).rejects.toThrow(ValidationError);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar item por ID', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);

      const resultado = await service.buscarPorId('1');

      expect(mockItemServicoRepo.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockItemServico);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(service.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando item não existir', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.buscarPorId('inexistente')).rejects.toThrow('Item de serviço não encontrado');
    });
  });

  describe('criar', () => {
    it('deve criar item de serviço com sucesso', async () => {
      const dados = { categoriaId: 'cat1', descricao: 'Fornecimento e instalação de bomba centrífuga', unidade: 'un' };
      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(null);
      mockItemServicoRepo.getNextOrdem.mockResolvedValue(1);
      mockItemServicoRepo.create.mockResolvedValue(mockItemServico);

      const resultado = await service.criar(dados);

      expect(mockCategoriaItemRepo.findById).toHaveBeenCalledWith('cat1');
      expect(mockItemServicoRepo.findByDescricaoInCategoria).toHaveBeenCalledWith(dados.descricao, 'cat1');
      expect(mockItemServicoRepo.create).toHaveBeenCalledWith({
        categoriaId: 'cat1',
        descricao: dados.descricao,
        unidade: 'UN',
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockItemServico);
    });

    it('deve criar item inativo quando especificado', async () => {
      const dados = { categoriaId: 'cat1', descricao: 'Fornecimento e instalação', unidade: 'UN', ativo: false };
      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(null);
      mockItemServicoRepo.getNextOrdem.mockResolvedValue(1);
      mockItemServicoRepo.create.mockResolvedValue({ ...mockItemServico, ativo: false });

      await service.criar(dados);

      expect(mockItemServicoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ativo: false })
      );
    });

    it('deve lançar ValidationError quando categoriaId não for fornecido', async () => {
      await expect(
        service.criar({ categoriaId: '', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow(ValidationError);
      await expect(
        service.criar({ categoriaId: '', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow('ID da categoria é obrigatório');
    });

    it('deve lançar ValidationError quando descrição for muito curta', async () => {
      await expect(
        service.criar({ categoriaId: 'cat1', descricao: 'ABC', unidade: 'UN' })
      ).rejects.toThrow(ValidationError);
      await expect(
        service.criar({ categoriaId: 'cat1', descricao: 'ABC', unidade: 'UN' })
      ).rejects.toThrow('Descrição deve ter pelo menos 5 caracteres');
    });

    it('deve lançar ValidationError quando unidade for vazia', async () => {
      await expect(
        service.criar({ categoriaId: 'cat1', descricao: 'Descrição válida', unidade: '' })
      ).rejects.toThrow(ValidationError);
      await expect(
        service.criar({ categoriaId: 'cat1', descricao: 'Descrição válida', unidade: '' })
      ).rejects.toThrow('Unidade é obrigatória');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      mockCategoriaItemRepo.findById.mockResolvedValue(null);

      await expect(
        service.criar({ categoriaId: 'inexistente', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.criar({ categoriaId: 'inexistente', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow('Categoria não encontrada');
    });

    it('deve lançar AppError quando descrição já existir na categoria', async () => {
      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(mockItemServico);

      await expect(
        service.criar({ categoriaId: 'cat1', descricao: 'Fornecimento e instalação de bomba centrífuga', unidade: 'UN' })
      ).rejects.toThrow(AppError);
      await expect(
        service.criar({ categoriaId: 'cat1', descricao: 'Fornecimento e instalação de bomba centrífuga', unidade: 'UN' })
      ).rejects.toThrow('Já existe um item com esta descrição nesta categoria');
    });

    it('deve converter unidade para maiúsculas', async () => {
      const dados = { categoriaId: 'cat1', descricao: 'Descrição de teste válida', unidade: 'un' };
      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(null);
      mockItemServicoRepo.getNextOrdem.mockResolvedValue(1);
      mockItemServicoRepo.create.mockResolvedValue(mockItemServico);

      await service.criar(dados);

      expect(mockItemServicoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ unidade: 'UN' })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar item com sucesso', async () => {
      const dados = { descricao: 'Descrição atualizada do item' };
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(null);
      mockItemServicoRepo.update.mockResolvedValue({ ...mockItemServico, ...dados });

      const resultado = await service.atualizar('1', dados);

      expect(mockItemServicoRepo.findById).toHaveBeenCalledWith('1');
      expect(mockItemServicoRepo.update).toHaveBeenCalledWith('1', { descricao: dados.descricao });
      expect(resultado.descricao).toBe(dados.descricao);
    });

    it('deve atualizar apenas a unidade', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.update.mockResolvedValue({ ...mockItemServico, unidade: 'M2' });

      await service.atualizar('1', { unidade: 'm2' });

      expect(mockItemServicoRepo.update).toHaveBeenCalledWith('1', { unidade: 'M2' });
    });

    it('deve atualizar apenas o status ativo', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.update.mockResolvedValue({ ...mockItemServico, ativo: false });

      await service.atualizar('1', { ativo: false });

      expect(mockItemServicoRepo.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.atualizar('', { descricao: 'Teste válido' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('', { descricao: 'Teste válido' })).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando item não existir', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(null);

      await expect(service.atualizar('inexistente', { descricao: 'Teste válido' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('deve lançar ValidationError quando nova descrição for muito curta', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);

      await expect(service.atualizar('1', { descricao: 'ABC' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('1', { descricao: 'ABC' })).rejects.toThrow(
        'Descrição deve ter pelo menos 5 caracteres'
      );
    });

    it('deve lançar ValidationError quando nova unidade for vazia', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);

      await expect(service.atualizar('1', { unidade: '' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('1', { unidade: '' })).rejects.toThrow('Unidade é obrigatória');
    });

    it('deve lançar AppError quando nova descrição já existir em outro item da categoria', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue({
        ...mockItemServico,
        id: '2',
        descricao: 'Outro item existente',
      });

      await expect(service.atualizar('1', { descricao: 'Outro item existente' })).rejects.toThrow(AppError);
      await expect(service.atualizar('1', { descricao: 'Outro item existente' })).rejects.toThrow(
        'Já existe um item com esta descrição nesta categoria'
      );
    });

    it('deve permitir atualizar mantendo a mesma descrição', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.update.mockResolvedValue(mockItemServico);

      await service.atualizar('1', { descricao: mockItemServico.descricao });

      expect(mockItemServicoRepo.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.update.mockResolvedValue(null);

      await expect(service.atualizar('1', { ativo: false })).rejects.toThrow(
        'Erro ao atualizar item de serviço'
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir item com sucesso', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.delete.mockResolvedValue(true);

      await expect(service.excluir('1')).resolves.not.toThrow();

      expect(mockItemServicoRepo.findById).toHaveBeenCalledWith('1');
      expect(mockItemServicoRepo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.excluir('')).rejects.toThrow(ValidationError);
      await expect(service.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando item não existir', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(null);

      await expect(service.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.excluir('inexistente')).rejects.toThrow('Item de serviço não encontrado');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(mockItemServico);
      mockItemServicoRepo.update.mockResolvedValue({ ...mockItemServico, ativo: false });

      const resultado = await service.toggleAtivo('1');

      expect(mockItemServicoRepo.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      mockItemServicoRepo.findById.mockResolvedValue({ ...mockItemServico, ativo: false });
      mockItemServicoRepo.update.mockResolvedValue({ ...mockItemServico, ativo: true });

      const resultado = await service.toggleAtivo('1');

      expect(mockItemServicoRepo.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando item não existir', async () => {
      mockItemServicoRepo.findById.mockResolvedValue(null);

      await expect(service.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });

  describe('listarAtivosPorCategoriaPaginado', () => {
    it('deve retornar itens ativos paginados de uma categoria', async () => {
      const mockResult = {
        itens: [mockItemServico],
        nextCursor: 'cursor123',
        hasMore: true,
        total: 10,
      };
      mockItemServicoRepo.findAtivosByCategoriaPaginado.mockResolvedValue(mockResult);

      const resultado = await service.listarAtivosPorCategoriaPaginado('cat1', 10, undefined, undefined);

      expect(mockItemServicoRepo.findAtivosByCategoriaPaginado).toHaveBeenCalledWith('cat1', 10, undefined, undefined);
      expect(resultado).toEqual(mockResult);
    });

    it('deve lançar erro quando categoriaId não for fornecido', async () => {
      await expect(service.listarAtivosPorCategoriaPaginado('', 10)).rejects.toThrow(ValidationError);
    });
  });

  describe('listarPorCategoriaPaginado', () => {
    it('deve retornar itens paginados de uma categoria', async () => {
      const mockResult = {
        itens: [mockItemServico],
        nextCursor: 'cursor123',
        hasMore: true,
        total: 10,
      };
      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByCategoriaPaginado.mockResolvedValue(mockResult);

      const resultado = await service.listarPorCategoriaPaginado('cat1', 10, undefined, 'busca');

      expect(mockCategoriaItemRepo.findById).toHaveBeenCalledWith('cat1');
      expect(mockItemServicoRepo.findByCategoriaPaginado).toHaveBeenCalledWith('cat1', 10, undefined, 'busca');
      expect(resultado).toEqual(mockResult);
    });

    it('deve lançar erro quando categoriaId não for fornecido', async () => {
      await expect(service.listarPorCategoriaPaginado('', 10)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro quando categoria não existir', async () => {
      mockCategoriaItemRepo.findById.mockResolvedValue(null);

      await expect(service.listarPorCategoriaPaginado('cat-inexistente', 10)).rejects.toThrow(NotFoundError);
    });
  });

  describe('criar com histórico', () => {
    it('deve salvar histórico ao criar item com valores', async () => {
      const novoItem = {
        categoriaId: 'cat1',
        descricao: 'Novo item com valores',
        unidade: 'UN',
        valorUnitario: 100,
        valorMaoDeObraUnitario: 50,
        valorCusto: 80,
        valorMaoDeObraCusto: 40,
      };
      const itemCriado = { ...mockItemServico, ...novoItem };

      mockCategoriaItemRepo.findById.mockResolvedValue(mockCategoria);
      mockItemServicoRepo.findByDescricaoInCategoria.mockResolvedValue(null);
      mockItemServicoRepo.getNextOrdem.mockResolvedValue(1);
      mockItemServicoRepo.create.mockResolvedValue(itemCriado);

      await service.criar(novoItem);

      expect(mockHistoricoValoresRepo.salvarHistoricoItem).toHaveBeenCalledWith(
        expect.objectContaining({
          itemServicoId: itemCriado.id,
          descricao: itemCriado.descricao,
          valorUnitario: 100,
          valorMaoDeObraUnitario: 50,
          valorCusto: 80,
          valorMaoDeObraCusto: 40,
        })
      );
    });
  });

  describe('atualizar com histórico', () => {
    it('deve salvar histórico ao atualizar valores', async () => {
      const itemExistente = {
        ...mockItemServico,
        valorUnitario: 100,
        valorMaoDeObraUnitario: 50,
      };
      const itemAtualizado = {
        ...itemExistente,
        valorUnitario: 150,
        valorMaoDeObraUnitario: 75,
      };

      mockItemServicoRepo.findById.mockResolvedValue(itemExistente);
      mockItemServicoRepo.update.mockResolvedValue(itemAtualizado);

      await service.atualizar('1', { valorUnitario: 150, valorMaoDeObraUnitario: 75 });

      expect(mockHistoricoValoresRepo.salvarHistoricoItem).toHaveBeenCalledWith(
        expect.objectContaining({
          itemServicoId: '1',
          valorUnitario: 150,
          valorMaoDeObraUnitario: 75,
        })
      );
    });

    it('deve salvar histórico ao atualizar valorCusto', async () => {
      const itemExistente = {
        ...mockItemServico,
        valorCusto: 80,
      };
      const itemAtualizado = {
        ...itemExistente,
        valorCusto: 100,
      };

      mockItemServicoRepo.findById.mockResolvedValue(itemExistente);
      mockItemServicoRepo.update.mockResolvedValue(itemAtualizado);

      await service.atualizar('1', { valorCusto: 100 });

      expect(mockHistoricoValoresRepo.salvarHistoricoItem).toHaveBeenCalled();
    });

    it('deve salvar histórico ao atualizar valorMaoDeObraCusto', async () => {
      const itemExistente = {
        ...mockItemServico,
        valorMaoDeObraCusto: 40,
      };
      const itemAtualizado = {
        ...itemExistente,
        valorMaoDeObraCusto: 60,
      };

      mockItemServicoRepo.findById.mockResolvedValue(itemExistente);
      mockItemServicoRepo.update.mockResolvedValue(itemAtualizado);

      await service.atualizar('1', { valorMaoDeObraCusto: 60 });

      expect(mockHistoricoValoresRepo.salvarHistoricoItem).toHaveBeenCalled();
    });

    it('não deve salvar histórico quando valores não mudaram', async () => {
      mockHistoricoValoresRepo.salvarHistoricoItem.mockClear();

      const itemExistente = {
        ...mockItemServico,
        valorUnitario: 100,
      };

      mockItemServicoRepo.findById.mockResolvedValue(itemExistente);
      mockItemServicoRepo.update.mockResolvedValue(itemExistente);

      // Atualizar apenas a descrição, não os valores
      await service.atualizar('1', { descricao: 'Nova descrição' });

      expect(mockHistoricoValoresRepo.salvarHistoricoItem).not.toHaveBeenCalled();
    });
  });
});
