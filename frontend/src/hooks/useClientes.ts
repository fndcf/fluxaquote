import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { clienteService } from '../services/clienteService';
import { Cliente } from '../types';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.listar,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useClientesPaginados(
  page: number = 1,
  limit: number = 10,
  filters?: {
    busca?: string;
  }
) {
  return useQuery({
    queryKey: ['clientes', 'paginated', page, limit, filters],
    queryFn: () => clienteService.listarPaginado(page, limit, filters),
    placeholderData: keepPreviousData, // Mantém dados anteriores enquanto carrega nova página
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para infinite scroll no dropdown de clientes
export function useClientesInfiniteScroll(
  busca?: string,
  limit: number = 20
) {
  return useInfiniteQuery({
    queryKey: ['clientes', 'infinite', busca, limit],
    queryFn: ({ pageParam }) => clienteService.listarPaginado(pageParam, limit, { busca }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Se ainda tem mais páginas, retorna o próximo número de página
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000, // 30 segundos
    placeholderData: keepPreviousData,
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clienteService.buscarPorId(id),
    enabled: !!id,
  });
}

export function usePesquisarClientes(termo: string) {
  return useQuery({
    queryKey: ['clientes', 'pesquisa', termo],
    queryFn: () => clienteService.pesquisar(termo),
    enabled: termo.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useCriarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Cliente, 'id' | 'createdAt'>) => clienteService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) =>
      clienteService.atualizar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
    },
  });
}

export function useExcluirCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clienteService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useBuscarCnpjBrasilAPI() {
  return useMutation({
    mutationFn: (cnpj: string) => clienteService.buscarCnpjBrasilAPI(cnpj),
  });
}
