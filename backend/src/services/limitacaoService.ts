import { createLimitacaoRepository } from '../repositories/limitacaoRepository';
import { Limitacao } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export function createLimitacaoService(tenantId: string) {
  const limitacaoRepo = createLimitacaoRepository(tenantId);

  const listar = async (): Promise<Limitacao[]> => {
    return limitacaoRepo.findAll();
  };

  const listarAtivas = async (): Promise<Limitacao[]> => {
    return limitacaoRepo.findAtivas();
  };

  const buscarPorId = async (id: string): Promise<Limitacao> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const limitacao = await limitacaoRepo.findById(id);
    if (!limitacao) {
      throw new NotFoundError('Limitação não encontrada');
    }

    return limitacao;
  };

  const buscarPorIds = async (ids: string[]): Promise<Limitacao[]> => {
    return limitacaoRepo.findByIds(ids);
  };

  const criar = async (data: { texto: string; ativo?: boolean }): Promise<Limitacao> => {
    if (!data.texto || data.texto.trim().length < 20) {
      throw new ValidationError('Texto deve ter pelo menos 20 caracteres');
    }

    if (data.texto.length > 1000) {
      throw new ValidationError('Texto deve ter no máximo 1000 caracteres');
    }

    // Verificar se já existe uma limitação com o mesmo texto
    const existente = await limitacaoRepo.findByTexto(data.texto.trim());
    if (existente) {
      throw new AppError('Já existe uma limitação com este texto', 409);
    }

    const ordem = await limitacaoRepo.getNextOrdem();

    return limitacaoRepo.create({
      texto: data.texto.trim(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    });
  };

  const atualizar = async (
    id: string,
    data: { texto?: string; ativo?: boolean; ordem?: number }
  ): Promise<Limitacao> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await limitacaoRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Limitação não encontrada');
    }

    if (data.texto !== undefined && data.texto.trim().length < 20) {
      throw new ValidationError('Texto deve ter pelo menos 20 caracteres');
    }

    if (data.texto !== undefined && data.texto.length > 1000) {
      throw new ValidationError('Texto deve ter no máximo 1000 caracteres');
    }

    // Verificar se o novo texto já existe em outra limitação
    if (data.texto !== undefined) {
      const duplicado = await limitacaoRepo.findByTexto(data.texto.trim());
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe uma limitação com este texto', 409);
      }
    }

    const updateData: Partial<Limitacao> = {};
    if (data.texto !== undefined) updateData.texto = data.texto.trim();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;

    const updated = await limitacaoRepo.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar limitação');
    }

    return updated;
  };

  const excluir = async (id: string): Promise<void> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await limitacaoRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Limitação não encontrada');
    }

    await limitacaoRepo.delete(id);
  };

  const toggleAtivo = async (id: string): Promise<Limitacao> => {
    const existente = await buscarPorId(id);
    return atualizar(id, { ativo: !existente.ativo });
  };

  return {
    listar,
    listarAtivas,
    buscarPorId,
    buscarPorIds,
    criar,
    atualizar,
    excluir,
    toggleAtivo,
  };
}
