import { createServicoService } from '../../services/servicoService';
import { createServicoRepository } from '../../repositories/servicoRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { Servico } from '../../models';

// Mock do repository
jest.mock('../../repositories/servicoRepository');

const mockRepo = {
  findAll: jest.fn(),
  findAtivos: jest.fn(),
  findById: jest.fn(),
  findByDescricao: jest.fn(),
  getNextOrdem: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
(createServicoRepository as jest.Mock).mockReturnValue(mockRepo);

describe('servicoService', () => {
  let service: ReturnType<typeof createServicoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createServicoRepository as jest.Mock).mockReturnValue(mockRepo);
    service = createServicoService('test-tenant-id');
  });

  const mockServico: Servico = {
    id: '1',
    descricao: 'Assessoria e fornecimento de equipamentos de incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de serviços', async () => {
      const servicos = [mockServico, { ...mockServico, id: '2', descricao: 'Manutenção de extintores' }];
      (mockRepo.findAll as jest.Mock).mockResolvedValue(servicos);

      const resultado = await service.listar();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(servicos);
    });

    it('deve retornar lista vazia quando não houver serviços', async () => {
      (mockRepo.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await service.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivos', () => {
    it('deve retornar apenas serviços ativos', async () => {
      const servicosAtivos = [mockServico];
      (mockRepo.findAtivos as jest.Mock).mockResolvedValue(servicosAtivos);

      const resultado = await service.listarAtivos();

      expect(mockRepo.findAtivos).toHaveBeenCalled();
      expect(resultado).toEqual(servicosAtivos);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar serviço por ID', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);

      const resultado = await service.buscarPorId('1');

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockServico);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(service.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando serviço não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.buscarPorId('inexistente')).rejects.toThrow('Serviço não encontrado');
    });
  });

  describe('criar', () => {
    it('deve criar serviço com sucesso', async () => {
      const dados = { descricao: 'Assessoria e fornecimento de equipamentos de incêndio' };
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockServico);

      const resultado = await service.criar(dados);

      expect(mockRepo.findByDescricao).toHaveBeenCalledWith(dados.descricao);
      expect(mockRepo.getNextOrdem).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalledWith({
        descricao: dados.descricao,
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockServico);
    });

    it('deve criar serviço inativo quando especificado', async () => {
      const dados = { descricao: 'Assessoria e fornecimento de equipamentos de incêndio', ativo: false };
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });

      await service.criar(dados);

      expect(mockRepo.create).toHaveBeenCalledWith({
        descricao: dados.descricao,
        ativo: false,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando descrição for muito curta', async () => {
      await expect(service.criar({ descricao: 'Teste' })).rejects.toThrow(ValidationError);
      await expect(service.criar({ descricao: 'Teste' })).rejects.toThrow(
        'Descrição deve ter pelo menos 10 caracteres'
      );
    });

    it('deve lançar ValidationError quando descrição for vazia', async () => {
      await expect(service.criar({ descricao: '' })).rejects.toThrow(ValidationError);
    });

    it('deve lançar AppError quando descrição já existir', async () => {
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue(mockServico);

      await expect(
        service.criar({ descricao: 'Assessoria e fornecimento de equipamentos de incêndio' })
      ).rejects.toThrow(AppError);
      await expect(
        service.criar({ descricao: 'Assessoria e fornecimento de equipamentos de incêndio' })
      ).rejects.toThrow('Já existe um serviço com esta descrição');
    });

    it('deve fazer trim da descrição antes de salvar', async () => {
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockServico);

      await service.criar({ descricao: '  Assessoria e fornecimento de equipamentos  ' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        descricao: 'Assessoria e fornecimento de equipamentos',
        ativo: true,
        ordem: 1,
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar serviço com sucesso', async () => {
      const dados = { descricao: 'Descrição atualizada com mais caracteres' };
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockServico, ...dados });

      const resultado = await service.atualizar('1', dados);

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.update).toHaveBeenCalledWith('1', { descricao: dados.descricao });
      expect(resultado.descricao).toBe(dados.descricao);
    });

    it('deve atualizar apenas o status ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });

      await service.atualizar('1', { ativo: false });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve atualizar apenas a ordem', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockServico, ordem: 5 });

      await service.atualizar('1', { ordem: 5 });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ordem: 5 });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.atualizar('', { descricao: 'teste teste teste' })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar('', { descricao: 'teste teste teste' })).rejects.toThrow(
        'ID é obrigatório'
      );
    });

    it('deve lançar NotFoundError quando serviço não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('inexistente', { descricao: 'teste teste teste' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('deve lançar ValidationError quando nova descrição for muito curta', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);

      await expect(service.atualizar('1', { descricao: 'curta' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('1', { descricao: 'curta' })).rejects.toThrow(
        'Descrição deve ter pelo menos 10 caracteres'
      );
    });

    it('deve lançar AppError quando nova descrição já existir em outro registro', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue({
        ...mockServico,
        id: '2',
        descricao: 'Outra descrição de serviço existente',
      });

      await expect(
        service.atualizar('1', { descricao: 'Outra descrição de serviço existente' })
      ).rejects.toThrow(AppError);
      await expect(
        service.atualizar('1', { descricao: 'Outra descrição de serviço existente' })
      ).rejects.toThrow('Já existe um serviço com esta descrição');
    });

    it('deve permitir atualizar mantendo a mesma descrição', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.findByDescricao as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.update as jest.Mock).mockResolvedValue(mockServico);

      await service.atualizar('1', { descricao: mockServico.descricao });

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('1', { ativo: false })).rejects.toThrow('Erro ao atualizar serviço');
    });
  });

  describe('excluir', () => {
    it('deve excluir serviço com sucesso', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      await expect(service.excluir('1')).resolves.not.toThrow();

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.excluir('')).rejects.toThrow(ValidationError);
      await expect(service.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando serviço não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.excluir('inexistente')).rejects.toThrow('Serviço não encontrado');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockServico);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockServico, ativo: true });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando serviço não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
