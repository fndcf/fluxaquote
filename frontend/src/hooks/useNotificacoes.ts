import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { notificacaoService, NotificacaoResumo } from '../services/notificacaoService';
import { Notificacao, PaginatedResponse } from '../types';

export function useNotificacaoResumo() {
  return useQuery<NotificacaoResumo>({
    queryKey: ['notificacaoResumo'],
    queryFn: notificacaoService.obterResumo,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}

export function useMarcarNotificacaoComoLida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificacaoService.marcarComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacaoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesNaoLidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesVencidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesAtivasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesProximasPaginadas'] });
    },
  });
}

export function useMarcarTodasNotificacoesComoLidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacaoService.marcarTodasComoLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacaoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesNaoLidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesVencidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesAtivasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesProximasPaginadas'] });
    },
  });
}

export function useExcluirNotificacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificacaoService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacaoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesNaoLidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesVencidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesAtivasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesProximasPaginadas'] });
    },
  });
}

export function useGerarNotificacoesOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orcamentoId: string) => notificacaoService.gerarParaOrcamento(orcamentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacaoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesNaoLidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesVencidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesAtivasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesProximasPaginadas'] });
    },
  });
}

export function useProcessarTodasNotificacoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacaoService.processarTodos(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacaoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesNaoLidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesVencidasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesAtivasPaginadas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoesProximasPaginadas'] });
    },
  });
}

// ========== HOOKS PAGINADOS ==========

export function useNotificacoesPaginadas(pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>({
    queryKey: ['notificacoesPaginadas', pageSize],
    queryFn: ({ pageParam }) => notificacaoService.listarPaginado(pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
}

export function useNotificacoesNaoLidasPaginadas(pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>({
    queryKey: ['notificacoesNaoLidasPaginadas', pageSize],
    queryFn: ({ pageParam }) => notificacaoService.listarNaoLidasPaginado(pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    refetchInterval: 60000,
  });
}

export function useNotificacoesVencidasPaginadas(pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>({
    queryKey: ['notificacoesVencidasPaginadas', pageSize],
    queryFn: ({ pageParam }) => notificacaoService.listarVencidasPaginado(pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
}

export function useNotificacoesAtivasPaginadas(dias: number = 60, pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>({
    queryKey: ['notificacoesAtivasPaginadas', dias, pageSize],
    queryFn: ({ pageParam }) => notificacaoService.listarAtivasPaginado(dias, pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    refetchInterval: 60000,
  });
}

export function useNotificacoesProximasPaginadas(dias: number = 30, pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>({
    queryKey: ['notificacoesProximasPaginadas', dias, pageSize],
    queryFn: ({ pageParam }) => notificacaoService.listarProximasPaginado(dias, pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
}
