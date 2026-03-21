import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriaItemService } from '../services/categoriaItemService';
import { CategoriaItem } from '../types';

export function useCategoriasItem() {
  return useQuery<CategoriaItem[]>({
    queryKey: ['categorias-item'],
    queryFn: categoriaItemService.listar,
  });
}

export function useCategoriasItemAtivas() {
  return useQuery<CategoriaItem[]>({
    queryKey: ['categorias-item-ativas'],
    queryFn: categoriaItemService.listarAtivas,
  });
}

export function useCriarCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nome: string; ativo?: boolean }) => categoriaItemService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-item'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-item-ativas'] });
    },
  });
}

export function useAtualizarCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nome?: string; ativo?: boolean; ordem?: number } }) =>
      categoriaItemService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-item'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-item-ativas'] });
    },
  });
}

export function useToggleCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriaItemService.toggleAtivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-item'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-item-ativas'] });
    },
  });
}

export function useExcluirCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriaItemService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-item'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-item-ativas'] });
    },
  });
}
