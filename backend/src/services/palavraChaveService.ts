import { createPalavraChaveRepository } from '../repositories/palavraChaveRepository';
import { PalavraChave } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export function createPalavraChaveService(tenantId: string) {
  const palavraChaveRepo = createPalavraChaveRepository(tenantId);

  const listar = async (): Promise<PalavraChave[]> => {
    return palavraChaveRepo.findAll();
  };

  const listarAtivas = async (): Promise<PalavraChave[]> => {
    return palavraChaveRepo.findAtivas();
  };

  const buscarPorId = async (id: string): Promise<PalavraChave> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const palavraChave = await palavraChaveRepo.findById(id);
    if (!palavraChave) {
      throw new NotFoundError('Palavra-chave não encontrada');
    }

    return palavraChave;
  };

  const criar = async (data: { palavra: string; prazoDias: number; ativo?: boolean }): Promise<PalavraChave> => {
    // Validações
    if (!data.palavra || data.palavra.trim().length < 2) {
      throw new ValidationError('Palavra-chave deve ter pelo menos 2 caracteres');
    }

    if (!data.prazoDias || data.prazoDias < 1) {
      throw new ValidationError('Prazo deve ser de pelo menos 1 dia');
    }

    if (data.prazoDias > 3650) {
      throw new ValidationError('Prazo não pode ser maior que 10 anos (3650 dias)');
    }

    // Verificar duplicidade
    const existente = await palavraChaveRepo.findByPalavra(data.palavra.trim());
    if (existente) {
      throw new AppError('Já existe uma palavra-chave com este termo', 409);
    }

    return palavraChaveRepo.create({
      palavra: data.palavra.trim(),
      prazoDias: data.prazoDias,
      ativo: data.ativo !== undefined ? data.ativo : true,
    });
  };

  const atualizar = async (
    id: string,
    data: { palavra?: string; prazoDias?: number; ativo?: boolean }
  ): Promise<PalavraChave> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    // Verificar se existe
    const existente = await palavraChaveRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Palavra-chave não encontrada');
    }

    // Validações
    if (data.palavra !== undefined) {
      if (data.palavra.trim().length < 2) {
        throw new ValidationError('Palavra-chave deve ter pelo menos 2 caracteres');
      }

      // Verificar duplicidade se estiver alterando a palavra
      if (data.palavra.toLowerCase() !== existente.palavra.toLowerCase()) {
        const duplicada = await palavraChaveRepo.findByPalavra(data.palavra.trim());
        if (duplicada) {
          throw new AppError('Já existe uma palavra-chave com este termo', 409);
        }
      }
    }

    if (data.prazoDias !== undefined) {
      if (data.prazoDias < 1) {
        throw new ValidationError('Prazo deve ser de pelo menos 1 dia');
      }
      if (data.prazoDias > 3650) {
        throw new ValidationError('Prazo não pode ser maior que 10 anos (3650 dias)');
      }
    }

    const updated = await palavraChaveRepo.update(id, {
      ...(data.palavra !== undefined && { palavra: data.palavra.trim() }),
      ...(data.prazoDias !== undefined && { prazoDias: data.prazoDias }),
      ...(data.ativo !== undefined && { ativo: data.ativo }),
    });

    if (!updated) {
      throw new AppError('Erro ao atualizar palavra-chave', 500);
    }

    return updated;
  };

  const excluir = async (id: string): Promise<void> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await palavraChaveRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Palavra-chave não encontrada');
    }

    const deleted = await palavraChaveRepo.delete(id);
    if (!deleted) {
      throw new AppError('Erro ao excluir palavra-chave', 500);
    }
  };

  const toggleAtivo = async (id: string): Promise<PalavraChave> => {
    const existente = await buscarPorId(id);
    return atualizar(id, { ativo: !existente.ativo });
  };

  return {
    listar,
    listarAtivas,
    buscarPorId,
    criar,
    atualizar,
    excluir,
    toggleAtivo,
  };
}
