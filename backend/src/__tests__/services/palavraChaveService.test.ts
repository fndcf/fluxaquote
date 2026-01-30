import { createPalavraChaveService } from '../../services/palavraChaveService';
import { createPalavraChaveRepository } from '../../repositories/palavraChaveRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { PalavraChave } from '../../models';

// Mock do repository
jest.mock('../../repositories/palavraChaveRepository');

const mockRepo = {
  findAll: jest.fn(),
  findAtivas: jest.fn(),
  findById: jest.fn(),
  findByPalavra: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
(createPalavraChaveRepository as jest.Mock).mockReturnValue(mockRepo);

describe('palavraChaveService', () => {
  let service: ReturnType<typeof createPalavraChaveService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createPalavraChaveRepository as jest.Mock).mockReturnValue(mockRepo);
    service = createPalavraChaveService('test-tenant-id');
  });

  const mockPalavraChave: PalavraChave = {
    id: '1',
    palavra: 'extintor',
    prazoDias: 345,
    ativo: true,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de palavras-chave', async () => {
      const palavras = [mockPalavraChave, { ...mockPalavraChave, id: '2', palavra: 'mangueira' }];
      (mockRepo.findAll as jest.Mock).mockResolvedValue(palavras);

      const resultado = await service.listar();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(palavras);
    });

    it('deve retornar lista vazia quando não houver palavras-chave', async () => {
      (mockRepo.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await service.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar apenas palavras-chave ativas', async () => {
      const palavrasAtivas = [mockPalavraChave];
      (mockRepo.findAtivas as jest.Mock).mockResolvedValue(palavrasAtivas);

      const resultado = await service.listarAtivas();

      expect(mockRepo.findAtivas).toHaveBeenCalled();
      expect(resultado).toEqual(palavrasAtivas);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar palavra-chave por ID', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      const resultado = await service.buscarPorId('1');

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockPalavraChave);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(service.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando palavra-chave não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.buscarPorId('inexistente')).rejects.toThrow(
        'Palavra-chave não encontrada'
      );
    });
  });

  describe('criar', () => {
    it('deve criar palavra-chave com sucesso', async () => {
      const dados = { palavra: 'extintor', prazoDias: 345 };
      (mockRepo.findByPalavra as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockPalavraChave);

      const resultado = await service.criar(dados);

      expect(mockRepo.findByPalavra).toHaveBeenCalledWith('extintor');
      expect(mockRepo.create).toHaveBeenCalledWith({
        palavra: 'extintor',
        prazoDias: 345,
        ativo: true,
      });
      expect(resultado).toEqual(mockPalavraChave);
    });

    it('deve criar palavra-chave inativa quando especificado', async () => {
      const dados = { palavra: 'extintor', prazoDias: 345, ativo: false };
      (mockRepo.findByPalavra as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await service.criar(dados);

      expect(mockRepo.create).toHaveBeenCalledWith({
        palavra: 'extintor',
        prazoDias: 345,
        ativo: false,
      });
    });

    it('deve lançar ValidationError quando palavra for muito curta', async () => {
      await expect(service.criar({ palavra: 'a', prazoDias: 345 })).rejects.toThrow(
        ValidationError
      );
      await expect(service.criar({ palavra: 'a', prazoDias: 345 })).rejects.toThrow(
        'Palavra-chave deve ter pelo menos 2 caracteres'
      );
    });

    it('deve lançar ValidationError quando palavra for vazia', async () => {
      await expect(service.criar({ palavra: '', prazoDias: 345 })).rejects.toThrow(
        ValidationError
      );
    });

    it('deve lançar ValidationError quando prazo for menor que 1', async () => {
      await expect(service.criar({ palavra: 'extintor', prazoDias: 0 })).rejects.toThrow(
        ValidationError
      );
      await expect(service.criar({ palavra: 'extintor', prazoDias: 0 })).rejects.toThrow(
        'Prazo deve ser de pelo menos 1 dia'
      );
    });

    it('deve lançar ValidationError quando prazo for maior que 3650 dias', async () => {
      await expect(
        service.criar({ palavra: 'extintor', prazoDias: 3651 })
      ).rejects.toThrow(ValidationError);
      await expect(
        service.criar({ palavra: 'extintor', prazoDias: 3651 })
      ).rejects.toThrow('Prazo não pode ser maior que 10 anos (3650 dias)');
    });

    it('deve lançar AppError quando palavra já existir', async () => {
      (mockRepo.findByPalavra as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(service.criar({ palavra: 'extintor', prazoDias: 345 })).rejects.toThrow(
        AppError
      );
      await expect(service.criar({ palavra: 'extintor', prazoDias: 345 })).rejects.toThrow(
        'Já existe uma palavra-chave com este termo'
      );
    });

    it('deve fazer trim da palavra antes de salvar', async () => {
      (mockRepo.findByPalavra as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockPalavraChave);

      await service.criar({ palavra: '  extintor  ', prazoDias: 345 });

      expect(mockRepo.create).toHaveBeenCalledWith({
        palavra: 'extintor',
        prazoDias: 345,
        ativo: true,
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar palavra-chave com sucesso', async () => {
      const dados = { palavra: 'extintor atualizado', prazoDias: 400 };
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.findByPalavra as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ...dados,
      });

      const resultado = await service.atualizar('1', dados);

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.update).toHaveBeenCalledWith('1', {
        palavra: 'extintor atualizado',
        prazoDias: 400,
      });
      expect(resultado.palavra).toBe('extintor atualizado');
    });

    it('deve atualizar apenas o prazo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        prazoDias: 400,
      });

      await service.atualizar('1', { prazoDias: 400 });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { prazoDias: 400 });
    });

    it('deve atualizar apenas o status ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await service.atualizar('1', { ativo: false });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.atualizar('', { palavra: 'teste' })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar('', { palavra: 'teste' })).rejects.toThrow(
        'ID é obrigatório'
      );
    });

    it('deve lançar NotFoundError quando palavra-chave não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.atualizar('inexistente', { palavra: 'teste' })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ValidationError quando nova palavra for muito curta', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(service.atualizar('1', { palavra: 'a' })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar('1', { palavra: 'a' })).rejects.toThrow(
        'Palavra-chave deve ter pelo menos 2 caracteres'
      );
    });

    it('deve lançar AppError quando nova palavra já existir em outro registro', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.findByPalavra as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        id: '2',
        palavra: 'mangueira',
      });

      await expect(service.atualizar('1', { palavra: 'mangueira' })).rejects.toThrow(
        AppError
      );
      await expect(service.atualizar('1', { palavra: 'mangueira' })).rejects.toThrow(
        'Já existe uma palavra-chave com este termo'
      );
    });

    it('deve permitir atualizar para a mesma palavra (case insensitive)', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        palavra: 'EXTINTOR',
      });

      await service.atualizar('1', { palavra: 'EXTINTOR' });

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('deve lançar ValidationError quando novo prazo for menor que 1', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(service.atualizar('1', { prazoDias: 0 })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar('1', { prazoDias: 0 })).rejects.toThrow(
        'Prazo deve ser de pelo menos 1 dia'
      );
    });

    it('deve lançar ValidationError quando novo prazo for maior que 3650', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(service.atualizar('1', { prazoDias: 4000 })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar('1', { prazoDias: 4000 })).rejects.toThrow(
        'Prazo não pode ser maior que 10 anos (3650 dias)'
      );
    });

    it('deve lançar AppError quando update retornar null', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('1', { prazoDias: 400 })).rejects.toThrow(
        AppError
      );
      await expect(service.atualizar('1', { prazoDias: 400 })).rejects.toThrow(
        'Erro ao atualizar palavra-chave'
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir palavra-chave com sucesso', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      await expect(service.excluir('1')).resolves.not.toThrow();

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.excluir('')).rejects.toThrow(ValidationError);
      await expect(service.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando palavra-chave não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.excluir('inexistente')).rejects.toThrow(
        'Palavra-chave não encontrada'
      );
    });

    it('deve lançar AppError quando delete retornar false', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.delete as jest.Mock).mockResolvedValue(false);

      await expect(service.excluir('1')).rejects.toThrow(AppError);
      await expect(service.excluir('1')).rejects.toThrow(
        'Erro ao excluir palavra-chave'
      );
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (mockRepo.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });
      (mockRepo.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: true,
      });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando palavra-chave não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
