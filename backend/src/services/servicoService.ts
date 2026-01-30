import { createServicoRepository } from '../repositories/servicoRepository';
import { Servico } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export function createServicoService(tenantId: string) {
  const servicoRepo = createServicoRepository(tenantId);

  const listar = async (): Promise<Servico[]> => {
    return servicoRepo.findAll();
  };

  const listarAtivos = async (): Promise<Servico[]> => {
    return servicoRepo.findAtivos();
  };

  const buscarPorId = async (id: string): Promise<Servico> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const servico = await servicoRepo.findById(id);
    if (!servico) {
      throw new NotFoundError('Serviço não encontrado');
    }

    return servico;
  };

  const criar = async (data: { descricao: string; ativo?: boolean }): Promise<Servico> => {
    if (!data.descricao || data.descricao.trim().length < 10) {
      throw new ValidationError('Descrição deve ter pelo menos 10 caracteres');
    }

    // Verificar se já existe um serviço com a mesma descrição
    const existente = await servicoRepo.findByDescricao(data.descricao.trim());
    if (existente) {
      throw new AppError('Já existe um serviço com esta descrição', 409);
    }

    const ordem = await servicoRepo.getNextOrdem();

    return servicoRepo.create({
      descricao: data.descricao.trim(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    });
  };

  const atualizar = async (
    id: string,
    data: { descricao?: string; ativo?: boolean; ordem?: number }
  ): Promise<Servico> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await servicoRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Serviço não encontrado');
    }

    if (data.descricao !== undefined && data.descricao.trim().length < 10) {
      throw new ValidationError('Descrição deve ter pelo menos 10 caracteres');
    }

    // Verificar se a nova descrição já existe em outro registro
    if (data.descricao !== undefined) {
      const duplicado = await servicoRepo.findByDescricao(data.descricao.trim());
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe um serviço com esta descrição', 409);
      }
    }

    const updateData: Partial<Servico> = {};
    if (data.descricao !== undefined) updateData.descricao = data.descricao.trim();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;

    const updated = await servicoRepo.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar serviço');
    }

    return updated;
  };

  const excluir = async (id: string): Promise<void> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await servicoRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Serviço não encontrado');
    }

    await servicoRepo.delete(id);
  };

  const toggleAtivo = async (id: string): Promise<Servico> => {
    const existente = await buscarPorId(id);
    return atualizar(id, { ativo: !existente.ativo });
  };

  return {
    listar,
    listarAtivos,
    buscarPorId,
    criar,
    atualizar,
    excluir,
    toggleAtivo,
  };
}
