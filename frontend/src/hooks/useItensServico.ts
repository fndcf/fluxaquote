import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { itemServicoService } from '../services/itemServicoService';
import { ItemServico } from '../types';

interface ItensServicoPaginadoResponse {
  itens: ItemServico[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export function useItensServico() {
  return useQuery<ItemServico[]>({
    queryKey: ['itens-servico'],
    queryFn: itemServicoService.listar,
  });
}

export function useItensServicoPorCategoria(categoriaId: string | undefined) {
  return useQuery<ItemServico[]>({
    queryKey: ['itens-servico', 'categoria', categoriaId],
    queryFn: () => itemServicoService.listarPorCategoria(categoriaId!),
    enabled: !!categoriaId,
  });
}

export function useItensServicoAtivosPorCategoria(categoriaId: string | undefined) {
  return useQuery<ItemServico[]>({
    queryKey: ['itens-servico', 'categoria', categoriaId, 'ativos'],
    queryFn: () => itemServicoService.listarAtivosPorCategoria(categoriaId!),
    enabled: !!categoriaId,
    staleTime: 5 * 60 * 1000, // 5 minutos - itens de serviço não mudam frequentemente
  });
}

export function useInfiniteItensServicoAtivos(
  categoriaId: string | undefined,
  search?: string,
  limit: number = 10
) {
  return useInfiniteQuery<ItensServicoPaginadoResponse>({
    queryKey: ['itens-servico', 'categoria', categoriaId, 'ativos', 'paginado', search],
    queryFn: ({ pageParam }) =>
      itemServicoService.listarAtivosPorCategoriaPaginado(categoriaId!, limit, pageParam as string | undefined, search),
    initialPageParam: undefined as string | undefined,
    enabled: !!categoriaId,
    staleTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useInfiniteItensServicoPorCategoria(
  categoriaId: string | undefined,
  search?: string,
  limit: number = 10
) {
  return useInfiniteQuery<ItensServicoPaginadoResponse>({
    queryKey: ['itens-servico', 'categoria', categoriaId, 'paginado', search],
    queryFn: ({ pageParam }) =>
      itemServicoService.listarPorCategoriaPaginado(categoriaId!, limit, pageParam as string | undefined, search),
    initialPageParam: undefined as string | undefined,
    enabled: !!categoriaId,
    staleTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useCriarItemServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { categoriaId: string; descricao: string; unidade: string; ativo?: boolean }) =>
      itemServicoService.criar(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itens-servico'] });
      queryClient.invalidateQueries({ queryKey: ['itens-servico', 'categoria', variables.categoriaId] });
    },
  });
}

export function useAtualizarItemServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { descricao?: string; unidade?: string; ativo?: boolean; ordem?: number } }) =>
      itemServicoService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-servico'] });
    },
  });
}

export function useToggleItemServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemServicoService.toggleAtivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-servico'] });
    },
  });
}

export function useExcluirItemServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemServicoService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-servico'] });
    },
  });
}
