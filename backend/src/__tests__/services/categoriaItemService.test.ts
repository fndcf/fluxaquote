import { createCategoriaItemService } from '../../services/categoriaItemService';
import { createCategoriaItemRepository } from '../../repositories/categoriaItemRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { CategoriaItem } from '../../models';

// Mock do repository
jest.mock('../../repositories/categoriaItemRepository');

const mockRepo = {
  findAll: jest.fn(),
  findAtivas: jest.fn(),
  findById: jest.fn(),
  findByNome: jest.fn(),
  getNextOrdem: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
(createCategoriaItemRepository as jest.Mock).mockReturnValue(mockRepo);

describe('categoriaItemService', () => {
  let service: ReturnType<typeof createCategoriaItemService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createCategoriaItemRepository as jest.Mock).mockReturnValue(mockRepo);
    service = createCategoriaItemService('test-tenant-id');
  });

  const mockCategoria: CategoriaItem = {
    id: '1',
    nome: 'Bomba de Incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de categorias', async () => {
      const categorias = [mockCategoria, { ...mockCategoria, id: '2', nome: 'Sistema de Hidrantes' }];
      (mockRepo.findAll as jest.Mock).mockResolvedValue(categorias);

      const resultado = await service.listar();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(categorias);
    });

    it('deve retornar lista vazia quando não houver categorias', async () => {
      (mockRepo.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await service.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar apenas categorias ativas', async () => {
      const categoriasAtivas = [mockCategoria];
      (mockRepo.findAtivas as jest.Mock).mockResolvedValue(categoriasAtivas);

      const resultado = await service.listarAtivas();

      expect(mockRepo.findAtivas).toHaveBeenCalled();
      expect(resultado).toEqual(categoriasAtivas);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar categoria por ID', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);

      const resultado = await service.buscarPorId('1');

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockCategoria);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(service.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.buscarPorId('inexistente')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('criar', () => {
    it('deve criar categoria com sucesso', async () => {
      const dados = { nome: 'Bomba de Incêndio' };
      (mockRepo.findByNome as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockCategoria);

      const resultado = await service.criar(dados);

      expect(mockRepo.findByNome).toHaveBeenCalledWith(dados.nome);
      expect(mockRepo.getNextOrdem).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalledWith({
        nome: dados.nome,
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockCategoria);
    });

    it('deve criar categoria inativa quando especificado', async () => {
      const dados = { nome: 'Bomba de Incêndio', ativo: false };
      (mockRepo.findByNome as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });

      await service.criar(dados);

      expect(mockRepo.create).toHaveBeenCalledWith({
        nome: dados.nome,
        ativo: false,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando nome for muito curto', async () => {
      await expect(service.criar({ nome: 'AB' })).rejects.toThrow(ValidationError);
      await expect(service.criar({ nome: 'AB' })).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    it('deve lançar ValidationError quando nome for vazio', async () => {
      await expect(service.criar({ nome: '' })).rejects.toThrow(ValidationError);
    });

    it('deve lançar AppError quando nome já existir', async () => {
      (mockRepo.findByNome as jest.Mock).mockResolvedValue(mockCategoria);

      await expect(service.criar({ nome: 'Bomba de Incêndio' })).rejects.toThrow(AppError);
      await expect(service.criar({ nome: 'Bomba de Incêndio' })).rejects.toThrow(
        'Já existe uma categoria com este nome'
      );
    });

    it('deve fazer trim do nome antes de salvar', async () => {
      (mockRepo.findByNome as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockCategoria);

      await service.criar({ nome: '  Bomba de Incêndio  ' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        nome: 'Bomba de Incêndio',
        ativo: true,
        ordem: 1,
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar categoria com sucesso', async () => {
      const dados = { nome: 'Bomba Atualizada' };
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.findByNome as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ...dados });

      const resultado = await service.atualizar('1', dados);

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.update).toHaveBeenCalledWith('1', { nome: dados.nome });
      expect(resultado.nome).toBe(dados.nome);
    });

    it('deve atualizar apenas o status ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });

      await service.atualizar('1', { ativo: false });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve atualizar apenas a ordem', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ordem: 5 });

      await service.atualizar('1', { ordem: 5 });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ordem: 5 });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.atualizar('', { nome: 'Teste' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('', { nome: 'Teste' })).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('inexistente', { nome: 'Teste' })).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ValidationError quando novo nome for muito curto', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);

      await expect(service.atualizar('1', { nome: 'AB' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('1', { nome: 'AB' })).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    it('deve lançar AppError quando novo nome já existir em outra categoria', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.findByNome as jest.Mock).mockResolvedValue({
        ...mockCategoria,
        id: '2',
        nome: 'Outra Categoria',
      });

      await expect(service.atualizar('1', { nome: 'Outra Categoria' })).rejects.toThrow(AppError);
      await expect(service.atualizar('1', { nome: 'Outra Categoria' })).rejects.toThrow(
        'Já existe uma categoria com este nome'
      );
    });

    it('deve permitir atualizar mantendo o mesmo nome', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.findByNome as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.update as jest.Mock).mockResolvedValue(mockCategoria);

      await service.atualizar('1', { nome: mockCategoria.nome });

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('1', { ativo: false })).rejects.toThrow(
        'Erro ao atualizar categoria'
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir categoria com sucesso', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      await expect(service.excluir('1')).resolves.not.toThrow();

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.excluir('')).rejects.toThrow(ValidationError);
      await expect(service.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.excluir('inexistente')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: true });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando categoria não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
