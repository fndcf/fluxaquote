import { createCategoriaItemRepository } from '../repositories/categoriaItemRepository';
import { CategoriaItem } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export function createCategoriaItemService(tenantId: string) {
  const categoriaItemRepo = createCategoriaItemRepository(tenantId);

  const listar = async (): Promise<CategoriaItem[]> => {
    return categoriaItemRepo.findAll();
  };

  const listarAtivas = async (): Promise<CategoriaItem[]> => {
    return categoriaItemRepo.findAtivas();
  };

  const buscarPorId = async (id: string): Promise<CategoriaItem> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const categoria = await categoriaItemRepo.findById(id);
    if (!categoria) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return categoria;
  };

  const criar = async (data: { nome: string; ativo?: boolean }): Promise<CategoriaItem> => {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existente = await categoriaItemRepo.findByNome(data.nome.trim());
    if (existente) {
      throw new AppError('Já existe uma categoria com este nome', 409);
    }

    const ordem = await categoriaItemRepo.getNextOrdem();

    return categoriaItemRepo.create({
      nome: data.nome.trim(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    });
  };

  const atualizar = async (
    id: string,
    data: { nome?: string; ativo?: boolean; ordem?: number }
  ): Promise<CategoriaItem> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await categoriaItemRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (data.nome !== undefined && data.nome.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    // Verificar se o novo nome já existe em outra categoria
    if (data.nome !== undefined) {
      const duplicado = await categoriaItemRepo.findByNome(data.nome.trim());
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe uma categoria com este nome', 409);
      }
    }

    const updateData: Partial<CategoriaItem> = {};
    if (data.nome !== undefined) updateData.nome = data.nome.trim();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;

    const updated = await categoriaItemRepo.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar categoria');
    }

    return updated;
  };

  const excluir = async (id: string): Promise<void> => {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await categoriaItemRepo.findById(id);
    if (!existente) {
      throw new NotFoundError('Categoria não encontrada');
    }

    await categoriaItemRepo.delete(id);
  };

  const toggleAtivo = async (id: string): Promise<CategoriaItem> => {
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
