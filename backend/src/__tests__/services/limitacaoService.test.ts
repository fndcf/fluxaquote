import { createLimitacaoService } from '../../services/limitacaoService';
import { createLimitacaoRepository } from '../../repositories/limitacaoRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { Limitacao } from '../../models';

// Mock do repository
jest.mock('../../repositories/limitacaoRepository');

const mockRepo = {
  findAll: jest.fn(),
  findAtivas: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  findByTexto: jest.fn(),
  getNextOrdem: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
(createLimitacaoRepository as jest.Mock).mockReturnValue(mockRepo);

describe('limitacaoService', () => {
  let service: ReturnType<typeof createLimitacaoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (createLimitacaoRepository as jest.Mock).mockReturnValue(mockRepo);
    service = createLimitacaoService('test-tenant-id');
  });

  const mockLimitacao: Limitacao = {
    id: '1',
    texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de limitações', async () => {
      const limitacoes = [mockLimitacao, { ...mockLimitacao, id: '2', texto: 'Outra limitação de teste com texto suficiente' }];
      (mockRepo.findAll as jest.Mock).mockResolvedValue(limitacoes);

      const resultado = await service.listar();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(limitacoes);
    });

    it('deve retornar lista vazia quando não houver limitações', async () => {
      (mockRepo.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await service.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar apenas limitações ativas', async () => {
      const limitacoesAtivas = [mockLimitacao];
      (mockRepo.findAtivas as jest.Mock).mockResolvedValue(limitacoesAtivas);

      const resultado = await service.listarAtivas();

      expect(mockRepo.findAtivas).toHaveBeenCalled();
      expect(resultado).toEqual(limitacoesAtivas);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar limitação por ID', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);

      const resultado = await service.buscarPorId('1');

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockLimitacao);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(service.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando limitação não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.buscarPorId('inexistente')).rejects.toThrow('Limitação não encontrada');
    });
  });

  describe('buscarPorIds', () => {
    it('deve retornar limitações por IDs', async () => {
      const limitacoes = [mockLimitacao, { ...mockLimitacao, id: '2' }];
      (mockRepo.findByIds as jest.Mock).mockResolvedValue(limitacoes);

      const resultado = await service.buscarPorIds(['1', '2']);

      expect(mockRepo.findByIds).toHaveBeenCalledWith(['1', '2']);
      expect(resultado).toEqual(limitacoes);
    });

    it('deve retornar lista vazia quando nenhum ID for encontrado', async () => {
      (mockRepo.findByIds as jest.Mock).mockResolvedValue([]);

      const resultado = await service.buscarPorIds(['inexistente']);

      expect(resultado).toEqual([]);
    });
  });

  describe('criar', () => {
    it('deve criar limitação com sucesso', async () => {
      const dados = { texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres' };
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockLimitacao);

      const resultado = await service.criar(dados);

      expect(mockRepo.findByTexto).toHaveBeenCalledWith(dados.texto);
      expect(mockRepo.getNextOrdem).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalledWith({
        texto: dados.texto,
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockLimitacao);
    });

    it('deve criar limitação inativa quando especificado', async () => {
      const dados = { texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres', ativo: false };
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });

      await service.criar(dados);

      expect(mockRepo.create).toHaveBeenCalledWith({
        texto: dados.texto,
        ativo: false,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando texto for muito curto', async () => {
      await expect(service.criar({ texto: 'Curto' })).rejects.toThrow(ValidationError);
      await expect(service.criar({ texto: 'Curto' })).rejects.toThrow(
        'Texto deve ter pelo menos 20 caracteres'
      );
    });

    it('deve lançar ValidationError quando texto for vazio', async () => {
      await expect(service.criar({ texto: '' })).rejects.toThrow(ValidationError);
    });

    it('deve lançar AppError quando texto já existir', async () => {
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(mockLimitacao);

      await expect(
        service.criar({ texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres' })
      ).rejects.toThrow(AppError);
      await expect(
        service.criar({ texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres' })
      ).rejects.toThrow('Já existe uma limitação com este texto');
    });

    it('deve fazer trim do texto antes de salvar', async () => {
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue(mockLimitacao);

      await service.criar({ texto: '  Esta é uma limitação de teste com pelo menos 20 caracteres  ' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres',
        ativo: true,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando texto exceder 1000 caracteres', async () => {
      const textoGrande = 'a'.repeat(1001);

      await expect(service.criar({ texto: textoGrande })).rejects.toThrow(ValidationError);
      await expect(service.criar({ texto: textoGrande })).rejects.toThrow(
        'Texto deve ter no máximo 1000 caracteres'
      );
    });

    it('deve aceitar texto com exatamente 1000 caracteres', async () => {
      const textoExato = 'a'.repeat(1000);
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(null);
      (mockRepo.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (mockRepo.create as jest.Mock).mockResolvedValue({ ...mockLimitacao, texto: textoExato });

      const resultado = await service.criar({ texto: textoExato });

      expect(resultado).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar limitação com sucesso', async () => {
      const dados = { texto: 'Texto atualizado com caracteres suficientes para o teste' };
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ...dados });

      const resultado = await service.atualizar('1', dados);

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.update).toHaveBeenCalledWith('1', { texto: dados.texto });
      expect(resultado.texto).toBe(dados.texto);
    });

    it('deve atualizar apenas o status ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });

      await service.atualizar('1', { ativo: false });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve atualizar apenas a ordem', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ordem: 5 });

      await service.atualizar('1', { ordem: 5 });

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ordem: 5 });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.atualizar('', { texto: 'texto teste com mais de 20 caracteres' })).rejects.toThrow(
        ValidationError
      );
      await expect(service.atualizar('', { texto: 'texto teste com mais de 20 caracteres' })).rejects.toThrow(
        'ID é obrigatório'
      );
    });

    it('deve lançar NotFoundError quando limitação não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.atualizar('inexistente', { texto: 'texto teste com mais de 20 caracteres' })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ValidationError quando novo texto for muito curto', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);

      await expect(service.atualizar('1', { texto: 'curto' })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('1', { texto: 'curto' })).rejects.toThrow(
        'Texto deve ter pelo menos 20 caracteres'
      );
    });

    it('deve lançar AppError quando novo texto já existir em outra limitação', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue({
        ...mockLimitacao,
        id: '2',
        texto: 'Outro texto de limitação existente com caracteres suficientes',
      });

      await expect(
        service.atualizar('1', { texto: 'Outro texto de limitação existente com caracteres suficientes' })
      ).rejects.toThrow(AppError);
      await expect(
        service.atualizar('1', { texto: 'Outro texto de limitação existente com caracteres suficientes' })
      ).rejects.toThrow('Já existe uma limitação com este texto');
    });

    it('deve permitir atualizar mantendo o mesmo texto', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.update as jest.Mock).mockResolvedValue(mockLimitacao);

      await service.atualizar('1', { texto: mockLimitacao.texto });

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('1', { ativo: false })).rejects.toThrow('Erro ao atualizar limitação');
    });

    it('deve lançar ValidationError quando novo texto exceder 1000 caracteres', async () => {
      const textoGrande = 'a'.repeat(1001);
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);

      await expect(service.atualizar('1', { texto: textoGrande })).rejects.toThrow(ValidationError);
      await expect(service.atualizar('1', { texto: textoGrande })).rejects.toThrow(
        'Texto deve ter no máximo 1000 caracteres'
      );
    });

    it('deve aceitar atualização com texto de exatamente 1000 caracteres', async () => {
      const textoExato = 'a'.repeat(1000);
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.findByTexto as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, texto: textoExato });

      const resultado = await service.atualizar('1', { texto: textoExato });

      expect(resultado).toBeDefined();
      expect(mockRepo.update).toHaveBeenCalled();
    });
  });

  describe('excluir', () => {
    it('deve excluir limitação com sucesso', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      await expect(service.excluir('1')).resolves.not.toThrow();

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(service.excluir('')).rejects.toThrow(ValidationError);
      await expect(service.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando limitação não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.excluir('inexistente')).rejects.toThrow('Limitação não encontrada');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: true });

      const resultado = await service.toggleAtivo('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando limitação não existir', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
